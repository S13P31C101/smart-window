from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import JSONResponse
from transformers import BlipProcessor, BlipForConditionalGeneration
import torch
from PIL import Image
import io
import httpx
from dotenv import load_dotenv
import os

load_dotenv()  # .env 파일 내용 로드

app = FastAPI()

# BLIP 캡셔닝 모델 로드 (분위기 문장 생성용)
processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")

# YouTube Data API 키 (Google Cloud Platform에서 발급 필요)
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")  # 환경변수로부터 읽기
YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search"

def extract_mood_caption(image_bytes: bytes) -> str:
    image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    inputs = processor(image, return_tensors="pt")
    output = model.generate(**inputs)
    caption = processor.decode(output[0], skip_special_tokens=True)
    return caption

async def search_youtube_music(query: str):
    params = {
        "part": "snippet",
        "q": query,
        "type": "video",
        "videoCategoryId": "10",  # 음악 카테고리
        "maxResults": 1,
        "key": YOUTUBE_API_KEY
    }
    async with httpx.AsyncClient() as client:
        r = await client.get(YOUTUBE_SEARCH_URL, params=params)
        data = r.json()
    if "items" in data and len(data["items"]) > 0:
        video_id = data["items"][0]["id"]["videoId"]
        video_title = data["items"][0]["snippet"]["title"]
        video_url = f"https://www.youtube.com/watch?v={video_id}"
        return {"title": video_title, "url": video_url}
    else:
        return None

@app.post("/upload-image/")
async def upload_image(file: UploadFile = File(...)):
    contents = await file.read()
    caption = extract_mood_caption(contents)
    # 간단하게 캡션을 키워드처럼 반환, 필요시 NLP 처리 추가 가능
    return {"mood_caption": caption}

@app.post("/recommend-music/")
async def recommend_music(mood_caption: str = Form(...)):
    """
    캡션(분위기 문장)을 받고 YouTube Data API로 음악 영상 검색 후 재생 URL 반환
    """
    result = await search_youtube_music(mood_caption)
    if result:
        return {"message": f"Found song '{result['title']}'", "youtube_url": result["url"]}
    else:
        return {"message": "No matching music found."}

# 클라이언트는 /upload-image/로 풍경 이미지 전송 → /recommend-music/ 에서 그 캡션으로 검색해서
# 받은 youtube_url을 유튜브 iframe API로 재생시키면 됨.
