import os
import io
import json
import gc
import cv2
import numpy as np
import torch
import httpx
import traceback
from PIL import Image
from dotenv import load_dotenv
from ultralytics import YOLO
from diffusers import StableDiffusionInpaintPipeline
from transformers import (
    BlipProcessor, BlipForConditionalGeneration,
    SegformerForSemanticSegmentation, SegformerImageProcessor
)
from huggingface_hub import login

# ----------- 환경 변수 및 모델 초기화 -----------
load_dotenv()
LOGIN_TOKEN = os.getenv("HUGGINGFACE_HUB_TOKEN")
if LOGIN_TOKEN:
    login(token=LOGIN_TOKEN)

YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
GMS_API_KEY = os.getenv("GMS_API_KEY")
AI_TOKEN = os.getenv("AI_TOKEN")
AI_UPLOAD_URL = os.getenv("AI_UPLOAD_URL")
AI_CALLBACK_URL = os.getenv("AI_CALLBACK_URL")
AI_MUSIC_CALLBACK_URL = os.getenv("AI_MUSIC_CALLBACK_URL")
GMS_KEY = os.getenv("GMS_API_KEY")

device_type = "cuda" if torch.cuda.is_available() else "cpu"

processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
caption_model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")
yolo_model = YOLO('yolov8n.pt')
seg_model_id = "nvidia/segformer-b3-finetuned-cityscapes-1024-1024"
seg_model = SegformerForSemanticSegmentation.from_pretrained(seg_model_id)
seg_processor = SegformerImageProcessor.from_pretrained(seg_model_id)

pipe = StableDiffusionInpaintPipeline.from_pretrained(
    "runwayml/stable-diffusion-inpainting",
    torch_dtype=torch.float16 if device_type == "cuda" else torch.float32
).to(device_type)

def sync_download_image(url: str) -> np.ndarray:
    print(f"[DOWNLOAD] Downloading image from {url}")
    resp = httpx.get(url, timeout=30.0)
    resp.raise_for_status()
    image_np = np.frombuffer(resp.content, np.uint8)
    image = cv2.imdecode(image_np, cv2.IMREAD_COLOR)
    if image is None:
        print(f"[DOWNLOAD][ERROR] Failed to decode image from {url}")
        raise Exception("Downloaded image invalid or decode failed")
    print(f"[DOWNLOAD] Image downloaded and decoded")
    return image

def extract_mood_caption(image_bytes: bytes) -> str:
    print("[MOOD CAPTION] Extracting caption from image bytes...")
    image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    inputs = processor(image, return_tensors="pt")
    output = caption_model.generate(**inputs)
    caption = processor.decode(output[0], skip_special_tokens=True)
    print(f"[MOOD CAPTION] Extracted: {caption}")
    return caption

import json

async def search_youtube_music(query: str):
    print(f"[YOUTUBE] Searching music for: {query}")
    YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search"
    params = {
        "part": "snippet",
        "q": query,
        "type": "video",
        "videoCategoryId": "10",        # 음악 카테고리 (실패시 주석/수정 테스트)
        "maxResults": 1,
        "key": YOUTUBE_API_KEY,
        "videoDuration": "any"       # "any"로 완화도 가능
    }
    print(f"[YOUTUBE][DEBUG] Request params: {params}")

    async with httpx.AsyncClient() as client:
        r = await client.get(YOUTUBE_SEARCH_URL, params=params)
        data = r.json()
    print(f"[YOUTUBE][DEBUG] Response keys: {list(data.keys())}")
    print(f"[YOUTUBE][DEBUG] items: {data.get('items')}")
    print(f"[YOUTUBE][DEBUG] Response JSON (part): {json.dumps(data, ensure_ascii=False)[:500]}")

    if "items" in data and len(data["items"]) > 0:
        video_id = data["items"][0]["id"]["videoId"]
        video_title = data["items"][0]["snippet"]["title"]
        video_url = f"https://www.youtube.com/watch?v={video_id}"
        print(f"[YOUTUBE] Found: {video_title}, {video_url}")
        return {"title": video_title, "url": video_url}
    else:
        print(f"[YOUTUBE][ERROR] No matching content found. Full response: {json.dumps(data, ensure_ascii=False)}")
        return None


async def notify_music_callback(media_id: int, device_id: str, music_url: str):
    import json
    print(f"[MUSIC CALLBACK] --- Preparing callback ---")
    print(f"[MUSIC CALLBACK] Target URL: {AI_MUSIC_CALLBACK_URL}")

    payload = {
        "mediaId": int(media_id),      # 반드시 int
        "deviceId": str(device_id),    # 반드시 string화
        "musicUrl": music_url
    }

    print(f"[MUSIC CALLBACK] Payload: {json.dumps(payload, indent=2)}")

    timeout = httpx.Timeout(30.0, read=30.0)
    async with httpx.AsyncClient(timeout=timeout) as client:
        resp = await client.post(AI_MUSIC_CALLBACK_URL, json=payload)
        print(f"[MUSIC_CALLBACK] Status: {resp.status_code}")
        print(f"[MUSIC_CALLBACK] Body: {resp.text}")
        if resp.status_code not in (200, 201):
            raise Exception(f"AI music callback failed: status={resp.status_code}, {resp.text}")

def expand_box(box, image_shape, scale=0.1):
    x1, y1, x2, y2 = box
    w = x2 - x1
    h = y2 - y1
    x1_new = max(int(x1 - w * scale), 0)
    y1_new = max(int(y1 - h * scale), 0)
    x2_new = min(int(x2 + w * scale), image_shape[1] - 1)
    y2_new = min(int(y2 + h * scale), image_shape[0] - 1)
    return x1_new, y1_new, x2_new, y2_new

def sync_inpaint_image(image_np, mask_np):
    print("[INPAINT] Inpainting started...")
    input_height, input_width = image_np.shape[:2]
    image_pil = Image.fromarray(cv2.cvtColor(image_np, cv2.COLOR_BGR2RGB))
    mask_pil = Image.fromarray(mask_np).convert("L")
    image_pil_resized = image_pil.resize((512, 512), Image.LANCZOS)
    mask_pil_resized = mask_pil.resize((512, 512), Image.NEAREST)
    result = pipe(
        prompt="natural outdoor landscape, seamless realistic background",
        image=image_pil_resized,
        mask_image=mask_pil_resized,
        guidance_scale=7.5,
        num_inference_steps=50
    ).images[0]
    result = result.resize((input_width, input_height), Image.LANCZOS)
    print("[INPAINT] Inpainting finished.")
    gc.collect()
    if torch.cuda.is_available():
        torch.cuda.empty_cache()
    return result

async def download_image(url: str) -> np.ndarray:
    print(f"[DOWNLOAD] (async) Downloading from {url}")
    timeout = httpx.Timeout(30.0, read=30.0)
    async with httpx.AsyncClient(timeout=timeout) as client:
        resp = await client.get(url)
        if resp.status_code != 200:
            print(f"[DOWNLOAD][ERROR] HTTP {resp.status_code}")
            raise Exception("Failed to download image from downloadUrl")
        image_np = np.frombuffer(resp.content, np.uint8)
        image = cv2.imdecode(image_np, cv2.IMREAD_COLOR)
        if image is None:
            print(f"[DOWNLOAD][ERROR] Invalid or undecodeable image")
            raise Exception("Downloaded image is invalid or cannot be decoded")
    print("[DOWNLOAD] (async) Done.")
    return image

async def request_ai_upload_url(target_s3_key: str) -> dict:
    print(f"[S3][ASYNC] Upload URL requested for key={target_s3_key}")
    timeout = httpx.Timeout(30.0, read=30.0)
    headers = {"X-AI-Token": AI_TOKEN}
    async with httpx.AsyncClient(timeout=timeout) as client:
        resp = await client.post(AI_UPLOAD_URL, json={"s3ObjectKey": target_s3_key}, headers=headers)
        resp.raise_for_status()
        response_json = resp.json()
        if response_json.get("status") == 200 and "data" in response_json:
            print(f"[S3][ASYNC] Got presigned URL.")
            return response_json["data"]
        else:
            print("[S3][ERROR] Invalid AI upload URL response")
            raise Exception("Invalid response structure from AI upload URL")

async def upload_to_s3(file_url: str, image_buffer: io.BytesIO):
    print(f"[S3][ASYNC] Uploading to S3 ({file_url}) ...")
    timeout = httpx.Timeout(60.0, read=60.0)
    headers = {"Content-Type": "image/png"}
    async with httpx.AsyncClient(timeout=timeout) as client:
        resp = await client.put(file_url, content=image_buffer.getvalue(), headers=headers)
        if resp.status_code not in (200, 201):
            print(f"[S3][ERROR] Upload failed, status code={resp.status_code}")
            raise Exception(f"S3 upload failed with status code {resp.status_code}")
    print("[S3][ASYNC] S3 upload completed.")

async def notify_ai_callback(media_id: int, target_s3_key: str):
    print(f"[CALLBACK][ASYNC] Notifying for key={target_s3_key} (media_id={media_id})")
    timeout = httpx.Timeout(30.0, read=30.0)
    headers = {"X-AI-Token": AI_TOKEN}
    callback_payload = {
        "parentMediaId": media_id,
        "s3ObjectKey": target_s3_key,
        "fileType": "IMAGE"
    }
    async with httpx.AsyncClient(timeout=timeout) as client:
        resp = await client.post(AI_CALLBACK_URL, json=callback_payload, headers=headers)
        print(f"[CALLBACK][ASYNC] Status: {resp.status_code}")
        print(f"[CALLBACK][ASYNC] Body: {resp.text}")
        if resp.status_code not in (200, 201):
            error_detail = f"status={resp.status_code}, response={resp.text}"
            raise Exception(f"AI callback to BE failed: {error_detail}")

def get_scene_prompt(scene_type: str) -> str:
    scene_prompts = {
        "dawn": "dawn view, early morning soft light, misty atmosphere, calm and serene",
        "sunset": "sunset view, warm golden hour, glowing sky, tranquil and peaceful",
        "night": "night sky, stars, quiet, peaceful and dreamy",
        "afternoon": "afternoon view, bright sky, clear clouds, energetic and lively",
    }
    chosen = scene_prompts.get(scene_type, scene_prompts["night"])
    print(f"[PROMPT] scene_type={scene_type}, prompt={chosen}")
    return chosen

async def sky_mask_segformer(image_bgr: np.ndarray) -> np.ndarray:
    print("[SKY MASK] SegFormer working...")
    pil_img = Image.fromarray(cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)).convert("RGB").resize((1024, 1024))
    inputs = seg_processor(images=pil_img, return_tensors="pt")
    seg_model.eval()
    with torch.no_grad():
        outputs = seg_model(**inputs)
        mask = torch.argmax(outputs.logits.squeeze(), dim=0).cpu().numpy()
    sky_mask = (mask == 10)
    sky_mask_resized = cv2.resize(sky_mask.astype(np.uint8), (image_bgr.shape[1], image_bgr.shape[0]), interpolation=cv2.INTER_NEAREST)
    print("[SKY MASK] Mask extraction complete.")
    return sky_mask_resized

def inpaint_image_with_prompt(image_np, mask_np, prompt, mask_is_sky=False):
    try:
        print(f"[INPAINT] Started (mask_is_sky={mask_is_sky})")
        input_height, input_width = image_np.shape[:2]
        image_pil = Image.fromarray(cv2.cvtColor(image_np, cv2.COLOR_BGR2RGB))
        if mask_is_sky:
            mask_pil = Image.fromarray((mask_np.astype(np.uint8)*255)).convert("L")
        else:
            mask_pil = Image.fromarray(mask_np).convert("L")
        print(f"[INPAINT] image_pil size={image_pil.size}, mask_pil size={mask_pil.size}")
        image_pil_resized = image_pil.resize((512, 512), Image.LANCZOS)
        mask_pil_resized = mask_pil.resize((512, 512), Image.NEAREST)
        print(f"[INPAINT] Resized -> image: {image_pil_resized.size}, mask: {mask_pil_resized.size}")
        print(f"[INPAINT] Prompt: {prompt[:100]} ...")
        print("[INPAINT] Calling StableDiffusionInpaintPipeline...")
        result = pipe(
            prompt=prompt,
            image=image_pil_resized,
            mask_image=mask_pil_resized,
            guidance_scale=7.5,
            num_inference_steps=50
        ).images[0]
        print("[INPAINT] Done.")
        result = result.resize((input_width, input_height), Image.LANCZOS)
        gc.collect()
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        return result
    except Exception as e:
        tb = traceback.format_exc()
        print("[INPAINT][ERROR]", tb)
        raise

async def gms_dalle_generate_image(prompt: str) -> str:
    print(f"[DALLE] Generating image for prompt: {prompt}")
    url = "https://gms.ssafy.io/gmsapi/api.openai.com/v1/images/generations"
    headers = {
        "Authorization": f"Bearer {GMS_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "dall-e-3",
        "prompt": prompt,
        "size": "1024x1024"
    }
    async with httpx.AsyncClient(timeout=60.0) as client:
        resp = await client.post(url, headers=headers, json=payload)
        if resp.status_code != 200:
            print(f"[DALLE][ERROR] Status={resp.status_code}, body={resp.text}")
            raise Exception("GMS DALL-E API error")
        data = resp.json()
        try:
            img_url = data['data'][0]['url']
            print(f"[DALLE] Image generated, url={img_url}")
            return img_url
        except Exception as e:
            print(f"[DALLE][ERROR] Parse failed, data={data}")
            raise Exception(f"이미지 파싱 실패: {e}\n전체 응답: {data}")

def handle_remove_person(request):
    import base64
    print("[HANDLE] handle_remove_person:", json.dumps({k: v if k!="image_bytes" else f"<{len(v)} bytes>" for k,v in request.items()}, indent=2))
    media_id = request.get("mediaId")
    target_s3_key = request.get("targetAIS3Key")
    image_bytes = request.get("image_bytes")
    if not media_id or not image_bytes or not target_s3_key:
        return {"success": False, "error": "mediaId, image_bytes, and targetAIS3Key are required"}
    try:
        img_np = cv2.imdecode(np.frombuffer(image_bytes, np.uint8), cv2.IMREAD_COLOR)
        height, width = img_np.shape[:2]
        mask = np.zeros((height, width), np.uint8)
        results = yolo_model.predict(img_np)
        for r in results:
            for box, cls in zip(r.boxes.xyxy, r.boxes.cls):
                if int(cls) == 0:
                    box_expanded = expand_box(box, img_np.shape, scale=0.1)
                    x1, y1, x2, y2 = map(int, box_expanded)
                    mask[y1:y2, x1:x2] = 255
        inpainted = sync_inpaint_image(img_np, mask)
        buffer = io.BytesIO()
        inpainted.save(buffer, format="PNG")
        buffer.seek(0)
        ai_upload_data = sync_request_ai_upload_url(target_s3_key)
        if not ai_upload_data or ai_upload_data.get("s3ObjectKey") != target_s3_key:
            return {"success": False, "error": "S3 object key mismatch or missing in AI upload URL response"}
        file_url = ai_upload_data.get("fileUrl")
        if not file_url:
            return {"success": False, "error": "fileUrl missing in AI upload URL response"}
        sync_upload_to_s3(file_url, buffer)
        sync_notify_ai_callback(media_id, target_s3_key)
        gc.collect()
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        return {"success": True, "result_s3_key": target_s3_key, "result_s3_url": file_url}
    except Exception as e:
        tb = traceback.format_exc()
        print(f"[HANDLE][ERROR] {tb}")
        return {"success": False, "error": str(e), "traceback": tb}

async def handle_recommend_music(request):
    print("[HANDLE] handle_recommend_music:", json.dumps({k: v if k!="image_bytes" else f"<{len(v)} bytes>" for k,v in request.items()}, indent=2))
    image_bytes = request.get("image_bytes")
    media_id = request.get("mediaId")
    device_id = request.get("deviceId") or request.get("targetAIS3Key")
    if not image_bytes or not media_id or not device_id:
        return {"success": False, "error": "image_bytes, mediaId, deviceId are required"}
    try:
        caption = extract_mood_caption(image_bytes)
        result = await search_youtube_music(caption + " piano music")
        if result:
            music_url = result["url"]
            await notify_music_callback(media_id, device_id, music_url)
            return {"success": True, "message": f"Found song '{result['title']}'", "youtube_url": music_url, "mood_caption": caption}
        else:
            return {"success": False, "message": "No matching music found.", "mood_caption": caption}
    except Exception as e:
        tb = traceback.format_exc()
        print(f"[HANDLE][ERROR] {tb}")
        return {"success": False, "error": str(e), "traceback": tb}

async def handle_scene_blend(request):
    print("[HANDLE] handle_scene_blend:", json.dumps({k: v if k!="image_bytes" else f"<{len(v)} bytes>" for k,v in request.items()}, indent=2))
    media_id = request.get("mediaId")
    target_s3_key = request.get("targetAIS3Key")
    scene_type = (request.get("sceneType") or "night").lower().strip()
    image_bytes = request.get("image_bytes")
    if not media_id or not image_bytes or not target_s3_key or not scene_type:
        return {"success": False, "error": "mediaId, image_bytes, sceneType, and targetAIS3Key are required"}
    try:
        img_np = cv2.imdecode(np.frombuffer(image_bytes, np.uint8), cv2.IMREAD_COLOR)
        sky_mask = await sky_mask_segformer(img_np)
        prompt = get_scene_prompt(scene_type)
        result = inpaint_image_with_prompt(img_np, sky_mask, prompt, mask_is_sky=True)
        buffer = io.BytesIO()
        result.save(buffer, format="PNG")
        buffer.seek(0)
        ai_upload_data = await request_ai_upload_url(target_s3_key)
        if not ai_upload_data or ai_upload_data.get("s3ObjectKey") != target_s3_key:
            return {"success": False, "error": "S3 object key mismatch or missing in AI upload URL response"}
        file_url = ai_upload_data.get("fileUrl")
        if not file_url:
            return {"success": False, "error": "fileUrl missing in AI upload URL response"}
        await upload_to_s3(file_url, buffer)
        await notify_ai_callback(media_id, target_s3_key)
        gc.collect()
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        return {"success": True, "result_s3_key": target_s3_key, "result_s3_url": file_url}
    except Exception as e:
        tb = traceback.format_exc()
        print(f"[HANDLE][ERROR] {tb}")
        return {"success": False, "error": str(e), "traceback": tb}

async def handle_generate_dalle_image(request):
    print("[HANDLE] handle_generate_dalle_image:", json.dumps(request, indent=2))
    prompt = request.get("prompt")
    if not prompt or not isinstance(prompt, str):
        return {"success": False, "error": "prompt is required as non-empty text."}
    try:
        img_url = await gms_dalle_generate_image(prompt)
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.get(img_url)
            if resp.status_code != 200:
                print(f"[DALLE][ERROR] Download failed")
                return {"success": False, "error": "이미지 다운로드 실패"}
            img_bytes = resp.content
        buf = io.BytesIO(img_bytes)
        try:
            img = Image.open(buf)
            out_buf = io.BytesIO()
            img.save(out_buf, format="PNG")
            out_buf.seek(0)
            return {"success": True, "stream": out_buf, "media_type": "image/png"}
        except Exception:
            buf.seek(0)
            return {"success": True, "stream": buf, "media_type": "image/png"}
    except Exception as e:
        tb = traceback.format_exc()
        print(f"[DALLE][ERROR] {tb}")
        return {"success": False, "error": str(e), "traceback": tb}

def sync_request_ai_upload_url(target_s3_key: str) -> dict:
    print(f"[S3] Requesting presigned upload URL for key={target_s3_key}")
    headers = {"X-AI-Token": AI_TOKEN}
    resp = httpx.post(AI_UPLOAD_URL, json={"s3ObjectKey": target_s3_key}, headers=headers, timeout=30.0)
    resp.raise_for_status()
    response_json = resp.json()
    if response_json.get("status") == 200 and "data" in response_json:
        print(f"[S3] Presigned URL acquired.")
        return response_json["data"]
    else:
        print(f"[S3][ERROR] Invalid response: {response_json}")
        raise Exception("Invalid response structure from AI upload URL")

def sync_upload_to_s3(file_url: str, image_buffer: io.BytesIO):
    print(f"[S3] Uploading to {file_url} ...")
    headers = {"Content-Type": "image/png"}
    resp = httpx.put(file_url, content=image_buffer.getvalue(), headers=headers, timeout=60.0)
    if resp.status_code not in (200, 201):
        print(f"[S3][ERROR] Upload returned: {resp.status_code}")
        raise Exception(f"S3 upload failed with status code {resp.status_code}")
    print(f"[S3] Upload complete.")

def sync_notify_ai_callback(media_id: int, target_s3_key: str):
    print(f"[CALLBACK] Notifying BE for key={target_s3_key} (media_id={media_id})...")
    headers = {"X-AI-Token": AI_TOKEN}
    callback_payload = {
        "parentMediaId": media_id,
        "s3ObjectKey": target_s3_key,
        "fileType": "IMAGE"
    }
    resp = httpx.post(AI_CALLBACK_URL, json=callback_payload, headers=headers, timeout=30.0)
    print(f"[CALLBACK] Status: {resp.status_code}, body: {resp.text}")
    if resp.status_code not in (200, 201):
        raise Exception(f"AI callback to BE failed: {resp.status_code}, {resp.text}")
