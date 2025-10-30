from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
import torch
from PIL import Image
import numpy as np
import cv2
import io
import uuid
import os
from transformers import SegformerForSemanticSegmentation, SegformerImageProcessor
from diffusers import StableDiffusionInpaintPipeline

app = FastAPI()
SAVE_DIR = "results"
os.makedirs(SAVE_DIR, exist_ok=True)

# SegFormer 고품질 모델 로드 (b3, 1024x1024, cityscapes)
model_id = "nvidia/segformer-b5-finetuned-cityscapes-1024-1024"
seg_model = SegformerForSemanticSegmentation.from_pretrained(model_id)
seg_processor = SegformerImageProcessor.from_pretrained(model_id)

pipe = StableDiffusionInpaintPipeline.from_pretrained(
    "runwayml/stable-diffusion-inpainting",
    torch_dtype=torch.float16
).to("cuda")

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
    """
    마스크 영역에서 blended 이미지와 원본 이미지 색상을 alpha 가중평균으로 섞어서 컬러 유지
    """
    mask_3c = np.stack([sky_mask]*3, axis=-1)
    output_img = blended_img_np.copy()
    output_img[mask_3c] = (alpha * blended_img_np[mask_3c] + (1 - alpha) * original_img_np[mask_3c]).astype(np.uint8)
    return output_img

@app.post("/sunset_blend/")
async def sunset_blend(
    original_file: UploadFile = File(...),
    sunset_file: UploadFile = File(...),
    alpha: float = 0.7,
    prompt: str = "sunset view, natural sky transition, realistic lighting"
):
    try:
        orig_bytes = await original_file.read()
        sunset_bytes = await sunset_file.read()

        if len(orig_bytes) == 0 or len(sunset_bytes) == 0:
            return JSONResponse(content={"success": False, "error": "Empty file uploaded"}, status_code=400)

        # 1단계: 1024x1024 크기로 이미지 로드 및 전처리
        pil_img = preprocess(Image.open(io.BytesIO(orig_bytes)), size=(1024, 1024))
        sunset_img = Image.open(io.BytesIO(sunset_bytes)).convert("RGB").resize((1024, 1024))

        orig_size = (1024, 1024)

        # 2단계: 세그멘테이션
        inputs = seg_processor(images=pil_img, return_tensors="pt")
        seg_model.eval()
        with torch.no_grad():
            outputs = seg_model(**inputs)
            mask = torch.argmax(outputs.logits.squeeze(), dim=0).cpu().numpy()

        sky_mask = (mask == 10)
        sky_mask_clean = postprocess_mask(sky_mask, orig_size)

        img_np = np.array(pil_img)

        # 3단계: 노을 이미지 하늘 영역에 블렌딩
        blended_np = blend_sunset_on_sky(img_np, sky_mask_clean, sunset_img, alpha=alpha)

        # 4단계: 마스크 영역 원본 색상 일부 유지 블렌딩
        blended_np = blend_mask_colors(img_np, blended_np, sky_mask_clean, alpha=0.3)

        blended_pil = Image.fromarray(blended_np).resize((512, 512))  # SD 모델 입력 크기에 맞춤

        # 5단계: Stable Diffusion 인페인팅용 마스크 생성 (255=변경, 0=유지)
        mask_for_inpaint = (sky_mask_clean.astype(np.uint8) * 255)
        mask_img = Image.fromarray(mask_for_inpaint).convert("L").resize((512, 512))

        # 6단계: Stable Diffusion inpainting 실행
        inpaint_result = pipe(
            prompt=prompt,
            image=blended_pil,
            mask_image=mask_img,
            guidance_scale=7.5,
            num_inference_steps=50
        ).images[0]

        # 7단계: 결과 저장 및 반환
        save_path = os.path.join(SAVE_DIR, f"{uuid.uuid4().hex}_sunset_blend_refined.png")
        inpaint_result.save(save_path)

        return {"success": True, "result_path": save_path}

    except Exception as e:
        return JSONResponse(content={"success": False, "error": str(e)}, status_code=500)
