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

# 하늘/건물 segmentation: SegFormer pretrained (cityscapes dataset)
model_id = "nvidia/segformer-b0-finetuned-cityscapes-512-1024"
seg_model = SegformerForSemanticSegmentation.from_pretrained(model_id)
seg_processor = SegformerImageProcessor.from_pretrained(model_id)

# 전처리 util (512x512 기준)
def preprocess(img: Image.Image):
    img = img.convert("RGB")
    img = img.resize((512, 512))
    return img

def apply_night_effect(img: np.ndarray, mask: np.ndarray):
    import cv2

    mask_resized = cv2.resize(mask.astype(np.uint8), (img.shape[1], img.shape[0]), interpolation=cv2.INTER_NEAREST)
    img_night = img.copy()

    sky_mask = (mask_resized == 10)
    img_night[sky_mask] = [15, 25, 40]

    building_mask = (mask_resized == 6) | (mask_resized == 7)
    img_night[building_mask] = np.clip(img_night[building_mask]*1.4, 0, 255)

    # 랜덤 마스크 한번만 생성
    rand_mask = np.random.rand(*building_mask.shape)
    bright_pixels_mask = building_mask & (rand_mask > 0.92)

    bright_noise = np.random.randint(100, 180, size=(img.shape[0], img.shape[1], 3))
    img_night[bright_pixels_mask] = bright_noise[bright_pixels_mask]

    return img_night



@app.post("/dl_night/")
async def dl_night_convert(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        pil_img = preprocess(Image.open(io.BytesIO(contents)))
        inputs = seg_processor(images=pil_img, return_tensors="pt")
        with torch.no_grad():
            outputs = seg_model(**inputs)
            mask = torch.argmax(outputs.logits.squeeze(), dim=0).cpu().numpy()
        img_np = np.array(pil_img)

        img_night = apply_night_effect(img_np, mask)
        result_img = Image.fromarray(img_night.astype(np.uint8))
        save_path = os.path.join(SAVE_DIR, f"{uuid.uuid4().hex}_night.jpg")
        result_img.save(save_path)
        return {"success": True, "result_path": save_path}
    except Exception as e:
        return JSONResponse(content={"success": False, "error": str(e)}, status_code=500)
