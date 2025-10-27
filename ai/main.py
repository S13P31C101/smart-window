from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from ultralytics import YOLO
import cv2
import numpy as np
import os
import uuid
import torch
from torchvision import transforms
from lama_cleaner.model_manager import ModelManager

# 모델 로딩 (예시)
model_manager = ModelManager(device='cuda' if torch.cuda.is_available() else 'cpu')
lama_model = model_manager.get_model('lama')  # 'lama' 사전학습 사용

def inpaint_image_deep(image_np, mask_np):
    # 이미지, 마스크를 PIL Image로 변환
    image_pil = transforms.ToPILImage()(image_np)
    mask_pil = transforms.ToPILImage()(mask_np)
    
    # 모델 인퍼런스
    result = lama_model(image_pil, mask_pil)
    # PIL 이미지 -> np array
    result_np = np.array(result)
    return result_np


app = FastAPI()
model = YOLO('yolov8n-seg.pt')

def inpaint_image(image_np, mask_np):
    return inpaint_image_deep(image_np, mask_np)

SAVE_DIR = "results"

if not os.path.exists(SAVE_DIR):
    os.makedirs(SAVE_DIR)

@app.post("/remove-person/")
async def remove_person(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        image_np = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(image_np, cv2.IMREAD_COLOR)
        if image is None:
            return JSONResponse(content={"success": False, "error": "Invalid image"}, status_code=400)

        results = model.predict(image)
        height, width = image.shape[:2]
        mask = np.zeros((height, width), np.uint8)
        for r in results:
            if r.masks is not None:
                for seg in r.masks.data:
                    seg_img = np.array(seg, dtype=np.uint8) * 255
                    seg_img_resized = cv2.resize(seg_img, (width, height), interpolation=cv2.INTER_NEAREST)
                    mask = np.maximum(mask, seg_img_resized)

        out = inpaint_image(image, mask)
        save_path = os.path.join(SAVE_DIR, f"{uuid.uuid4().hex}_result.png")
        cv2.imwrite(save_path, out)

        return JSONResponse(content={"success": True})
    except Exception as e:
        return JSONResponse(content={"success": False, "error": str(e)}, status_code=500)
