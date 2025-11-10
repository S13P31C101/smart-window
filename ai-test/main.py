from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse, StreamingResponse
import io
import utils  # 위의 utils.py에 모든 부속 함수 포함되어 있다고 가정

import os
from dotenv import load_dotenv

load_dotenv()
app = FastAPI()
SAVE_DIR = os.getenv("SAVE_DIR", "/app/results")
os.makedirs(SAVE_DIR, exist_ok=True)

@app.post("/api/v1/media/remove-person/")
async def remove_person_and_upload(request: dict):
    media_id = request.get("mediaId")
    download_url = request.get("downloadUrl")
    target_s3_key = request.get("targetAIS3Key")
    if not media_id or not download_url or not target_s3_key:
        raise HTTPException(status_code=400, detail="mediaId, downloadUrl, and targetAIS3Key are required")
    try:
        # 1. 원본 이미지 다운로드
        image = await utils.download_image(download_url)
        height, width = image.shape[:2]
        mask = utils.np.zeros((height, width), utils.np.uint8)
        # 2. YOLO로 사람 탐지 후 마스크 생성
        results = utils.yolo_model.predict(image)
        for r in results:
            for box, cls in zip(r.boxes.xyxy, r.boxes.cls):
                if int(cls) == 0:
                    box_expanded = utils.expand_box(box, image.shape, scale=0.1)
                    x1, y1, x2, y2 = map(int, box_expanded)
                    mask[y1:y2, x1:x2] = 255
        # 3. 인페인팅
        inpainted_image = utils.inpaint_image(image, mask)
        # 4. 메모리 버퍼에 PNG 저장
        buffer = io.BytesIO()
        inpainted_image.save(buffer, format="PNG")
        buffer.seek(0)
        # 5. BE에 AI 업로드 URL 요청
        ai_upload_data = await utils.request_ai_upload_url(target_s3_key)
        if not ai_upload_data or ai_upload_data.get("s3ObjectKey") != target_s3_key:
            raise HTTPException(status_code=500, detail="S3 object key mismatch or missing in AI upload URL response")
        file_url = ai_upload_data.get("fileUrl")
        if not file_url:
            raise HTTPException(status_code=500, detail="fileUrl missing in AI upload URL response")
        # 6. S3에 이미지 업로드
        await utils.upload_to_s3(file_url, buffer)
        # 7. AI 콜백 전송
        await utils.notify_ai_callback(media_id, target_s3_key)
        return JSONResponse(content={"success": True, "message": "Person removed and uploaded successfully"})
    except HTTPException as he:
        return JSONResponse(content={"success": False, "error": he.detail}, status_code=he.status_code)
    except Exception as e:
        tb = utils.traceback.format_exc()
        print(tb)
        return JSONResponse(content={"success": False, "error": f"{str(e)}\n{tb}"}, status_code=500)

@app.post("/upload-image/")
async def upload_image(file: UploadFile = File(...)):
    contents = await file.read()
    caption = utils.extract_mood_caption(contents)
    return {"mood_caption": caption}

@app.post("/recommend-music/")
async def recommend_music(mood_caption: str = Form(...)):
    result = await utils.search_youtube_music(mood_caption + " piano music")
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

@app.post("/scene-blend/")
async def scene_blend(
    original_file: UploadFile = File(...),
    scene_type: str = Form(...),  # dawn, sunset, night, afternoon 중 하나
    alpha: float = Form(0.7)
):
    scene_type = scene_type.lower().strip()
    try:
        orig_bytes = await original_file.read()
        blend_file_path, prompt = utils.get_scene_assets(scene_type)
        inpaint_result = utils.sunset_blend_pipeline(
            orig_bytes,
            blend_file_path,
            alpha=alpha,
            prompt=prompt
        )
        buf = io.BytesIO()
        inpaint_result.save(buf, format="PNG")
        buf.seek(0)
        return StreamingResponse(buf, media_type="image/png")
    except Exception as e:
        return JSONResponse(content={"success": False, "error": str(e)}, status_code=500)
    



@app.post("/api/v1/media/removehuman-scene/")
async def removehuman_scene_and_upload(request: dict):
    media_id = request.get("mediaId")
    download_url = request.get("downloadUrl")
    target_s3_key = request.get("targetAIS3Key")
    scene_type = request.get("sceneType", "night").lower().strip()  # 기본값 night
    if not media_id or not download_url or not target_s3_key:
        raise HTTPException(status_code=400, detail="mediaId, downloadUrl, sceneType, and targetAIS3Key are required")
    try:
        # 1. 원본 이미지 다운로드
        image = await utils.download_image(download_url)
        height, width = image.shape[:2]
        mask = utils.np.zeros((height, width), utils.np.uint8)
        # 2. YOLO로 사람 탐지 후 마스크 생성
        results = utils.yolo_model.predict(image)
        for r in results:
            for box, cls in zip(r.boxes.xyxy, r.boxes.cls):
                if int(cls) == 0:
                    box_expanded = utils.expand_box(box, image.shape, scale=0.1)
                    x1, y1, x2, y2 = map(int, box_expanded)
                    mask[y1:y2, x1:x2] = 255
        # 3. 마스크 영역을 해당 scene prompt로 인페인팅
        prompt = utils.get_scene_prompt(scene_type)
        inpainted_image = utils.inpaint_image_with_prompt(image, mask, prompt)
        # 4. 메모리 버퍼에 PNG 저장
        buffer = io.BytesIO()
        inpainted_image.save(buffer, format="PNG")
        buffer.seek(0)
        # 5. BE에 AI 업로드 URL 요청
        ai_upload_data = await utils.request_ai_upload_url(target_s3_key)
        if not ai_upload_data or ai_upload_data.get("s3ObjectKey") != target_s3_key:
            raise HTTPException(status_code=500, detail="S3 object key mismatch or missing in AI upload URL response")
        file_url = ai_upload_data.get("fileUrl")
        if not file_url:
            raise HTTPException(status_code=500, detail="fileUrl missing in AI upload URL response")
        # 6. S3에 이미지 업로드
        await utils.upload_to_s3(file_url, buffer)
        # 7. AI 콜백 전송
        await utils.notify_ai_callback(media_id, target_s3_key)
        return JSONResponse(content={"success": True, "message": f"Person removed and {scene_type} scene blending uploaded successfully"})
    except HTTPException as he:
        return JSONResponse(content={"success": False, "error": he.detail}, status_code=he.status_code)
    except Exception as e:
        tb = utils.traceback.format_exc()
        print(tb)
        return JSONResponse(content={"success": False, "error": f"{str(e)}\n{tb}"}, status_code=500)
