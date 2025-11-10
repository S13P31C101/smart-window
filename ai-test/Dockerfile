# 베이스 이미지
FROM python:3.10-slim

# 시스템 패키지 설치 (OpenCV 및 GUI 라이브러리 포함)
RUN apt-get update && apt-get install -y \
    libgl1 libsm6 libxrender1 libxext6 libgthread-2.0-0 libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*


# 작업 디렉터리 생성 및 설정
WORKDIR /app

# requirements.txt 복사 및 의존성 설치
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 애플리케이션 소스 복사
COPY . .

# 결과 파일 저장 경로 생성
RUN mkdir -p /app/results

# 환경변수 설정 (선택 사항)
ENV SAVE_DIR=/app/results

# FastAPI 기본 포트 오픈
EXPOSE 8000

# uvicorn으로 FastAPI 앱 실행
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
