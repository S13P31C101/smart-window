# Lumiscape - 패키지 및 라이브러리 설치 가이드

라즈베리파이에서 Lumiscape를 실행하기 위해 필요한 모든 패키지와 라이브러리 설치 방법입니다.

---

## 📋 목차

1. [시스템 업데이트](#1-시스템-업데이트)
2. [필수 빌드 도구](#2-필수-빌드-도구)
3. [Qt 6.8.3 설치](#3-qt-683-설치)
4. [시스템 라이브러리](#4-시스템-라이브러리)
5. [Python 환경](#5-python-환경)
6. [하드웨어 제어 라이브러리](#6-하드웨어-제어-라이브러리)
7. [설치 검증](#7-설치-검증)

---

## 1. 시스템 업데이트

```bash
# 시스템 패키지 업데이트
sudo apt update
sudo apt upgrade -y

# 재부팅 권장
sudo reboot
```

---

## 2. 필수 빌드 도구

### 2.1 컴파일러 및 빌드 시스템

```bash
sudo apt install -y \
    build-essential \
    g++ \
    gcc \
    make \
    cmake \
    ninja-build \
    git
```

**패키지 설명:**
- `build-essential`: C/C++ 컴파일에 필요한 기본 도구
- `g++`: C++ 컴파일러 (C++17 지원 필요)
- `cmake`: 빌드 시스템 (v3.21 이상)
- `ninja-build`: 빌드 속도 향상
- `git`: 소스 코드 버전 관리

### 2.2 PKG-Config

```bash
sudo apt install -y pkg-config
```

---

## 3. Qt 6.8.3 설치

### 방법 1: Qt Online Installer (권장)

#### 3.1 Installer 다운로드

```bash
# 홈 디렉토리로 이동
cd ~

# ARM64용 Qt Online Installer 다운로드
wget https://download.qt.io/official_releases/online_installers/qt-unified-linux-arm64-online.run

# 실행 권한 부여
chmod +x qt-unified-linux-arm64-online.run
```

#### 3.2 Installer 실행

```bash
# GUI 환경에서 실행
./qt-unified-linux-arm64-online.run
```

#### 3.3 설치 컴포넌트 선택

**필수 선택 항목:**
- ✅ Qt 6.8.3 for Linux ARM64
- ✅ Qt Quick
- ✅ Qt Quick Controls 2
- ✅ Qt Network
- ✅ Qt Multimedia
- ✅ Qt MQTT
- ✅ Qt SVG
- ✅ Qt SerialPort
- ✅ Qt WebChannel
- ✅ Qt Concurrent
- ⚠️ Qt WebEngine (메모리 8GB 이상일 때만 선택)
- ✅ Qt Positioning (선택사항)

**추천 설치 경로:** `/opt/Qt/6.8.3`

#### 3.4 환경 변수 설정

```bash
# Qt 경로 설정 (설치 경로에 맞게 수정)
export QT_DIR=/opt/Qt/6.8.3/gcc_arm64
export PATH=$QT_DIR/bin:$PATH
export LD_LIBRARY_PATH=$QT_DIR/lib:$LD_LIBRARY_PATH
export PKG_CONFIG_PATH=$QT_DIR/lib/pkgconfig:$PKG_CONFIG_PATH

# ~/.bashrc에 영구 추가
cat >> ~/.bashrc << 'EOF'

# Qt 6.8.3 Environment
export QT_DIR=/opt/Qt/6.8.3/gcc_arm64
export PATH=$QT_DIR/bin:$PATH
export LD_LIBRARY_PATH=$QT_DIR/lib:$LD_LIBRARY_PATH
export PKG_CONFIG_PATH=$QT_DIR/lib/pkgconfig:$PKG_CONFIG_PATH
EOF

# 적용
source ~/.bashrc
```

### 방법 2: APT 패키지 (Qt 6.4.x - 최소 요구사항)

> ⚠️ **주의**: APT로 설치되는 Qt는 6.4.x이므로 일부 기능이 제한될 수 있습니다.

```bash
sudo apt install -y \
    qt6-base-dev \
    qt6-declarative-dev \
    qt6-multimedia-dev \
    qml6-module-qtquick \
    qml6-module-qtquick-controls \
    qml6-module-qtquick-layouts \
    qml6-module-qtquick-window \
    libqt6network6 \
    libqt6svg6-dev \
    libqt6serialport6-dev
```

---

## 4. 시스템 라이브러리

### 4.1 보안 및 네트워크

```bash
sudo apt install -y \
    libssl-dev \
    libdbus-1-dev \
    ca-certificates
```

**패키지 설명:**
- `libssl-dev`: TLS/SSL 암호화 (MQTT, API 통신)
- `libdbus-1-dev`: D-Bus 시스템 버스
- `ca-certificates`: SSL 인증서

### 4.2 멀티미디어

```bash
sudo apt install -y \
    libgstreamer1.0-dev \
    libgstreamer-plugins-base1.0-dev \
    libgstreamer-plugins-good1.0-dev \
    gstreamer1.0-plugins-base \
    gstreamer1.0-plugins-good \
    gstreamer1.0-plugins-bad \
    gstreamer1.0-plugins-ugly \
    gstreamer1.0-libav \
    gstreamer1.0-tools \
    gstreamer1.0-alsa \
    gstreamer1.0-pulseaudio \
    libpulse-dev \
    libasound2-dev
```

**패키지 설명:**
- `gstreamer*`: Qt Multimedia 백엔드
- `libpulse-dev`: 오디오 출력
- `libasound2-dev`: ALSA 오디오 지원

### 4.3 그래픽 및 렌더링

```bash
sudo apt install -y \
    libegl1-mesa-dev \
    libgles2-mesa-dev \
    libgbm-dev \
    libdrm-dev \
    libx11-dev \
    libxext-dev \
    libxfixes-dev \
    libxi-dev \
    libxrender-dev \
    libxcb1-dev \
    libxcb-glx0-dev \
    libxcb-keysyms1-dev \
    libxcb-image0-dev \
    libxcb-shm0-dev \
    libxcb-icccm4-dev \
    libxcb-sync-dev \
    libxcb-xfixes0-dev \
    libxcb-shape0-dev \
    libxcb-randr0-dev \
    libxcb-render-util0-dev
```

**패키지 설명:**
- `libegl*`, `libgles*`: OpenGL ES (GPU 가속)
- `libxcb*`: X11 윈도우 시스템
- `libdrm*`, `libgbm*`: Direct Rendering Manager

### 4.4 폰트

```bash
sudo apt install -y \
    fontconfig \
    libfontconfig1-dev \
    libfreetype6-dev
```

---

## 5. Python 환경

### 5.1 Python 3 기본 패키지

```bash
sudo apt install -y \
    python3 \
    python3-pip \
    python3-venv \
    python3-dev
```

**버전 확인:**
```bash
python3 --version  # Python 3.9 이상 권장
```

### 5.2 시스템 레벨 Python 라이브러리

```bash
# OpenCV 의존성
sudo apt install -y \
    python3-opencv \
    libopencv-dev \
    python3-numpy

# 선택사항: 시스템 레벨로 설치하지 않고 가상환경에서 설치 가능
```

### 5.3 가상 환경 생성 및 패키지 설치

```bash
# 프로젝트 디렉토리로 이동
cd /path/to/lumiscape

# 가상 환경 생성
python3 -m venv venv

# 가상 환경 활성화
source venv/bin/activate

# pip 업그레이드
pip install --upgrade pip

# 프로젝트 의존성 설치
pip install -r python/requirements.txt

# 또는 개별 설치
pip install opencv-python>=4.8.0
pip install mediapipe>=0.10.0
pip install numpy>=1.24.0
```

**requirements.txt 내용:**
```
opencv-python>=4.8.0
mediapipe>=0.10.0
numpy>=1.24.0
```

---

## 6. 하드웨어 제어 라이브러리

### 6.1 GPIO 제어 (libgpiod)

```bash
sudo apt install -y \
    libgpiod-dev \
    libgpiod2 \
    gpiod \
    python3-libgpiod
```

**패키지 설명:**
- `libgpiod-dev`: GPIO 제어 개발 라이브러리
- `gpiod`: GPIO 명령줄 도구
- `python3-libgpiod`: Python GPIO 바인딩

**사용자 권한 설정:**
```bash
# gpio 그룹 추가 (없는 경우)
sudo groupadd -f gpio

# 현재 사용자를 gpio 그룹에 추가
sudo usermod -a -G gpio $USER

# 재로그인 필요
```

### 6.2 시리얼 포트

```bash
sudo apt install -y \
    libqt6serialport6 \
    libqt6serialport6-dev

# 시리얼 포트 권한
sudo usermod -a -G dialout $USER
```

### 6.3 Bluetooth (선택사항)

```bash
sudo apt install -y \
    libbluetooth-dev \
    bluez \
    bluez-tools

# Bluetooth 서비스 활성화
sudo systemctl enable bluetooth
sudo systemctl start bluetooth
```

### 6.4 카메라

```bash
# 라즈베리파이 카메라 활성화
sudo raspi-config
# Interface Options → Camera → Enable

# USB 카메라 권한
sudo usermod -a -G video $USER

# v4l2 도구 (카메라 테스트용)
sudo apt install -y v4l-utils

# 카메라 확인
v4l2-ctl --list-devices
```

---

## 7. 설치 검증

### 7.1 Qt 설치 확인

```bash
# qmake 버전 확인
qmake6 --version
# 출력 예: QMake version 3.1, Using Qt version 6.8.3

# Qt 모듈 확인
pkg-config --modversion Qt6Core
pkg-config --modversion Qt6Quick
pkg-config --modversion Qt6Mqtt
```

### 7.2 Python 패키지 확인

```bash
# 가상 환경 활성화
source venv/bin/activate

# 설치된 패키지 확인
pip list | grep -E "opencv|mediapipe|numpy"

# 버전 확인
python3 -c "import cv2; print('OpenCV:', cv2.__version__)"
python3 -c "import mediapipe; print('MediaPipe:', mediapipe.__version__)"
python3 -c "import numpy; print('NumPy:', numpy.__version__)"
```

### 7.3 카메라 테스트

```bash
# Python으로 카메라 테스트
python3 << 'EOF'
import cv2
cap = cv2.VideoCapture(0)
if cap.isOpened():
    print("✅ 카메라 정상 작동")
    cap.release()
else:
    print("❌ 카메라 열기 실패")
EOF
```

### 7.4 GPIO 테스트

```bash
# GPIO 핀 목록 확인
gpioinfo

# GPIO 권한 확인
groups | grep gpio
```

---

## 📦 전체 설치 스크립트

모든 패키지를 한 번에 설치하는 스크립트:

```bash
#!/bin/bash
# Lumiscape 전체 의존성 설치 스크립트

echo "🔧 Lumiscape 의존성 설치를 시작합니다..."

# 1. 시스템 업데이트
echo "📦 시스템 업데이트 중..."
sudo apt update
sudo apt upgrade -y

# 2. 빌드 도구
echo "🔨 빌드 도구 설치 중..."
sudo apt install -y \
    build-essential g++ gcc make cmake ninja-build git pkg-config

# 3. 시스템 라이브러리
echo "📚 시스템 라이브러리 설치 중..."
sudo apt install -y \
    libssl-dev libdbus-1-dev ca-certificates \
    libgstreamer1.0-dev libgstreamer-plugins-base1.0-dev \
    gstreamer1.0-plugins-base gstreamer1.0-plugins-good \
    gstreamer1.0-plugins-bad gstreamer1.0-plugins-ugly \
    gstreamer1.0-libav gstreamer1.0-alsa gstreamer1.0-pulseaudio \
    libpulse-dev libasound2-dev \
    libegl1-mesa-dev libgles2-mesa-dev libgbm-dev libdrm-dev \
    libx11-dev libxcb1-dev libxcb-glx0-dev \
    fontconfig libfontconfig1-dev libfreetype6-dev

# 4. Python
echo "🐍 Python 환경 설치 중..."
sudo apt install -y \
    python3 python3-pip python3-venv python3-dev \
    python3-opencv libopencv-dev python3-numpy

# 5. 하드웨어 제어
echo "🔌 하드웨어 제어 라이브러리 설치 중..."
sudo apt install -y \
    libgpiod-dev libgpiod2 gpiod python3-libgpiod \
    libbluetooth-dev bluez bluez-tools \
    v4l-utils

# 6. 사용자 그룹 추가
echo "👤 사용자 권한 설정 중..."
sudo usermod -a -G gpio,video,dialout $USER

echo "✅ 의존성 설치 완료!"
echo "⚠️  재로그인 후 권한이 적용됩니다."
echo ""
echo "다음 단계:"
echo "1. Qt 6.8.3 설치 (Qt Online Installer 사용)"
echo "2. Python 가상 환경 생성 및 패키지 설치"
echo "3. Lumiscape 프로젝트 빌드"
```

**스크립트 사용:**
```bash
# 스크립트 저장
nano install_dependencies.sh

# 위 내용 붙여넣기 후 저장 (Ctrl+X, Y, Enter)

# 실행 권한 부여
chmod +x install_dependencies.sh

# 실행
./install_dependencies.sh
```

---

## 🔍 버전 요구사항 요약

| 패키지/라이브러리 | 최소 버전 | 권장 버전 | 필수 여부 |
|-----------------|----------|----------|----------|
| **Qt** | 6.5.0 | 6.8.3 | ✅ 필수 |
| **CMake** | 3.21 | 3.27+ | ✅ 필수 |
| **Python** | 3.9 | 3.11+ | ✅ 필수 |
| **OpenCV** | 4.8.0 | 4.9+ | ✅ 필수 |
| **MediaPipe** | 0.10.0 | 0.10.9+ | ✅ 필수 |
| **NumPy** | 1.24.0 | 1.26+ | ✅ 필수 |
| **GStreamer** | 1.20 | 1.22+ | ✅ 필수 |
| **libgpiod** | 2.0 | 2.1+ | ⚠️ 선택 (GPIO 사용 시) |

---

## 💾 디스크 공간 요구사항

- **최소:** 8GB (시스템 + 빌드)
- **권장:** 16GB 이상
- **Qt 설치:** ~3-4GB
- **빌드 디렉토리:** ~500MB
- **Python 패키지:** ~1GB

---

## 🎯 설치 후 다음 단계

1. ✅ Qt 6.8.3 설치 완료
2. ✅ 모든 의존성 설치 완료
3. ✅ Python 가상 환경 설정 완료
4. ➡️ **다음:** [RASPBERRY_PI_DEPLOYMENT.md](./RASPBERRY_PI_DEPLOYMENT.md)의 "빌드 및 실행" 섹션 참고

---

**작성일:** 2025-01-17
**대상 플랫폼:** Raspberry Pi OS 64-bit (Bookworm)
**테스트 환경:** Raspberry Pi 4 Model B (8GB)
