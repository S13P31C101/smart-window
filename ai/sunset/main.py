from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
import torch
from PIL import Image
import numpy as np
import torchvision.transforms as T
from transformers import SegformerForSemanticSegmentation, SegformerImageProcessor
import cv2
import io
import uuid
import os

app = FastAPI()
SAVE_DIR = "results"
os.makedirs(SAVE_DIR, exist_ok=True)

# SegFormer pretrained model (cityscapes)
model_id = "nvidia/segformer-b0-finetuned-cityscapes-512-1024"
seg_model = SegformerForSemanticSegmentation.from_pretrained(model_id)
seg_processor = SegformerImageProcessor.from_pretrained(model_id)

def preprocess(img: Image.Image):
    img = img.convert("RGB")
    img = img.resize((512, 512))
    return img

def blend_sunset_on_sky(original_img_np, sky_mask, sunset_img_pil, alpha=0.7):
    h, w = original_img_np.shape[:2]
    sunset_img_np = np.array(sunset_img_pil.resize((w, h)))
    sky_mask_3c = np.stack([sky_mask]*3, axis=-1)
    blended_img = original_img_np.copy()
    blended_img[sky_mask_3c] = (
        alpha * sunset_img_np[sky_mask_3c] + (1 - alpha) * original_img_np[sky_mask_3c]
    ).astype(np.uint8)
    return blended_img

@app.post("/sunset_blend/")
async def sunset_blend(
    original_file: UploadFile = File(...), 
    sunset_file: UploadFile = File(...),
    alpha: float = 0.7
):
    try:
        # 이미지 읽기 및 전처리
        orig_bytes = await original_file.read()
        sunset_bytes = await sunset_file.read()
        pil_img = preprocess(Image.open(io.BytesIO(orig_bytes)))
        sunset_img = Image.open(io.BytesIO(sunset_bytes)).convert("RGB")

        # 하늘 마스크 생성
        inputs = seg_processor(images=pil_img, return_tensors="pt")
        with torch.no_grad():
            outputs = seg_model(**inputs)
            mask = torch.argmax(outputs.logits.squeeze(), dim=0).cpu().numpy()
        sky_mask = (mask == 10)  # cityscapes에서 하늘 클래스 인덱스
        sky_mask_resized = cv2.resize(sky_mask.astype(np.uint8), pil_img.size, interpolation=cv2.INTER_NEAREST).astype(bool)
        # numpy 변환 후 합성
        img_np = np.array(pil_img)
        blended_np = blend_sunset_on_sky(img_np, sky_mask_resized, sunset_img, alpha=alpha)
        blended_pil = Image.fromarray(blended_np)

        # 결과 저장
        save_path = os.path.join(SAVE_DIR, f"{uuid.uuid4().hex}_sunset_blend.jpg")
        blended_pil.save(save_path)

        return {"success": True, "result_path": save_path}
    except Exception as e:
        return JSONResponse(content={"success": False, "error": str(e)}, status_code=500)
