import os
import numpy as np
import cv2
import torch
from PIL import Image
from ultralytics import YOLO
from diffusers import StableDiffusionInpaintPipeline
from transformers import BlipProcessor, BlipForConditionalGeneration, SegformerForSemanticSegmentation, SegformerImageProcessor
import io

# --- BLIP 이미지 캡셔닝 ---
processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
caption_model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")

def extract_mood_caption(image_bytes: bytes) -> str:
    image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    inputs = processor(image, return_tensors="pt")
    output = caption_model.generate(**inputs)
    caption = processor.decode(output[0], skip_special_tokens=True)
    return caption

# --- Stable Diffusion 인페인팅 파이프라인 ---
device_type = "cuda" if torch.cuda.is_available() else "cpu"
pipe_inpaint = StableDiffusionInpaintPipeline.from_pretrained(
    "stabilityai/stable-diffusion-2-inpainting",
    torch_dtype=torch.float16 if device_type == "cuda" else torch.float32
).to(device_type)

pipe_sunset = StableDiffusionInpaintPipeline.from_pretrained(
    "runwayml/stable-diffusion-inpainting",
    torch_dtype=torch.float16,
    safety_checker=None,
).to(device_type)

# --- YOLO 객체 탐지 모델 ---
yolo_model = YOLO('yolov8n.pt')

# --- SegFormer semantic segmentation ---
seg_model_id = "nvidia/segformer-b3-finetuned-cityscapes-1024-1024"
seg_model = SegformerForSemanticSegmentation.from_pretrained(seg_model_id)
seg_processor = SegformerImageProcessor.from_pretrained(seg_model_id)


# 유틸 함수들

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
    target_size = (512, 512)
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
    blended_pil = Image.fromarray(blended_np).resize((512, 512))  # SD 입력 크기

    mask_for_inpaint = (sky_mask_clean.astype(np.uint8) * 255)
    mask_for_inpaint = cv2.GaussianBlur(mask_for_inpaint, (15, 15), 0)
    mask_img = Image.fromarray(mask_for_inpaint).convert("L").resize((512, 512))

    inpaint_result = pipe_sunset(
        prompt=prompt,
        image=blended_pil,
        mask_image=mask_img,
        guidance_scale=10.0,
        num_inference_steps=50,
    ).images[0]

    return inpaint_result
