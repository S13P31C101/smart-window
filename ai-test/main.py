import os
import uuid
import asyncio
import json
from fastapi import FastAPI, Body
from fastapi.responses import JSONResponse, StreamingResponse
from dotenv import load_dotenv
import utils

load_dotenv()
SAVE_DIR = os.getenv("SAVE_DIR", "/app/results")
os.makedirs(SAVE_DIR, exist_ok=True)

music_queue = asyncio.Queue()
main_queue = asyncio.Queue()
task_results = {}

app = FastAPI()

@app.on_event("startup")
async def startup_event():
    print("[SYSTEM] Starting dedicated music and main workers...")
    asyncio.create_task(music_worker())
    asyncio.create_task(main_worker())

# ------------ 워커 정의 --------------

async def music_worker():
    while True:
        task_id, request = await music_queue.get()
        print(f"[WORKER-MUSIC] Start process for task_id={task_id}")
        print(f"[WORKER-MUSIC] Request: {json.dumps(request, indent=2)}")
        try:
            print(f"[WORKER-MUSIC] Step 1 - Caption extraction")
            # Step 1: Caption 추출 로그는 utils 내부에서 이미 print, 여기도 표시
            result = await utils.handle_recommend_music(request)
            print(f"[WORKER-MUSIC] Step 2 - YouTube search, result: {result}")

            # Step 3: 콜백 성공/실패 표시
            if result.get("success"):
                print(f"[WORKER-MUSIC] MUSIC COMPLETE: YouTube Found → {result.get('youtube_url')}")
            else:
                print(f"[WORKER-MUSIC][ERROR] MUSIC YOUTUBE FAIL or no match. Message: {result.get('message')}, error: {result.get('error')}")
            task_results[task_id] = result
            print(f"[WORKER-MUSIC] Task {task_id} done. Success={result.get('success')}")
        except Exception as e:
            print(f"[WORKER-MUSIC][EXCEPTION] {task_id} Exception: {e}")
            task_results[task_id] = {"success": False, "error": str(e)}
        finally:
            print(f"[WORKER-MUSIC] Queue task_done for {task_id}")
            music_queue.task_done()

async def main_worker():
    while True:
        task_id, task_type, req = await main_queue.get()
        print(f"[WORKER-MAIN] Handling task {task_id} ({task_type})")
        try:
            if task_type == 'remove-person':
                loop = asyncio.get_event_loop()
                print(f"[WORKER-MAIN] Start remove-person")
                result = await loop.run_in_executor(None, utils.handle_remove_person, req)
            elif task_type == 'scene-blend':
                print(f"[WORKER-MAIN] Start scene-blend")
                result = await utils.handle_scene_blend(req)
            elif task_type == 'generate-dalle-image':
                print(f"[WORKER-MAIN] Start generate-dalle-image")
                result = await utils.handle_generate_dalle_image(req)
            else:
                print(f"[WORKER-MAIN][ERROR] Unknown task type: {task_type}")
                result = {"success": False, "error": "Unknown task type"}
            task_results[task_id] = result
            print(f"[WORKER-MAIN] Task {task_id} done. Success={result.get('success')}")
        except Exception as e:
            print(f"[WORKER-MAIN][ERROR] {task_id} Exception: {e}")
            task_results[task_id] = {"success": False, "error": str(e)}
        finally:
            print(f"[WORKER-MAIN] Queue task_done for {task_id}")
            main_queue.task_done()

# ---------- 보조 함수 -------------

async def download_image_bytes(download_url):
    try:
        async with utils.httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.get(download_url)
            if resp.status_code == 200:
                print(f"[DOWNLOAD] Presigned S3 image ready (len={len(resp.content)})")
                return resp.content
            else:
                print(f"[DOWNLOAD][ERROR] Download fail ({resp.status_code}) url={download_url}")
                return None
    except Exception as e:
        print(f"[DOWNLOAD][ERROR] Exception: {e}")
        return None

# ---------- API 엔드포인트 --------------

@app.post("/api/v1/ai/remove-person")
async def remove_person_and_upload(request: dict = Body(...)):
    print("[QUEUE INPUT] remove-person request =", json.dumps(request, indent=2))
    download_url = request.get("downloadUrl")
    image_bytes = await download_image_bytes(download_url)
    if not image_bytes:
        return JSONResponse(content={"success": False, "error": "Image download failed (expired S3 link?)"}, status_code=400)
    request['image_bytes'] = image_bytes
    task_id = str(uuid.uuid4())
    await main_queue.put((task_id, "remove-person", request))
    return JSONResponse(content={"success": True, "task_id": task_id})

@app.post("/api/v1/ai/recommend-music")
async def recommend_music(request: dict = Body(...)):
    print("[QUEUE INPUT] recommend-music request =", json.dumps(request, indent=2))
    download_url = request.get("downloadUrl")
    image_bytes = await download_image_bytes(download_url)
    if not image_bytes:
        return JSONResponse(content={"success": False, "error": "Image download failed (expired S3 link?)"}, status_code=400)
    request['image_bytes'] = image_bytes
    task_id = str(uuid.uuid4())
    await music_queue.put((task_id, request))
    return JSONResponse(content={"success": True, "task_id": task_id})

@app.post("/api/v1/ai/scene-blend")
async def scene_blend(request: dict = Body(...)):
    print("[QUEUE INPUT] scene-blend request =", json.dumps(request, indent=2))
    download_url = request.get("downloadUrl")
    image_bytes = await download_image_bytes(download_url)
    if not image_bytes:
        return JSONResponse(content={"success": False, "error": "Image download failed (expired S3 link?)"}, status_code=400)
    request['image_bytes'] = image_bytes
    task_id = str(uuid.uuid4())
    await main_queue.put((task_id, "scene-blend", request))
    return JSONResponse(content={"success": True, "task_id": task_id})

@app.post("/api/v1/ai/generate-dalle-image")
async def generate_dalle_image_api(request: dict = Body(...)):
    print("[QUEUE INPUT] generate-dalle-image request =", json.dumps(request, indent=2))
    task_id = str(uuid.uuid4())
    await main_queue.put((task_id, "generate-dalle-image", request))
    return JSONResponse(content={"success": True, "task_id": task_id})

@app.get("/api/v1/ai/result")
async def get_task_result(task_id: str):
    if task_id not in task_results:
        return JSONResponse(content={"success": False, "error": "Result not ready or invalid task_id"}, status_code=404)
    result = task_results[task_id]
    if isinstance(result, dict) and result.get("stream"):
        resp = result["stream"]
        return StreamingResponse(resp, media_type=result["media_type"])
    else:
        return JSONResponse(content=result)
