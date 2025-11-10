from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from ultralytics import YOLO
import numpy as np
import cv2
import os
from PIL import Image
import torch
from diffusers import StableDiffusionInpaintPipeline
import httpx
import io
import traceback

app = FastAPI()

device_type = "cuda" if torch.cuda.is_available() else "cpu"

# Stable Diffusion Inpaint pipeline GPU 로드
pipe = StableDiffusionInpaintPipeline.from_pretrained(
    "stabilityai/stable-diffusion-2-inpainting",
    torch_dtype=torch.float16 if device_type == "cuda" else torch.float32
)
pipe = pipe.to(device_type)

# YOLO 모델 로드
yolo_model = YOLO('yolov8n.pt')

SAVE_DIR = "../results"
os.makedirs(SAVE_DIR, exist_ok=True)



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

        target_size = (512, 512)
        image_pil_resized = image_pil.resize(target_size, Image.LANCZOS)
        mask_pil_resized = mask_pil.resize(target_size, Image.NEAREST)

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
        try:
            resp = await client.post(AI_UPLOAD_URL, json={"s3ObjectKey": target_s3_key}, headers=headers)
            resp.raise_for_status()
            response_json = resp.json()
            # status 200 확인 및 data 반환
            if response_json.get("status") == 200 and "data" in response_json:
                return response_json["data"]
            else:
                raise HTTPException(status_code=500, detail="Invalid response structure from AI upload URL")
        except httpx.ConnectTimeout:
            print("Connection timed out while requesting AI upload URL")
            raise HTTPException(status_code=504, detail="Connection timeout to AI upload URL")
        except httpx.HTTPStatusError as e:
            print(f"HTTP error: {e.response.status_code}")
            raise HTTPException(status_code=e.response.status_code, detail="HTTP error from AI upload URL")
        except Exception as e:
            print(f"Unexpected error: {str(e)}")
            raise HTTPException(status_code=500, detail="Unexpected error from AI upload URL")


async def upload_to_s3(file_url: str, image_buffer: io.BytesIO):
    timeout = httpx.Timeout(60.0, read=60.0)
    headers = {
        "Content-Type": "image/png"
    }
    async with httpx.AsyncClient(timeout=timeout) as client:
        resp = await client.put(file_url, content=image_buffer.getvalue(), headers=headers)
        if resp.status_code not in (200, 201):
            raise HTTPException(status_code=resp.status_code, detail=f"S3 upload failed with status code {resp.status_code}")


async def notify_ai_callback(media_id: int, target_s3_key: str):
    timeout = httpx.Timeout(30.0, read=30.0)
    headers = {"X-AI-Token": AI_TOKEN}
    callback_payload = {
        "parentMediaId": str(media_id),  # 반드시 str
        "s3ObjectKey": target_s3_key,
        "fileType": "IMAGE"
    }
    async with httpx.AsyncClient(timeout=timeout) as client:
        resp = await client.post(AI_CALLBACK_URL, json=callback_payload, headers=headers)
        print(f"AI callback status: {resp.status_code}")
        print(f"AI callback body: {resp.text}")

        # 디버깅을 위해 상태코드와 응답 내용을 모두 반환
        if resp.status_code != 201 and resp.status_code != 200 :
            error_detail = f"status={resp.status_code}, response={resp.text}"
            print(f"AI callback failed: {error_detail}")
            raise HTTPException(status_code=resp.status_code, detail=f"AI callback to BE failed: {error_detail}")





@app.post("/api/v1/media/remove-person/")
async def remove_person_and_upload(request: dict):
    media_id = request.get("mediaId")
    download_url = request.get("downloadUrl")
    target_s3_key = request.get("targetAIS3Key")

    if not media_id or not download_url or not target_s3_key:
        raise HTTPException(status_code=400, detail="mediaId, downloadUrl, and targetAIS3Key are required")

    try:
        # 1. 원본 이미지 다운로드
        image = await download_image(download_url)

        height, width = image.shape[:2]
        mask = np.zeros((height, width), np.uint8)

        # 2. YOLO로 사람 탐지 후 마스크 생성
        results = yolo_model.predict(image)

        for r in results:
            for box, cls in zip(r.boxes.xyxy, r.boxes.cls):
                if int(cls) == 0:
                    box_expanded = expand_box(box, image.shape, scale=0.1)
                    x1, y1, x2, y2 = map(int, box_expanded)
                    mask[y1:y2, x1:x2] = 255

        # 3. 인페인팅
        inpainted_image = inpaint_image(image, mask)

        # 4. 메모리 버퍼에 PNG 저장
        buffer = io.BytesIO()
        inpainted_image.save(buffer, format="PNG")
        buffer.seek(0)

        # 5. BE에 AI 업로드 URL 요청
        ai_upload_data = await request_ai_upload_url(target_s3_key)
        if not ai_upload_data or ai_upload_data.get("s3ObjectKey") != target_s3_key:
            raise HTTPException(status_code=500, detail="S3 object key mismatch or missing in AI upload URL response")

        file_url = ai_upload_data.get("fileUrl")
        if not file_url:
            raise HTTPException(status_code=500, detail="fileUrl missing in AI upload URL response")

        # 6. S3에 이미지 업로드
        await upload_to_s3(file_url, buffer)

        # 7. AI 콜백 전송
        await notify_ai_callback(media_id, target_s3_key)

        return JSONResponse(content={"success": True, "message": "Person removed and uploaded successfully"})

    except HTTPException as he:
        return JSONResponse(content={"success": False, "error": he.detail}, status_code=he.status_code)
    except Exception as e:
        tb = traceback.format_exc()
        print(tb)
        return JSONResponse(content={"success": False, "error": f"{str(e)}\n{tb}"}, status_code=500)
