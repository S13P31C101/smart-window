import os
import io
import uuid
import asyncio
from fastapi import FastAPI, Body, HTTPException
from fastapi.responses import JSONResponse, StreamingResponse
from dotenv import load_dotenv
from PIL import Image
import utils
import json

load_dotenv()
app = FastAPI()

SAVE_DIR = os.getenv("SAVE_DIR", "/app/results")
os.makedirs(SAVE_DIR, exist_ok=True)

# 작업 큐와 결과 저장소
task_queue = asyncio.Queue()
task_results = {}

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(api_worker())

async def api_worker():
    while True:
        task_id, task_type, req = await task_queue.get()
        print(f"[WORKER] Handling task {task_id} type={task_type}")
        try:
            if task_type == 'remove-person':
                # 동기 작업이므로 run_in_executor로 처리
                loop = asyncio.get_event_loop()
                result = await loop.run_in_executor(None, utils.handle_remove_person, req)
            elif task_type == 'recommend-music':
                result = await utils.handle_recommend_music(req)
            elif task_type == 'scene-blend':
                result = await utils.handle_scene_blend(req)
            elif task_type == 'generate-dalle-image':
                result = await utils.handle_generate_dalle_image(req)
            else:
                result = {"success": False, "error": f"Unknown task type: {task_type}"}
            task_results[task_id] = result
            print(f"[WORKER] Task {task_id} completed: {result.get('success')}")
        except Exception as e:
            task_results[task_id] = {"success": False, "error": str(e)}
        finally:
            task_queue.task_done()

# ----------- API 엔드포인트 정의 ------------

@app.post("/api/v1/ai/remove-person")
async def remove_person_and_upload(request: dict = Body(...)):
    print("[QUEUE INPUT] remove-person request =")
    print(json.dumps(request, indent=2))  # 보기 좋게 출력!
    task_id = str(uuid.uuid4())
    await task_queue.put((task_id, "remove-person", request))
    return JSONResponse(content={"success": True, "task_id": task_id})

@app.post("/api/v1/ai/recommend-music")
async def recommend_music(request: dict = Body(...)):
    print("[QUEUE INPUT] recommend-music request =")
    print(json.dumps(request, indent=2))  # 보기 좋게 출력!
    task_id = str(uuid.uuid4())
    await task_queue.put((task_id, "recommend-music", request))
    return JSONResponse(content={"success": True, "task_id": task_id})

@app.post("/api/v1/ai/scene-blend")
async def scene_blend(request: dict = Body(...)):
    print("[QUEUE INPUT] scene-blend request =")
    print(json.dumps(request, indent=2))  # 보기 좋게 출력!
    task_id = str(uuid.uuid4())
    await task_queue.put((task_id, "scene-blend", request))
    print("[MODEL] scene blend inpainted, uploading...")

    return JSONResponse(content={"success": True, "task_id": task_id})

@app.post("/api/v1/ai/generate-dalle-image")
async def generate_dalle_image_api(request: dict = Body(...)):
    print("[QUEUE INPUT] generate-dalle-image request =")
    print(json.dumps(request, indent=2))  # 보기 좋게 출력!
    task_id = str(uuid.uuid4())
    await task_queue.put((task_id, "generate-dalle-image", request))
    return JSONResponse(content={"success": True, "task_id": task_id})

@app.get("/api/v1/ai/result")
async def get_task_result(task_id: str):
    if task_id not in task_results:
        return JSONResponse(content={"success": False, "error": "Result not ready or invalid task_id"}, status_code=404)
    result = task_results[task_id]
    # Streaming 방식 결과(maybe image/video) 처리:
    if isinstance(result, dict) and result.get("stream"):
        resp = result["stream"]
        return StreamingResponse(resp, media_type=result["media_type"])
    else:
        return JSONResponse(content=result)
