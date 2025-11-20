import os
import io
import tempfile
import requests
import base64
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import FileResponse
from PIL import Image
from dotenv import load_dotenv

# .env에서 GMS API 키 로드
load_dotenv()
API_KEY = os.getenv("GMS_API_KEY")
if not API_KEY:
    raise EnvironmentError(".env 파일에 GMS_API_KEY가 없습니다.")

# SSAFY/GMS Gemini 2.5 Flash 엔드포인트
GMS_ENDPOINT = f"https://gms.ssafy.io/gmsapi/generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={API_KEY}"

app = FastAPI()

def compress_and_resize(image_bytes, max_size=(512, 512), quality=70):
    """이미지를 더 작은 JPEG로 압축/리사이즈해서 base64 반환"""
    image = Image.open(io.BytesIO(image_bytes))
    image = image.convert("RGB")
    image.thumbnail(max_size)
    buf = io.BytesIO()
    image.save(buf, format="JPEG", quality=quality)
    buf.seek(0)
    resized = buf.getvalue()
    print('최종 JPEG 바이트:', len(resized))
    print('base64 길이:', len(base64.b64encode(resized)))
    return base64.b64encode(resized).decode("utf-8")

@app.post("/remove-people")
async def remove_people(file: UploadFile = File(...)):
    image_bytes = await file.read()
    image_b64 = compress_and_resize(image_bytes, max_size=(512, 512), quality=70)

    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": "Remove all people from this image and output the edited image as a result."
                    },
                    {
                        "inline_data": {
                            "mime_type": "image/jpeg",
                            "data": image_b64
                        }
                    }
                ]
            }
        ]
    }
    headers = {"Content-Type": "application/json"}
    response = requests.post(GMS_ENDPOINT, json=payload, headers=headers)
    result = response.json()
    print("API 응답:", result)

    # 이미지 결과 파싱
    try:
        # 이미지 결과 시도
        edited_img_b64 = result["candidates"][0]["content"]["parts"][0]["inline_data"]["data"]
        edited_img_bytes = base64.b64decode(edited_img_b64)
        with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as tmp:
            tmp.write(edited_img_bytes)
            tmp_path = tmp.name
        return FileResponse(tmp_path, filename="edited.png")
    except Exception:
        # 텍스트 결과 시도
        try:
            text = result["candidates"][0]["content"]["parts"][0]["text"]
            return {"result": text}
        except Exception as e:
            return {
                "error": "결과 이미지 또는 텍스트 없음(모델 기능 확인)",
                "raw_result": result,
                "exception": str(e)
            }

