from fastapi import FastAPI, File, UploadFile, Form, Header,Request
from fastapi.responses import JSONResponse, StreamingResponse
from dotenv import load_dotenv
import os
import io
import utils
    
load_dotenv()
app = FastAPI()
SAVE_DIR = os.getenv("SAVE_DIR", "/app/results")
os.makedirs(SAVE_DIR, exist_ok=True)


from fastapi import APIRouter, File, UploadFile, Form
from fastapi.responses import StreamingResponse, JSONResponse
import io
import numpy as np
import cv2
from PIL import Image
from ultralytics import YOLO
import utils

gms_router = APIRouter(prefix="/gms")
yolo_model = YOLO('yolov8n.pt')

from fastapi import APIRouter, Form
from fastapi.responses import StreamingResponse, JSONResponse
import io
import utils

gms_router = APIRouter(prefix="/gms")

@gms_router.post("/generate-image/gemizni2", summary="GMS Gemini 2.0 Flash로 이미지 생성")
async def generate_image_gemini2(
    prompt: str = Form("Hi, can you create a 3d rendered image of a pig with wings and a top hat flying over a happy futuristic scifi city with lots of greenery?")
):
    try:
        result_img = await utils.gms_gemini2_flash_generate_image(prompt)
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

    buf = io.BytesIO()
    result_img.save(buf, format="PNG")
    buf.seek(0)
    return StreamingResponse(buf, media_type="image/png")

app.include_router(gms_router)

@app.post("/api/v1/media/ai-request")
async def ai_request(
    mediaId: int = Form(...),
    downloadUrl: str = Form(...),
    targetAIS3Key: str = Form(...),
):
    try:
        async def remove_person_pipeline(original_bytes, **_):
            image_np = np.frombuffer(original_bytes, np.uint8)
            if image_np.size == 0:
                raise Exception("Downloaded image file is empty or invalid")
            image = cv2.imdecode(image_np, cv2.IMREAD_COLOR)
            if image is None:
                raise Exception("Invalid image format or corrupted")
            height, width = image.shape[:2]
            mask = np.zeros((height, width), np.uint8)
            results = utils.yolo_model.predict(image)
            for r in results:
                for box, cls in zip(r.boxes.xyxy, r.boxes.cls):
                    if int(cls) == 0:  # person class
                        box_expanded = utils.expand_box(box, image.shape, scale=0.1)
                        x1, y1, x2, y2 = map(int, box_expanded)
                        mask[y1:y2, x1:x2] = 255
            out = utils.inpaint_image(image, mask)
            return out

        # ai_token 대신 빈 문자열 & 헤더 없이 파이프라인 수행
        result = await utils.ai_image_pipeline(
            media_id=mediaId,
            download_url=downloadUrl,
            target_ai_s3_key=targetAIS3Key,
            file_type="IMAGE",
            process_fn=remove_person_pipeline,
            process_args={},
        )
        return result

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.post("/upload-image/")
async def upload_image(file: UploadFile = File(...)):
    contents = await file.read()
    caption = utils.extract_mood_caption(contents)
    return {"mood_caption": caption}

@app.post("/recommend-music/")
async def recommend_music(mood_caption: str = Form(...)):
    """
    캡션(분위기 문장)을 받고 YouTube Data API로 음악 영상 검색 후 재생 URL 반환
    """
    result = await utils.search_youtube_music(mood_caption +" piano music")
    if result:
        return {"message": f"Found song '{result['title']}'", "youtube_url": result["url"]}
    else:
        return {"message": "No matching music found."}





@app.post("/remove-person/")
async def remove_person(file: UploadFile = File(...)):
    contents = await file.read()
    image_np = utils.np.frombuffer(contents, utils.np.uint8)
    image = utils.cv2.imdecode(image_np, utils.cv2.IMREAD_COLOR)
    if image is None:
        return JSONResponse(status_code=400, content={"error": "Invalid image"})
    height, width = image.shape[:2]
    mask = utils.np.zeros((height, width), utils.np.uint8)
    results = utils.yolo_model.predict(image)
    for r in results:
        for box, cls in zip(r.boxes.xyxy, r.boxes.cls):
            if int(cls) == 0:
                box_expanded = utils.expand_box(box, image.shape, scale=0.1)
                x1, y1, x2, y2 = map(int, box_expanded)
                mask[y1:y2, x1:x2] = 255
    out = utils.inpaint_image(image, mask)
    buf = io.BytesIO()
    out.save(buf, format="PNG")
    buf.seek(0)
    return StreamingResponse(buf, media_type="image/png")

@app.post("/sunset-blend/")
async def sunset_blend(
    original_file: UploadFile = File(...),
    sunset_file: UploadFile = File(...),
    alpha: float = 0.7,
    prompt: str = "sunset view, warm golden hour, glowing sky, tranquil and peaceful"
):
    try:
        print("hello")
        orig_bytes = await original_file.read()
        sunset_bytes = await sunset_file.read()
        if len(orig_bytes) == 0 or len(sunset_bytes) == 0:
            return JSONResponse(content={"success": False, "error": "Empty file uploaded"}, status_code=400)
        inpaint_result = utils.sunset_blend_pipeline(orig_bytes, sunset_bytes, alpha=alpha, prompt=prompt)
        buf = io.BytesIO()
        inpaint_result.save(buf, format="PNG")
        buf.seek(0)
        return StreamingResponse(buf, media_type="image/png")
    except Exception as e:
        return JSONResponse(content={"success": False, "error": str(e)}, status_code=500)
