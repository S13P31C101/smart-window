from types import SimpleNamespace
import torch
from torchvision import transforms
from PIL import Image
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import StreamingResponse
from io import BytesIO

from models import create_model

app = FastAPI()
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# 이미지 전처리
transform = transforms.Compose([
    transforms.Resize((256, 256)),
    transforms.ToTensor(),
    transforms.Normalize((0.5, 0.5, 0.5), (0.5, 0.5, 0.5)),
])

def denormalize(tensor):
    t = tensor * 0.5 + 0.5
    return t.clamp(0, 1)

# argparse 대신 SimpleNamespace로 직접 옵션 생성
from types import SimpleNamespace
import torch

opt = SimpleNamespace()
opt.dataroot = "./datasets/day2night"
opt.name = "day2night_cyclegan"
opt.model = "cycle_gan"
opt.phase = "test"
opt.no_dropout = True
opt.isTrain = False
opt.load_size = 286
opt.crop_size = 256
opt.num_threads = 1
opt.batch_size = 1
opt.serial_batches = True
opt.load_iter = 0
opt.checkpoints_dir = './checkpoints'
opt.eval = True
opt.num_test = float("inf")
opt.aspect_ratio = 1.0
opt.direction = 'AtoB'
opt.preprocess = 'resize_and_crop'

opt.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

opt.input_nc = 3
opt.output_nc = 3
opt.ngf = 64
opt.netG = 'resnet_9blocks'
opt.norm = 'instance'
opt.init_type = 'normal'
opt.init_gain = 0.02
opt.epoch = "latest"    # 추가: 체크포인트 에포크 설정



model = create_model(opt)
model.setup(opt)
model.device = device

weight_path = f"{opt.checkpoints_dir}/{opt.name}/latest_net_G.pth"
state_dict = torch.load(weight_path, map_location=device)
model.netG_A.load_state_dict(state_dict)
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
    from torchvision.utils import save_image
    save_image(fake_img, buf, format="PNG")
    buf.seek(0)
    return StreamingResponse(buf, media_type="image/png")
