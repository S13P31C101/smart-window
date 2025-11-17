import os
import io
import base64
import numpy as np
import cv2
import torch
import httpx
from PIL import Image
import traceback
from fastapi import FastAPI, HTTPException,Body

from dotenv import load_dotenv
from ultralytics import YOLO
from diffusers import StableDiffusionInpaintPipeline
from transformers import (
    BlipProcessor, BlipForConditionalGeneration,
    SegformerForSemanticSegmentation, SegformerImageProcessor
)
from huggingface_hub import login


# 환경 및 모델 로드
load_dotenv()
login(token=os.getenv("HUGGINGFACE_HUB_TOKEN"))
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
GMS_API_KEY = os.getenv("GMS_API_KEY")
AI_TOKEN = os.getenv("AI_TOKEN")
AI_UPLOAD_URL = os.getenv("AI_UPLOAD_URL")
AI_CALLBACK_URL = os.getenv("AI_CALLBACK_URL")

device_type = "cuda" if torch.cuda.is_available() else "cpu"

# 모델 미리 로드
processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
caption_model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")
yolo_model = YOLO('yolov8n.pt')
seg_model_id = "nvidia/segformer-b3-finetuned-cityscapes-1024-1024"
seg_model = SegformerForSemanticSegmentation.from_pretrained(seg_model_id)
seg_processor = SegformerImageProcessor.from_pretrained(seg_model_id)

pipe = StableDiffusionInpaintPipeline.from_pretrained(
    "runwayml/stable-diffusion-inpainting",
    torch_dtype=torch.float16 if device_type == "cuda" else torch.float32
).to(device_type)


# --- 유틸리티 함수들 ---

def extract_mood_caption(image_bytes: bytes) -> str:
    image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    inputs = processor(image, return_tensors="pt")
    output = caption_model.generate(**inputs)
    caption = processor.decode(output[0], skip_special_tokens=True)
    return caption

async def search_youtube_music(query: str):
    YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search"
    params = {
        "part": "snippet",
        "q": query,
        "type": "video",
        "videoCategoryId": "10",
        "maxResults": 1,
        "key": YOUTUBE_API_KEY,
        "videoDuration": "medium"  # or "long"
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

def expand_box(box, image_shape, scale=0.1):
    x1, y1, x2, y2 = box
    w = x2 - x1
    h = y2 - y1

    x1_new = max(int(x1 - w * scale), 0)
    y1_new = max(int(y1 - h * scale), 0)
    x2_new = min(int(x2 + w * scale), image_shape[1] - 1)
    y2_new = min(int(y2 + h * scale), image_shape[0] - 1)

    return x1_new, y1_new, x2_new, y2_new

def inpaint_image(image_np, mask_np):
    try:
        input_height, input_width = image_np.shape[:2]
        image_pil = Image.fromarray(cv2.cvtColor(image_np, cv2.COLOR_BGR2RGB))
        mask_pil = Image.fromarray(mask_np).convert("L")
        image_pil_resized = image_pil.resize((512, 512), Image.LANCZOS)
        mask_pil_resized = mask_pil.resize((512, 512), Image.NEAREST)
        print("Starting inpainting...")

        result = pipe(
            prompt="natural outdoor landscape, seamless realistic background",
            image=image_pil_resized,
            mask_image=mask_pil_resized,
            guidance_scale=7.5,
            num_inference_steps=50
        ).images[0]
        print("Inpainting done")
        result = result.resize((input_width, input_height), Image.LANCZOS)
        return result
    except Exception as e:
        tb = traceback.format_exc()
        print(tb)
        raise RuntimeError(f"Inpainting pipeline error: {str(e)}\n{tb}")

async def download_image(url: str) -> np.ndarray:
    timeout = httpx.Timeout(30.0, read=30.0)
    async with httpx.AsyncClient(timeout=timeout) as client:
        resp = await client.get(url)
        if resp.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to download image from downloadUrl")
        image_np = np.frombuffer(resp.content, np.uint8)
        image = cv2.imdecode(image_np, cv2.IMREAD_COLOR)
        if image is None:
            raise HTTPException(status_code=400, detail="Downloaded image is invalid or cannot be decoded")
    return image

async def request_ai_upload_url(target_s3_key: str) -> dict:
    timeout = httpx.Timeout(30.0, read=30.0)
    headers = {"X-AI-Token": AI_TOKEN}
    async with httpx.AsyncClient(timeout=timeout) as client:
        resp = await client.post(AI_UPLOAD_URL, json={"s3ObjectKey": target_s3_key}, headers=headers)
        resp.raise_for_status()
        response_json = resp.json()
        if response_json.get("status") == 200 and "data" in response_json:
            return response_json["data"]
        else:
            raise HTTPException(status_code=500, detail="Invalid response structure from AI upload URL")

async def upload_to_s3(file_url: str, image_buffer: io.BytesIO):
    timeout = httpx.Timeout(60.0, read=60.0)
    headers = {"Content-Type": "image/png"}
    async with httpx.AsyncClient(timeout=timeout) as client:
        resp = await client.put(file_url, content=image_buffer.getvalue(), headers=headers)
        if resp.status_code not in (200, 201):
            raise HTTPException(status_code=resp.status_code, detail=f"S3 upload failed with status code {resp.status_code}")

async def notify_ai_callback(media_id: int, target_s3_key: str):
    timeout = httpx.Timeout(30.0, read=30.0)
    headers = {"X-AI-Token": AI_TOKEN}
    callback_payload = {
        "parentMediaId": media_id,
        "s3ObjectKey": target_s3_key,
        "fileType": "IMAGE"
    }
    async with httpx.AsyncClient(timeout=timeout) as client:
        resp = await client.post(AI_CALLBACK_URL, json=callback_payload, headers=headers)
        print(f"AI callback status: {resp.status_code}")
        print(f"AI callback body: {resp.text}")
        if resp.status_code not in (200, 201):
            error_detail = f"status={resp.status_code}, response={resp.text}"
            print(f"AI callback failed: {error_detail}")
            raise HTTPException(status_code=resp.status_code, detail=f"AI callback to BE failed: {error_detail}")

# -------- Sunet Blending 관련 --------

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

def get_scene_assets(scene_type: str):
    """
    scene_type에 따라 blending 이미지 경로와 프롬프트를 반환
    """
    scene_configs = {
        "dawn": {
            "file_path": "assets/dawn.jpg",
            "prompt": "dawn view, early morning soft light, misty atmosphere, calm and serene"
        },
        "sunset": {
            "file_path": "assets/sunset.jpg",
            "prompt": "sunset view, warm golden hour, glowing sky, tranquil and peaceful"
        },
        "night": {
            "file_path": "assets/night.jpg",
            "prompt": "night sky, stars, quiet, peaceful and dreamy"
        },
        "afternoon": {
            "file_path": "assets/afternoon.jpg",
            "prompt": "afternoon view, bright sky, clear clouds, energetic and lively"
        }
    }
    config = scene_configs.get(scene_type)
    if config is None:
        raise ValueError(f"scene_type must be one of {list(scene_configs.keys())}")
    return config["file_path"], config["prompt"]

def sunset_blend_pipeline(original_bytes, sunset_file_path, alpha=0.7, prompt="sunset view, warm golden hour, glowing sky, tranquil and peaceful"):
    pil_img = preprocess(Image.open(io.BytesIO(original_bytes)), size=(1024, 1024))
    with open(sunset_file_path, "rb") as f:
        sunset_bytes = f.read()
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
    inpaint_result = pipe(
        prompt=prompt,
        image=blended_pil,
        mask_image=mask_img,
        guidance_scale=10.0,
        num_inference_steps=50,
    ).images[0]
    return inpaint_result





#  ------- scene-blend-s3


async def sky_mask_segformer(image_bgr: np.ndarray) -> np.ndarray:
    """
    Segformer를 이용해 sky mask (원본 해상도의 bool numpy array) 반환
    """
    pil_img = Image.fromarray(cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)).convert("RGB").resize((1024, 1024))
    inputs = seg_processor(images=pil_img, return_tensors="pt")
    seg_model.eval()
    with torch.no_grad():
        outputs = seg_model(**inputs)
        mask = torch.argmax(outputs.logits.squeeze(), dim=0).cpu().numpy()
    sky_mask = (mask == 10)
    sky_mask_resized = cv2.resize(sky_mask.astype(np.uint8), (image_bgr.shape[1], image_bgr.shape[0]), interpolation=cv2.INTER_NEAREST)
    return sky_mask_resized  # (H,W) 0/1 np.uint8

def get_scene_prompt(scene_type: str) -> str:
    scene_prompts = {
        "dawn":      "dawn view, early morning soft light, misty atmosphere, calm and serene",
        "sunset":    "sunset view, warm golden hour, glowing sky, tranquil and peaceful",
        "night":     "night sky, stars, quiet, peaceful and dreamy",
        "afternoon": "afternoon view, bright sky, clear clouds, energetic and lively",
    }
    return scene_prompts.get(scene_type, scene_prompts["night"])

def inpaint_image_with_prompt(image_np, mask_np, prompt, mask_is_sky=False):
    try:
        input_height, input_width = image_np.shape[:2]
        image_pil = Image.fromarray(cv2.cvtColor(image_np, cv2.COLOR_BGR2RGB))
        if mask_is_sky:
            mask_pil = Image.fromarray((mask_np.astype(np.uint8)*255)).convert("L")
        else:
            mask_pil = Image.fromarray(mask_np).convert("L")
        image_pil_resized = image_pil.resize((512, 512), Image.LANCZOS)
        mask_pil_resized = mask_pil.resize((512, 512), Image.NEAREST)
        print("Starting inpainting...")
        result = pipe(
            prompt=prompt,
            image=image_pil_resized,
            mask_image=mask_pil_resized,
            guidance_scale=7.5,
            num_inference_steps=50
        ).images[0]
        print("Inpainting done")
        result = result.resize((input_width, input_height), Image.LANCZOS)
        return result
    except Exception as e:
        tb = traceback.format_exc()
        print(tb)
        raise RuntimeError(f"Inpainting pipeline error: {str(e)}\n{tb}")


# --- GMS API로 이미지 생성 함수 ---

GMS_KEY = os.getenv("GMS_API_KEY")

async def gms_dalle_generate_image(prompt: str) -> str:
    url = "https://gms.ssafy.io/gmsapi/api.openai.com/v1/images/generations"
    headers = {
        "Authorization": f"Bearer {GMS_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "dall-e-3",
        "prompt": prompt,
        "size": "1024x1024"
    }
    async with httpx.AsyncClient(timeout=60.0) as client:
        resp = await client.post(url, headers=headers, json=payload)
        if resp.status_code != 200:
            print("Status:", resp.status_code)
            print("Body:", resp.text)
            raise RuntimeError("GMS DALL-E API error")
        data = resp.json()
        try:
            # OpenAI DALL-E 3 응답 구조: {'created': ..., 'data': [{'url': ...}]}
            img_url = data['data'][0]['url']
            return img_url
        except Exception as e:
            raise RuntimeError(f"이미지 파싱 실패: {e}\n전체 응답: {data}")
        
# s



def sync_download_image(url: str) -> np.ndarray:
    resp = httpx.get(url, timeout=30.0)
    resp.raise_for_status()
    image_np = np.frombuffer(resp.content, np.uint8)
    image = cv2.imdecode(image_np, cv2.IMREAD_COLOR)
    if image is None:
        raise Exception("Downloaded image invalid or decode failed")
    return image

def sync_inpaint_image(image_np, mask_np):
    input_height, input_width = image_np.shape[:2]
    image_pil = Image.fromarray(cv2.cvtColor(image_np, cv2.COLOR_BGR2RGB))
    mask_pil = Image.fromarray(mask_np).convert("L")
    image_pil_resized = image_pil.resize((512, 512), Image.LANCZOS)
    mask_pil_resized = mask_pil.resize((512, 512), Image.NEAREST)
    result = pipe(
        prompt="natural outdoor landscape, seamless realistic background",
        image=image_pil_resized,
        mask_image=mask_pil_resized,
        guidance_scale=7.5,
        num_inference_steps=50
    ).images[0]
    result = result.resize((input_width, input_height), Image.LANCZOS)
    return result

def sync_request_ai_upload_url(target_s3_key: str) -> dict:
    headers = {"X-AI-Token": AI_TOKEN}
    resp = httpx.post(AI_UPLOAD_URL, json={"s3ObjectKey": target_s3_key}, headers=headers, timeout=30.0)
    resp.raise_for_status()
    response_json = resp.json()
    if response_json.get("status") == 200 and "data" in response_json:
        return response_json["data"]
    else:
        raise Exception("Invalid response structure from AI upload URL")

def sync_upload_to_s3(file_url: str, image_buffer: io.BytesIO):
    headers = {"Content-Type": "image/png"}
    resp = httpx.put(file_url, content=image_buffer.getvalue(), headers=headers, timeout=60.0)
    if resp.status_code not in (200, 201):
        raise Exception(f"S3 upload failed with status code {resp.status_code}")

def sync_notify_ai_callback(media_id: int, target_s3_key: str):
    headers = {"X-AI-Token": AI_TOKEN}
    callback_payload = {
        "parentMediaId": str(media_id),
        "s3ObjectKey": target_s3_key,
        "fileType": "IMAGE"
    }
    resp = httpx.post(AI_CALLBACK_URL, json=callback_payload, headers=headers, timeout=30.0)
    print(f"AI callback status: {resp.status_code}, body: {resp.text}")
    if resp.status_code not in (200, 201):
        raise Exception(f"AI callback to BE failed: {resp.status_code}, {resp.text}")