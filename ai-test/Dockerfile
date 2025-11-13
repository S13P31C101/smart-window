FROM python:3.10-slim

# ARM 서버에서 필요한 라이브러리 설치
RUN apt-get update && apt-get install -y \
    libgl1 libsm6 libxrender1 libxext6 libgthread-2.0-0 libglib2.0-0 \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .

# CPU-only wheel을 추가 설치
RUN pip install --no-cache-dir torch==2.1.0+cpu torchvision==0.16.0+cpu --index-url https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p /app/results

ENV SAVE_DIR=/app/results

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
