from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from ultralytics import YOLO
import numpy as np
import cv2
import os
import uuid
from PIL import Image
import torch

from diffusers import StableDiffusionInpaintPipeline

# CUDA 및 PyTorch 연동 확인
print("Torch version:", torch.__version__)
print("CUDA available:", torch.cuda.is_available())
print("Device count:", torch.cuda.device_count())

device_type = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Using device: {device_type}")

# Stable Diffusion Inpaint pipeline GPU 로드
pipe = StableDiffusionInpaintPipeline.from_pretrained(
    "stabilityai/stable-diffusion-2-inpainting",
    torch_dtype=torch.float16 if device_type == "cuda" else torch.float32
)
pipe = pipe.to(device_type)

# 인페인팅 함수
def inpaint_image(image_np, mask_np):
    input_height, input_width = image_np.shape[:2]
    image_pil = Image.fromarray(cv2.cvtColor(image_np, cv2.COLOR_BGR2RGB))
    mask_pil = Image.fromarray(mask_np).convert("L")

    target_size = (512, 512)
    image_pil_resized = image_pil.resize(target_size, Image.LANCZOS)
    mask_pil_resized = mask_pil.resize(target_size, Image.NEAREST)

    result = pipe(
        prompt="natural outdoor landscape, seamless realistic background",
        image=image_pil_resized,
        mask_image=mask_pil_resized,
        guidance_scale=7.5,
        num_inference_steps=50
    ).images[0]

    result = result.resize((input_width, input_height), Image.LANCZOS)
    return result

# bounding box 확대 함수: scale은 확장 비율(예: 0.1 → 10%)
def expand_box(box, image_shape, scale=0.1):
    x1, y1, x2, y2 = box
    w = x2 - x1
    h = y2 - y1

    x1_new = max(int(x1 - w * scale), 0)
    y1_new = max(int(y1 - h * scale), 0)
    x2_new = min(int(x2 + w * scale), image_shape[1] - 1)
    y2_new = min(int(y2 + h * scale), image_shape[0] - 1)

    return x1_new, y1_new, x2_new, y2_new

# YOLO 객체 탐지 모델 (기본 yolov8n)
yolo_model = YOLO('yolov8n.pt')

app = FastAPI()
SAVE_DIR = "results"
os.makedirs(SAVE_DIR, exist_ok=True)

@app.post("/remove-person/")
async def remove_person(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        image_np = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(image_np, cv2.IMREAD_COLOR)

        if image is None:
            return JSONResponse(content={"success": False, "error": "Invalid image"}, status_code=400)

        height, width = image.shape[:2]
        mask = np.zeros((height, width), np.uint8)

        results = yolo_model.predict(image)

        for r in results:
            for box, cls in zip(r.boxes.xyxy, r.boxes.cls):
                if int(cls) == 0:  # 사람 클래스만
                    box_expanded = expand_box(box, image.shape, scale=0.1)  # 10% bbox 확장
                    x1, y1, x2, y2 = map(int, box_expanded)
                    mask[y1:y2, x1:x2] = 255

        out = inpaint_image(image, mask)
        save_path = os.path.join(SAVE_DIR, f"{uuid.uuid4().hex}_result.jpg")
        out.save(save_path, format="JPEG")

        return JSONResponse(content={"success": True, "result_path": save_path})
 
    except Exception as e:
        return JSONResponse(content={"success": False, "error": str(e)}, status_code=500)
