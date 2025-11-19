import os
import uuid
import asyncio
import json
import time
from fastapi import FastAPI, Body
from fastapi.responses import JSONResponse, StreamingResponse
from dotenv import load_dotenv
import concurrent.futures
import utils

load_dotenv()
SAVE_DIR = os.getenv("SAVE_DIR", "/app/results")
os.makedirs(SAVE_DIR, exist_ok=True)

music_queue = asyncio.Queue()
main_queue = asyncio.Queue()
task_results = {}

# 음악 실행 중 여부 flag
music_in_progress = False

# CPU 코어수에 맞추기 (4~8, 실제 머신에 따라 적당히 조정)
MAX_WORKERS = min(4, os.cpu_count() or 1)
process_pool = concurrent.futures.ProcessPoolExecutor(max_workers=MAX_WORKERS)

app = FastAPI()

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

# --- 중앙 스케줄러 ---
async def scheduler_worker():
    global music_in_progress
    print("[SCHEDULER] >>> Worker started")
    while True:
        # 음악 큐/작업 진행 중이면 무조건 음악만!
        if not music_queue.empty() or music_in_progress:
            if not music_queue.empty() and not music_in_progress:
                task_id, request = await music_queue.get()
                print(f"[SCHEDULER] >>> Got MUSIC task {task_id} | Time={time.strftime('%X')}")
                music_in_progress = True
                try:
                    result = await process_music_request(request)
                    task_results[task_id] = result
                except Exception as e:
                    print(f"[SCHEDULER][ERROR] music: {e}")
                    task_results[task_id] = {"success": False, "error": str(e)}
                finally:
                    music_queue.task_done()
                    music_in_progress = False
            else:
                # music 처리 중 -> main 대기
                await asyncio.sleep(0.05)
        elif not main_queue.empty():
            task_id, task_type, req = await main_queue.get()
            print(f"[SCHEDULER] >>> Got MAIN task {task_id} ({task_type}) | Time={time.strftime('%X')}")
            try:
                result = await process_main_request(task_type, req)
                task_results[task_id] = result
            except Exception as e:
                print(f"[SCHEDULER][ERROR] main: {e}")
                task_results[task_id] = {"success": False, "error": str(e)}
            finally:
                main_queue.task_done()
        else:
            await asyncio.sleep(0.1)

@app.on_event("startup")
async def startup_event():
    print("[SYSTEM] Scheduler with music-priority!")
    asyncio.create_task(scheduler_worker())

# --- 작업별 처리 함수 ---

async def process_music_request(request):
    download_url = request.get("downloadUrl")
    print(f"[PROCESS_MUSIC] Downloading image for music from: {download_url}")
    image_bytes = await download_image_bytes(download_url)
    if not image_bytes:
        return {"success": False, "error": "Image download failed"}
    request['image_bytes'] = image_bytes

    loop = asyncio.get_running_loop()
    # 반드시 동기 함수이어야 함 (ProcessPool에서만 돌 수 있게)
    caption = await loop.run_in_executor(
        process_pool, utils.extract_mood_caption, image_bytes
    )
    print(f"[PROCESS_MUSIC] Caption: {caption}")

    query = f"{caption} piano music"
    result = await utils.search_youtube_music(query)
    if result:
        music_url = result["url"]
        await utils.notify_music_callback(
            request["mediaId"],
            str(request.get("deviceId", request.get("targetAIS3Key"))),
            music_url
        )
        return {"success": True, "message": f"Found song '{result['title']}'", "youtube_url": music_url, "mood_caption": caption}
    else:
        return {"success": False, "message": "No matching music found.", "mood_caption": caption}

async def process_main_request(task_type, req):
    loop = asyncio.get_running_loop()
    if task_type == 'remove-person':
        print(f"[PROCESS_MAIN] Start remove-person")
        result = await loop.run_in_executor(process_pool, utils.handle_remove_person, req)
    elif task_type == 'scene-blend':
        print(f"[PROCESS_MAIN] Start scene-blend")
        result = await loop.run_in_executor(process_pool, utils.handle_scene_blend, req)
    elif task_type == 'generate-dalle-image':
        print(f"[PROCESS_MAIN] Start generate-dalle-image")
        result = await utils.handle_generate_dalle_image(req)  # 이건 반드시 async라면 pool 미사용
    else:
        print(f"[PROCESS_MAIN][ERROR] Unknown task type: {task_type}")
        result = {"success": False, "error": "Unknown task type"}
    return result

# --- API ---

@app.post("/api/v1/ai/remove-person1")
async def remove_person_and_upload(request: dict = Body(...)):
    print(f"[QUEUE INPUT] remove-person request: {json.dumps(request, indent=2)}")
    global music_in_progress
    delay_count = 0
    # 음악 진행 중이면 최대 2초까지 대기(0.1초씩)
    while music_in_progress and delay_count < 20:
        print("[QUEUE INPUT] Waiting for music to finish before enqueue main...")
        await asyncio.sleep(0.1)
        delay_count += 1
    await asyncio.sleep(1)  # 기존 정책과 합치기
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

@app.post("/api/v1/ai/scene-blend1")
async def scene_blend(request: dict = Body(...)):
    print(f"[QUEUE INPUT] scene-blend request: {json.dumps(request, indent=2)}")
    global music_in_progress
    delay_count = 0
    while music_in_progress and delay_count < 20:
        print("[QUEUE INPUT] Waiting for music to finish before enqueue main...")
        await asyncio.sleep(0.1)
        delay_count += 1
    await asyncio.sleep(1)
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

@app.post("/api/v1/ai/recommend-music")
async def recommend_music(request: dict = Body(...)):
    print(f"[QUEUE INPUT] recommend-music request: {json.dumps(request, indent=2)}")
    task_id = str(uuid.uuid4())
    print(f"[QUEUE INPUT] Putting to music_queue (recommend-music) task_id={task_id}")
    await music_queue.put((task_id, request))
    return JSONResponse(content={"success": True, "task_id": task_id})

@app.post("/api/v1/ai/generate-dalle-image1")
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
