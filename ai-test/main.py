import os
import uuid
import asyncio
import json
import time
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
    print("[SYSTEM] Both workers launched")

# --- 보조 함수 ---
async def download_image_bytes(download_url):
    print(f"[DOWNLOAD] >> download_image_bytes called ({download_url})")
    try:
        print("[DOWNLOAD] >> Creating AsyncClient")
        async with utils.httpx.AsyncClient(timeout=30.0) as client:
            print("[DOWNLOAD] >> before GET call")
            try:
                resp = await client.get(download_url)
                print(f"[DOWNLOAD] >> after GET call, status={resp.status_code}")
            except Exception as e:
                print(f"[DOWNLOAD][EXCEPTION] in GET call: {e}")
                raise
            if resp.status_code == 200:
                print(f"[DOWNLOAD] >> Success. Bytes={len(resp.content)}")
                return resp.content
            else:
                print(f"[DOWNLOAD][ERROR] Download fail ({resp.status_code}) url={download_url}")
                return None
    except Exception as e:
        print(f"[DOWNLOAD][ERROR] Exception (outer): {e}")
        return None
    finally:
        print("[DOWNLOAD] >> Download function finished (finally block)")

# --- worker들 ---

async def music_worker():
    print("[WORKER-MUSIC] >>> Worker started")
    wake_count = 0
    while True:
        print(f"[WORKER-MUSIC] >>> Waiting for next music task... (queue size: {music_queue.qsize()})")
        task_id, request = await music_queue.get()
        wake_count += 1
        print(f"[WORKER-MUSIC] >>> Got task {task_id} | wake_count={wake_count} | Time={time.strftime('%X')}")
        try:
            print(f"[WORKER-MUSIC] >>> Processing task_id={task_id}, request keys: {list(request.keys())}")
            download_url = request.get("downloadUrl")
            print(f"[WORKER-MUSIC] >>> Downloading image from: {download_url}")
            # --- download diagnostic ---
            image_bytes = await download_image_bytes(download_url)
            if not image_bytes:
                print(f"[WORKER-MUSIC][ERROR] Image download failed for task_id={task_id}")
                task_results[task_id] = {"success": False, "error": "Image download failed (expired S3 link?)"}
                music_queue.task_done()  # 반드시 호출!
                continue
            request['image_bytes'] = image_bytes
            print(f"[WORKER-MUSIC] >>> Image download complete. Bytes: {len(image_bytes)}")
            print(f"[WORKER-MUSIC] >>> Calling handle_recommend_music")
            result = await utils.handle_recommend_music(request)
            print(f"[WORKER-MUSIC] >>> handle_recommend_music finished. Result: {result}")
            task_results[task_id] = result
            if result.get("success"):
                print(f"[WORKER-MUSIC] >>> MUSIC COMPLETE: YouTube Found → {result.get('youtube_url')}")
            else:
                print(f"[WORKER-MUSIC][ERROR] MUSIC FAIL/NO MATCH. msg:{result.get('message')}, err:{result.get('error')}")
            print(f"[WORKER-MUSIC] >>> Done: task_id={task_id} Success={result.get('success')}")
        except Exception as e:
            print(f"[WORKER-MUSIC][EXCEPTION] {task_id} Exception: {e}")
            task_results[task_id] = {"success": False, "error": str(e)}
        finally:
            print(f"[WORKER-MUSIC] >>> task_done for {task_id}, queue size now: {music_queue.qsize()}")
            music_queue.task_done()

async def main_worker():
    print("[WORKER-MAIN] >>> Worker started")
    wake_count = 0
    while True:
        print(f"[WORKER-MAIN] >>> Waiting for next main task... (queue size: {main_queue.qsize()})")
        task_id, task_type, req = await main_queue.get()
        wake_count += 1
        print(f"[WORKER-MAIN] >>> Got task {task_id} ({task_type}) | wake_count={wake_count} | Time={time.strftime('%X')}")
        try:
            print(f"[WORKER-MAIN] >>> Processing task_id={task_id}, request keys: {list(req.keys())}")
            if task_type == 'remove-person':
                loop = asyncio.get_event_loop()
                print(f"[WORKER-MAIN] >>> Start remove-person")
                result = await loop.run_in_executor(None, utils.handle_remove_person, req)
            elif task_type == 'scene-blend':
                print(f"[WORKER-MAIN] >>> Start scene-blend")
                result = await utils.handle_scene_blend(req)
            elif task_type == 'generate-dalle-image':
                print(f"[WORKER-MAIN] >>> Start generate-dalle-image")
                result = await utils.handle_generate_dalle_image(req)
            else:
                print(f"[WORKER-MAIN][ERROR] Unknown task type: {task_type}")
                result = {"success": False, "error": "Unknown task type"}
            task_results[task_id] = result
            print(f"[WORKER-MAIN] >>> Done: task_id={task_id}, Success={result.get('success')}")
        except Exception as e:
            print(f"[WORKER-MAIN][EXCEPTION] {task_id} Exception: {e}")
            task_results[task_id] = {"success": False, "error": str(e)}
        finally:
            print(f"[WORKER-MAIN] >>> task_done for {task_id}, queue size now: {main_queue.qsize()}")
            main_queue.task_done()

# --- API ---

@app.post("/api/v1/ai/remove-person")
async def remove_person_and_upload(request: dict = Body(...)):
    print(f"[QUEUE INPUT] remove-person request (pre-download put): {json.dumps(request, indent=2)}")
    download_url = request.get("downloadUrl")
    image_bytes = await download_image_bytes(download_url)
    if not image_bytes:
        print("[QUEUE INPUT][ERROR] Image download failed for remove-person")
        return JSONResponse(content={"success": False, "error": "Image download failed (expired S3 link?)"}, status_code=400)
    request['image_bytes'] = image_bytes
    task_id = str(uuid.uuid4())
    print(f"[QUEUE INPUT] Putting to main_queue (remove-person) task_id={task_id}")
    await main_queue.put((task_id, "remove-person", request))
    return JSONResponse(content={"success": True, "task_id": task_id})

@app.post("/api/v1/ai/recommend-music")
async def recommend_music(request: dict = Body(...)):
    print(f"[QUEUE INPUT] recommend-music request (pre-download put): {json.dumps(request, indent=2)}")
    task_id = str(uuid.uuid4())
    print(f"[QUEUE INPUT] Putting to music_queue (recommend-music) task_id={task_id}")
    await music_queue.put((task_id, request))
    return JSONResponse(content={"success": True, "task_id": task_id})

@app.post("/api/v1/ai/scene-blend")
async def scene_blend(request: dict = Body(...)):
    print(f"[QUEUE INPUT] scene-blend request (pre-download put): {json.dumps(request, indent=2)}")
    download_url = request.get("downloadUrl")
    image_bytes = await download_image_bytes(download_url)
    if not image_bytes:
        print("[QUEUE INPUT][ERROR] Image download failed for scene-blend")
        return JSONResponse(content={"success": False, "error": "Image download failed (expired S3 link?)"}, status_code=400)
    request['image_bytes'] = image_bytes
    task_id = str(uuid.uuid4())
    print(f"[QUEUE INPUT] Putting to main_queue (scene-blend) task_id={task_id}")
    await main_queue.put((task_id, "scene-blend", request))
    return JSONResponse(content={"success": True, "task_id": task_id})

@app.post("/api/v1/ai/generate-dalle-image")
async def generate_dalle_image_api(request: dict = Body(...)):
    print(f"[QUEUE INPUT] generate-dalle-image request: {json.dumps(request, indent=2)}")
    task_id = str(uuid.uuid4())
    print(f"[QUEUE INPUT] Putting to main_queue (generate-dalle-image) task_id={task_id}")
    await main_queue.put((task_id, "generate-dalle-image", request))
    return JSONResponse(content={"success": True, "task_id": task_id})

@app.get("/api/v1/ai/result")
async def get_task_result(task_id: str):
    print(f"[API] get_task_result called for {task_id}")
    if task_id not in task_results:
        print(f"[API][ERROR] {task_id} not found")
        return JSONResponse(content={"success": False, "error": "Result not ready or invalid task_id"}, status_code=404)
    result = task_results[task_id]
    if isinstance(result, dict) and result.get("stream"):
        resp = result["stream"]
        print(f"[API] StreamingResponse for {task_id}")
        return StreamingResponse(resp, media_type=result["media_type"])
    else:
        print(f"[API] JSONResponse for {task_id}, success={result.get('success')}")
        return JSONResponse(content=result)
