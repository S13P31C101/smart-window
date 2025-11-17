#!/bin/bash

WATCH_DIR="./input"        # 감시할 input 폴더 경로
PYTHON_SCRIPT="removehuman/test.py"  # remove_person_from_image 함수가 있는 파이썬 파일 경로
PROCESSED_DIR="result"  # 처리 완료 후 이미지를 옮길 폴더

mkdir -p "$PROCESSED_DIR"

while true; do
    # 폴더 내 jpg 이미지 수
    jpg_files=( "$WATCH_DIR"/*.jpg )
    if [ -e "${jpg_files[0]}" ]; then
        for img_path in "${jpg_files[@]}"; do
            echo "이미지 발견: $img_path"
            # 파이썬 스크립트에 인자로 이미지 경로 전달하여 실행
            python3 "$PYTHON_SCRIPT" "$img_path"

            # 처리 후 이미지 이동(중복 처리 방지용)
            mv "$img_path" "$PROCESSED_DIR/"
            echo "이미지 $img_path 처리 완료 및 이동."
        done
    else
        echo "대기 중... 이미지 없음."
    fi
    sleep 5
done
