from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import JSONResponse
from ultralytics import YOLO
import cv2
import numpy as np
from PIL import Image
import io
import spotipy
from spotipy.oauth2 import SpotifyOAuth

app = FastAPI()

# Spotify API 설정 (사전에 앱 등록 및 클라이언트 ID/시크릿, 리다이렉트 URI 설정 필요)
SPOTIPY_CLIENT_ID = "your_spotify_client_id"
SPOTIPY_CLIENT_SECRET = "your_spotify_client_secret"
SPOTIPY_REDIRECT_URI = "http://localhost:8080/callback"
SCOPE = "user-read-playback-state user-modify-playback-state"

sp_oauth = SpotifyOAuth(client_id=SPOTIPY_CLIENT_ID,
                        client_secret=SPOTIPY_CLIENT_SECRET,
                        redirect_uri=SPOTIPY_REDIRECT_URI,
                        scope=SCOPE)

# YOLO object detection 모델 로드 (ultralytics YOLOv8 사전학습 모델 사용)
model = YOLO("yolov8n.pt")

@app.post("/upload-image/")
async def upload_image(file: UploadFile = File(...)):
    contents = await file.read()
    np_arr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    # 이미지에서 객체 탐지 실행
    results = model(img)
    keywords = set()
    for result in results:
        for box in result.boxes:
            # 클래스 이름을 키워드로 추가
            keywords.add(model.names[int(box.cls)])
    
    keywords = list(keywords)
    return {"keywords": keywords}

@app.post("/play-song/")
async def play_song(keywords: str = Form(...)):
    # 전달된 키워드는 쉼표로 구분된 문자열로 받음
    keyword_list = keywords.split(",")
    query = " ".join(keyword_list)

    # Spotify 재생 토큰 받아오기
    token_info = sp_oauth.get_cached_token()
    if not token_info:
        auth_url = sp_oauth.get_authorize_url()
        return {"auth_url": auth_url, "message": "Authorize using this URL and get the token first."}

    sp = spotipy.Spotify(auth=token_info['access_token'])

    # 키워드로 노래 검색
    results = sp.search(q=query, limit=1, type='track')
    if results['tracks']['items']:
        track = results['tracks']['items'][0]
        track_uri = track['uri']

        # 현재 플레이어가 있으면 재생 요청
        sp.start_playback(uris=[track_uri])
        return {"message": f"Playing song: {track['name']} by {track['artists'][0]['name']}"}
    else:
        return {"message": "No matching songs found."}
