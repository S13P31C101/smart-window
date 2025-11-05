import os
from fastapi import FastAPI, File, UploadFile, Header
from fastapi.responses import JSONResponse, FileResponse
import numpy as np
import cv2
from PIL import Image
from fastapi.responses import StreamingResponse
import io
import utils  # 위 utils.py 가 같은 경로에 있어야 함

import uuid

app = FastAPI()
SAVE_DIR = os.getenv("SAVE_DIR", "/app/results")
os.makedirs(SAVE_DIR, exist_ok=True)


@app.post("/upload-image/")
async def upload_image(file: UploadFile = File(...)):
    contents = await file.read()
    caption = utils.extract_mood_caption(contents)
    return {"mood_caption": caption}


@app.post("/recommend-music/")
async def recommend_music(mood_caption: str = Header(...)):
    result = await utils.search_youtube_music(mood_caption + " piano music")
    if result:
        return {"message": f"Found song '{result['title']}'", "youtube_url": result["url"]}
    else:
        return {"message": "No matching music found."}



@app.post("/remove-person/")
async def remove_person(file: UploadFile = File(...)):
    contents = await file.read()
    image_np = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(image_np, cv2.IMREAD_COLOR)

    if image is None:
        return JSONResponse(status_code=400, content={"error": "Invalid image"})

    height, width = image.shape[:2]
    mask = np.zeros((height, width), np.uint8)

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






@app.post("/sunset_blend/")
async def sunset_blend(
    original_file: UploadFile = File(...),
    sunset_file: UploadFile = File(...),
    alpha: float = 0.7,
    prompt: str = "dawn view, early morning soft light, misty atmosphere, calm and serene"
):
    try:
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

