import torch
from PIL import Image
import numpy as np
import cv2
import os
from transformers import SegformerForSemanticSegmentation, SegformerImageProcessor
from diffusers import StableDiffusionInpaintPipeline


SAVE_DIR = "../results"
os.makedirs(SAVE_DIR, exist_ok=True)


# SegFormer 고품질 모델 (b3)
model_id = "nvidia/segformer-b3-finetuned-cityscapes-1024-1024"
seg_model = SegformerForSemanticSegmentation.from_pretrained(model_id)
seg_processor = SegformerImageProcessor.from_pretrained(model_id)


pipe = StableDiffusionInpaintPipeline.from_pretrained(
    "runwayml/stable-diffusion-inpainting",
    torch_dtype=torch.float16,
    safety_checker=None,
).to("cuda")


def preprocess(img: Image.Image, size=(1024, 1024)):
    img = img.convert("RGB")
    img = img.resize(size)
    return img


def postprocess_mask(mask_np, size):
    width, height = size
    mask_resized = cv2.resize(mask_np.astype(np.uint8), (width, height), interpolation=cv2.INTER_NEAREST)
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    mask_closed = cv2.morphologyEx(mask_resized, cv2.MORPH_CLOSE, kernel)
    mask_opened = cv2.morphologyEx(mask_closed, cv2.MORPH_OPEN, kernel)
    return mask_opened.astype(bool)


def blend_sunset_on_sky(original_img_np, sky_mask, sunset_img_pil, alpha=0.7):
    h, w = original_img_np.shape[:2]
    sunset_img_resized = sunset_img_pil.resize((w, h))
    sunset_img_np = np.array(sunset_img_resized)
    sky_mask_3c = np.stack([sky_mask]*3, axis=-1)
    blended_img = original_img_np.copy()
    blended_img[sky_mask_3c] = (
        alpha * sunset_img_np[sky_mask_3c] + (1 - alpha) * original_img_np[sky_mask_3c]
    ).astype(np.uint8)
    return blended_img


def blend_mask_colors(original_img_np, blended_img_np, sky_mask, alpha=0.3):
    mask_3c = np.stack([sky_mask]*3, axis=-1)
    output_img = blended_img_np.copy()
    output_img[mask_3c] = (alpha * blended_img_np[mask_3c] + (1 - alpha) * original_img_np[mask_3c]).astype(np.uint8)
    return output_img


def sunset_blend(original_path, sunset_path, alpha=0.7, prompt="dawn view, early morning soft light, misty atmosphere, calm and serene"):
    orig_img = preprocess(Image.open(original_path), size=(1024, 1024))
    sunset_img = Image.open(sunset_path).convert("RGB").resize((1024, 1024))

    orig_size = (1024, 1024)

    inputs = seg_processor(images=orig_img, return_tensors="pt")
    seg_model.eval()
    with torch.no_grad():
        outputs = seg_model(**inputs)
        mask = torch.argmax(outputs.logits.squeeze(), dim=0).cpu().numpy()

    sky_mask = (mask == 10)
    sky_mask_clean = postprocess_mask(sky_mask, orig_size)

    img_np = np.array(orig_img)
    blended_np = blend_sunset_on_sky(img_np, sky_mask_clean, sunset_img, alpha=alpha)
    blended_np = blend_mask_colors(img_np, blended_np, sky_mask_clean, alpha=0.3)
    blended_pil = Image.fromarray(blended_np).resize((512, 512))  # SD 입력 크기

    # 마스크 생성 및 블러 처리 (Gaussian Blur)
    mask_for_inpaint = (sky_mask_clean.astype(np.uint8) * 255)
    mask_for_inpaint = cv2.GaussianBlur(mask_for_inpaint, (15, 15), 0)
    mask_img = Image.fromarray(mask_for_inpaint).convert("L").resize((512, 512))

    inpaint_result = pipe(
        prompt=prompt,
        image=blended_pil,
        mask_image=mask_img,
        guidance_scale=10.0,
        num_inference_steps=50,
    ).images[0]

    save_path = os.path.join(SAVE_DIR, "test_sunset_blend_refined.png")
    inpaint_result.save(save_path)
    print(f"Result saved to {save_path}")


if __name__ == "__main__":
    # 여기서 입력 이미지 파일 경로를 지정하세요
    original_image_path = "../input/road_img.jpg"
    sunset_image_path = "../input/sunset_image.jpg"

    sunset_blend(original_image_path, sunset_image_path)
