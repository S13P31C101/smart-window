import os
import numpy as np
import cv2
import torch
from PIL import Image
from ultralytics import YOLO
from diffusers import StableDiffusionInpaintPipeline
from transformers import BlipProcessor, BlipForConditionalGeneration, SegformerForSemanticSegmentation, SegformerImageProcessor
import io
import httpx
from dotenv import load_dotenv
import base64



load_dotenv()

# BLIP 이미지 캡셔닝 모델
processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
caption_model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")

def extract_mood_caption(image_bytes: bytes) -> str:
    image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    inputs = processor(image, return_tensors="pt")
    output = caption_model.generate(**inputs)
    caption = processor.decode(output[0], skip_special_tokens=True)
    return caption

# YouTube 추천 (API 키는 .env에서)
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search"

import os
import base64
import io
import httpx
from PIL import Image

GMS_API_KEY = os.getenv("GMS_API_KEY")

def resize_pil(img, size=(512, 512)):
    return img.resize(size, Image.LANCZOS)

import os
import httpx
import io
from PIL import Image
import base64

GMS_API_KEY = os.getenv("GMS_API_KEY")

async def gms_gemini2_flash_generate_image(prompt: str):
    url = f"https://gms.ssafy.io/gmsapi/generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key={GMS_API_KEY}"
    headers = {
        "Content-Type": "application/json"
    }
    payload = {
        "contents": [
            {
                "parts": [{"text": prompt}]
            }
        ],
        "generationConfig": {
            "responseModalities": ["Text", "Image"]
        }
    }
    async with httpx.AsyncClient() as client:
        r = await client.post(url, headers=headers, json=payload)
        print("응답코드:", r.status_code)
        print("응답컨텐츠:", r.text[:500])
        data = r.json()

    # 이미지 반환 (Gemini의 응답 구조에 따라 맞춤 파싱 필요)
    try:
        # 기본 응답 예시 기준(실제 구조와 다르면 수정 필요)
        image_b64 = data["candidates"][0]["content"]["parts"][1]["inlineData"]["data"]
    except Exception as e:
        raise RuntimeError(f"Gemini 응답 파싱 오류: {e}\n전체: {data}")

    result_img = Image.open(io.BytesIO(base64.b64decode(image_b64)))
    return result_img


async def search_youtube_music(query: str):
    params = {
        "part": "snippet",
        "q": query,
        "type": "video",
        "videoCategoryId": "10",  # 음악 카테고리
        "maxResults": 1,
        "key": YOUTUBE_API_KEY
    }
    async with httpx.AsyncClient() as client:
        r = await client.get(YOUTUBE_SEARCH_URL, params=params)
        data = r.json()
    if "items" in data and len(data["items"]) > 0:
        video_id = data["items"][0]["id"]["videoId"]
        video_title = data["items"][0]["snippet"]["title"]
        video_url = f"https://www.youtube.com/watch?v={video_id}"
        return {"title": video_title, "url": video_url}
    else:
        return None

# --- Stable Diffusion inpainting 등 기존 코드 계속 아래...
device_type = "cuda" if torch.cuda.is_available() else "cpu"
pipe_inpaint = StableDiffusionInpaintPipeline.from_pretrained(
    "stabilityai/stable-diffusion-2-inpainting",
    torch_dtype=torch.float16 if device_type == "cuda" else torch.float32
).to(device_type)

pipe_sunset = StableDiffusionInpaintPipeline.from_pretrained(
    "runwayml/stable-diffusion-inpainting",
    torch_dtype=torch.float16 if device_type == "cuda" else torch.float32,
    safety_checker=None,
).to(device_type)

yolo_model = YOLO('yolov8n.pt')
seg_model_id = "nvidia/segformer-b3-finetuned-cityscapes-1024-1024"
seg_model = SegformerForSemanticSegmentation.from_pretrained(seg_model_id)
seg_processor = SegformerImageProcessor.from_pretrained(seg_model_id)

def expand_box(box, image_shape, scale=0.1):
    x1, y1, x2, y2 = box
    h, w = image_shape[:2]
    w_box, h_box = x2 - x1, y2 - y1
    x1_new = max(int(x1 - w_box * scale), 0)
    y1_new = max(int(y1 - h_box * scale), 0)
    x2_new = min(int(x2 + w_box * scale), w - 1)
    y2_new = min(int(y2 + h_box * scale), h - 1)
    return x1_new, y1_new, x2_new, y2_new

def inpaint_image(image_np, mask_np):
    input_height, input_width = image_np.shape[:2]
    image_pil = Image.fromarray(cv2.cvtColor(image_np, cv2.COLOR_BGR2RGB))
    mask_pil = Image.fromarray(mask_np).convert("L")
    target_size = (384, 384)
    image_resized = image_pil.resize(target_size, Image.LANCZOS)
    mask_resized = mask_pil.resize(target_size, Image.NEAREST)
    result = pipe_inpaint(
        prompt="natural outdoor landscape, seamless realistic background",
        image=image_resized,
        mask_image=mask_resized,
        guidance_scale=7.5,
        num_inference_steps=50
    ).images[0]
    result = result.resize((input_width, input_height), Image.LANCZOS)
    return result

def preprocess(img: Image.Image, size=(1024, 1024)):
    img = img.convert("RGB")
    img = img.resize(size)
    return img

def postprocess_mask(mask_np, size):
    width, height = size
    mask_resized = cv2.resize(mask_np.astype(np.uint8), (width, height), interpolation=cv2.INTER_NEAREST)
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    mask_closed = cv2.morphologyEx(mask_resized, cv2.MORPH_CLOSE, kernel)
    mask_opened = cv2.morphologyEx(mask_closed, cv2.MORPH_OPEN, kernel)
    return mask_opened.astype(bool)

def blend_sunset_on_sky(original_img_np, sky_mask, sunset_img_pil, alpha=0.7):
    h, w = original_img_np.shape[:2]
    sunset_img_resized = sunset_img_pil.resize((w, h))
    sunset_img_np = np.array(sunset_img_resized)
    sky_mask_3c = np.stack([sky_mask]*3, axis=-1)
    blended_img = original_img_np.copy()
    blended_img[sky_mask_3c] = (
        alpha * sunset_img_np[sky_mask_3c] + (1 - alpha) * original_img_np[sky_mask_3c]
    ).astype(np.uint8)
    return blended_img

def blend_mask_colors(original_img_np, blended_img_np, sky_mask, alpha=0.3):
    mask_3c = np.stack([sky_mask]*3, axis=-1)
    output_img = blended_img_np.copy()
    output_img[mask_3c] = (alpha * blended_img_np[mask_3c] + (1 - alpha) * original_img_np[mask_3c]).astype(np.uint8)
    return output_img

def sunset_blend_pipeline(original_bytes, sunset_bytes, alpha=0.7, prompt="dawn view, early morning soft light, misty atmosphere, calm and serene"):
    pil_img = preprocess(Image.open(io.BytesIO(original_bytes)), size=(1024, 1024))
    sunset_img = Image.open(io.BytesIO(sunset_bytes)).convert("RGB").resize((1024, 1024))
    orig_size = (1024, 1024)
    inputs = seg_processor(images=pil_img, return_tensors="pt")
    seg_model.eval()
    with torch.no_grad():
        outputs = seg_model(**inputs)
        mask = torch.argmax(outputs.logits.squeeze(), dim=0).cpu().numpy()
    sky_mask = (mask == 10)
    sky_mask_clean = postprocess_mask(sky_mask, orig_size)
    img_np = np.array(pil_img)
    blended_np = blend_sunset_on_sky(img_np, sky_mask_clean, sunset_img, alpha=alpha)
    blended_np = blend_mask_colors(img_np, blended_np, sky_mask_clean, alpha=0.3)
    blended_pil = Image.fromarray(blended_np).resize((384, 384))
    mask_for_inpaint = (sky_mask_clean.astype(np.uint8) * 255)
    mask_for_inpaint = cv2.GaussianBlur(mask_for_inpaint, (15, 15), 0)
    mask_img = Image.fromarray(mask_for_inpaint).convert("L").resize((384, 384))
    inpaint_result = pipe_sunset(
        prompt=prompt,
        image=blended_pil,
        mask_image=mask_img,
        guidance_scale=10.0,
        num_inference_steps=50,
    ).images[0]
    return inpaint_result
