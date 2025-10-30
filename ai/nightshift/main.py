from fastapi import FastAPI, File, UploadFile
from fastapi.responses import StreamingResponse
from io import BytesIO
from PIL import Image
import torch
from torchvision import transforms
from torchvision.utils import save_image
import sys
import os
sys.path.append(os.path.abspath("/home/andymion/FINAL_PROJECT/smart-window/ai/nightshift/pytorch-CycleGAN-and-pix2pix"))

# 저장소 내 model 디렉터리에서 Generator import
from models import create_model  # 저장소 내 create_model 함수 활용

app = FastAPI()

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# 이미지 전처리
transform = transforms.Compose([
    transforms.Resize((256, 256)),
    transforms.ToTensor(),
    transforms.Normalize((0.5, 0.5, 0.5), (0.5, 0.5, 0.5)),
])

# 역정규화 함수
def denormalize(tensor):
    tensor = tensor * 0.5 + 0.5
    return tensor.clamp(0, 1)

# CycleGAN 모델 생성 및 가중치 로드(예: horse2zebra 낮→밤 모델 등, 직접 학습하거나 다운로드 필요)
model = create_model()  # 기본적으로 CycleGAN 모델 생성 함수
model.setup()  # 모델 구성 (옵션: load_checkpoint 등)
model.device = device

# 사전학습된 weight 경로 지정
weight_path = "./checkpoints/horse2zebra_pretrained/latest_net_G.pth"  # 예시 경로
state_dict = torch.load(weight_path, map_location=device)
model.netG_A.load_state_dict(state_dict)  # 낮->밤 변환 generator (A->B)
model.netG_A.to(device).eval()

@app.post("/night")
async def day_to_night(file: UploadFile = File(...)):
    img_bytes = await file.read()
    img = Image.open(BytesIO(img_bytes)).convert("RGB")
    img_tensor = transform(img).unsqueeze(0).to(device)
    
    with torch.no_grad():
        fake_night = model.netG_A(img_tensor)
        
    fake_img = denormalize(fake_night.squeeze()).cpu()
    
    buf = BytesIO()
    save_image(fake_img, buf, format="PNG")
    buf.seek(0)
    
    return StreamingResponse(buf, media_type="image/png")
