# Lumiscape - 라즈베리파이 완전 설치 가이드

완전히 정리된 라즈베리파이에서 Lumiscape 스마트 글래스 UI 시스템을 처음부터 설치하고 실행하기 위한 완전한 단계별 가이드입니다.

---

## 📋 목차

1. [시스템 요구사항](#1-시스템-요구사항)
2. [OS 설치 및 초기 설정](#2-os-설치-및-초기-설정)
3. [시스템 업데이트 및 필수 도구 설치](#3-시스템-업데이트-및-필수-도구-설치)
4. [Qt 6.8+ 설치](#4-qt-68-설치)
5. [시스템 라이브러리 설치](#5-시스템-라이브러리-설치)
6. [Python 환경 설정](#6-python-환경-설정)
7. [하드웨어 제어 라이브러리 설치](#7-하드웨어-제어-라이브러리-설치)
8. [프로젝트 다운로드 및 설정](#8-프로젝트-다운로드-및-설정)
9. [빌드 및 실행](#9-빌드-및-실행)
10. [자동 시작 설정](#10-자동-시작-설정)
11. [문제 해결](#11-문제-해결)
12. [성능 최적화](#12-성능-최적화)

---

## 1. 시스템 요구사항

### 1.1 하드웨어

**필수 사양:**
- **Raspberry Pi 4 Model B** (4GB RAM 이상) 또는
- **Raspberry Pi 5** (8GB RAM 권장)
- **microSD 카드:** 32GB 이상 (Class 10/UHS-I)
- **전원:** 5V 3A USB-C 전원 어댑터
- **디스플레이:** HDMI 연결 가능한 모니터
- **냉각:** 방열판 또는 팬 (권장)

**선택 사양:**
- 카메라 모듈 또는 USB 웹캠 (제스처 인식용)
- 스피커 (오디오 출력용)
- 이더넷 케이블 또는 WiFi

### 1.2 소프트웨어

- **운영체제:** Raspberry Pi OS (64-bit) Bookworm (Debian 12)
- **Qt 버전:** 6.8.3 이상 (6.9.x 권장)
- **Python 버전:** 3.9 이상
- **CMake 버전:** 3.21 이상

### 1.3 네트워크

- 인터넷 연결 (패키지 다운로드 및 API 사용)

---

## 2. OS 설치 및 초기 설정

### 2.1 Raspberry Pi OS 다운로드 및 설치

**옵션 1: Raspberry Pi Imager 사용 (권장)**

1. **Raspberry Pi Imager 다운로드**
   - [https://www.raspberrypi.com/software/](https://www.raspberrypi.com/software/)

2. **OS 이미지 선택**
   - Raspberry Pi OS (64-bit) - Bookworm 선택
   - **중요:** 반드시 64-bit 버전 선택

3. **고급 설정 (톱니바퀴 아이콘)**
   - 호스트명: `lumiscape-pi` (원하는 이름)
   - SSH 활성화 체크
   - 사용자명/비밀번호 설정
   - WiFi 설정 (필요시)
   - 로케일 설정: 시간대, 키보드 레이아웃

4. **이미지 굽기**
   - microSD 카드 삽입
   - WRITE 클릭하여 이미지 굽기

5. **첫 부팅**
   - microSD 카드를 라즈베리파이에 삽입
   - HDMI, 전원 연결 후 부팅

### 2.2 초기 시스템 설정

라즈베리파이가 부팅되면 터미널을 열어 다음 단계를 진행합니다.

```bash
# 시스템 설정 도구 실행
sudo raspi-config
```

**설정할 항목들:**

1. **System Options → Boot / Auto Login**
   - Desktop Autologin 선택 (자동 로그인 원하는 경우)

2. **Interface Options**
   - Camera: Enable (카메라 사용 시)
   - SSH: Enable (원격 접속 시)
   - VNC: Enable (원격 데스크탑 시)
   - I2C: Enable (센서 사용 시)
   - Serial Port: Enable (시리얼 통신 시)

3. **Performance Options**
   - GPU Memory: 256MB로 설정 (그래픽 성능 향상)

4. **Advanced Options**
   - Expand Filesystem (전체 SD 카드 용량 사용)

5. **Finish** 선택 후 재부팅

---

## 3. 시스템 업데이트 및 필수 도구 설치

### 3.1 시스템 업데이트

```bash
# 패키지 목록 업데이트
sudo apt update

# 설치된 패키지 업그레이드
sudo apt upgrade -y

# 전체 시스템 업그레이드 (선택사항, 시간 소요)
sudo apt full-upgrade -y

# 불필요한 패키지 제거
sudo apt autoremove -y
sudo apt autoclean

# 재부팅
sudo reboot
```

### 3.2 필수 빌드 도구 설치

```bash
# C/C++ 컴파일러 및 빌드 도구
sudo apt install -y \
    build-essential \
    g++ \
    gcc \
    make \
    cmake \
    ninja-build \
    git \
    pkg-config \
    wget \
    curl
```

**설치 확인:**

```bash
# GCC 버전 (9.0 이상)
gcc --version

# CMake 버전 (3.21 이상)
cmake --version

# Git 버전
git --version
```

---

## 4. Qt 6.8+ 설치

Qt는 Lumiscape의 핵심 UI 프레임워크입니다. **Qt 6.8.3 이상** 버전이 필요합니다.

### 4.1 Qt Online Installer 다운로드

```bash
# 홈 디렉토리로 이동
cd ~

# ARM64용 Qt Online Installer 다운로드
wget https://download.qt.io/official_releases/online_installers/qt-unified-linux-arm64-online.run

# 실행 권한 부여
chmod +x qt-unified-linux-arm64-online.run
```

### 4.2 Qt Installer 실행

```bash
# GUI 환경에서 실행
./qt-unified-linux-arm64-online.run
```

**설치 진행:**

1. **Qt 계정 로그인**
   - 계정이 없다면 무료 계정 생성: [https://login.qt.io/register](https://login.qt.io/register)

2. **설치 타입 선택**
   - "Custom Installation" 선택

3. **Qt 버전 선택**
   - **Qt 6.8.3** 또는 **Qt 6.9.x** 선택 (최신 안정 버전)

4. **필수 컴포넌트 선택**
   - ✅ **Qt 6.8.3 (또는 6.9.x) for Linux ARM64**
   - ✅ **Qt Quick**
   - ✅ **Qt Quick Controls 2**
   - ✅ **Qt Network**
   - ✅ **Qt Multimedia**
   - ✅ **Qt MQTT**
   - ✅ **Qt SVG**
   - ✅ **Qt SerialPort**
   - ✅ **Qt WebChannel**
   - ✅ **Qt Concurrent**
   - ⚠️ **Qt WebEngine** (8GB RAM 이상만 선택)
   - ✅ **Qt Positioning** (선택사항)
   - ✅ **Qt Charts** (선택사항)

5. **설치 경로 설정**
   - 권장 경로: `/opt/Qt/6.8.3` (또는 `/opt/Qt/6.9.x`)

6. **설치 시작**
   - "Install" 클릭 (약 30-60분 소요)

### 4.3 Qt 환경 변수 설정

설치 완료 후 Qt를 시스템에서 인식할 수 있도록 환경 변수를 설정합니다.

```bash
# Qt 설치 경로 확인 (버전에 맞게 수정)
ls /opt/Qt/

# 환경 변수를 .bashrc에 추가
nano ~/.bashrc
```

**파일 끝에 다음 내용 추가** (Qt 버전에 맞게 경로 수정):

```bash
# Qt 6.8.3 Environment Variables (버전에 맞게 수정)
export QT_DIR=/opt/Qt/6.8.3/gcc_arm64
export PATH=$QT_DIR/bin:$PATH
export LD_LIBRARY_PATH=$QT_DIR/lib:$LD_LIBRARY_PATH
export PKG_CONFIG_PATH=$QT_DIR/lib/pkgconfig:$PKG_CONFIG_PATH
export QML_IMPORT_PATH=$QT_DIR/qml
export QT_PLUGIN_PATH=$QT_DIR/plugins
```

**저장 및 적용:**

```bash
# Ctrl+X, Y, Enter로 저장 후 종료

# 변경사항 적용
source ~/.bashrc

# Qt 설치 확인
qmake6 --version
# 출력: QMake version 3.1, Using Qt version 6.8.3 (또는 6.9.x)

which qmake6
# 출력: /opt/Qt/6.8.3/gcc_arm64/bin/qmake6
```

---

## 5. 시스템 라이브러리 설치

### 5.1 보안 및 네트워크 라이브러리

```bash
sudo apt install -y \
    libssl-dev \
    libdbus-1-dev \
    ca-certificates \
    openssl
```

### 5.2 멀티미디어 라이브러리 (GStreamer)

Qt Multimedia는 GStreamer를 백엔드로 사용하므로 필수입니다.

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

**GStreamer 설치 확인:**

```bash
# GStreamer 버전 확인
gst-launch-1.0 --version

# 사용 가능한 플러그인 확인
gst-inspect-1.0 | grep -E "libav|x264|aac"
```

### 5.3 그래픽 및 렌더링 라이브러리

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

### 5.4 폰트 라이브러리

```bash
sudo apt install -y \
    fontconfig \
    libfontconfig1-dev \
    libfreetype6-dev \
    fonts-noto \
    fonts-noto-cjk
```

---

## 6. Python 환경 설정

### 6.1 Python 기본 패키지 설치

```bash
# Python 3 및 개발 도구
sudo apt install -y \
    python3 \
    python3-pip \
    python3-venv \
    python3-dev

# Python 버전 확인 (3.9 이상)
python3 --version
```

### 6.2 시스템 레벨 Python 라이브러리

```bash
# OpenCV 의존성
sudo apt install -y \
    python3-opencv \
    libopencv-dev \
    python3-numpy
```

### 6.3 가상 환경 생성 (나중에 프로젝트 디렉토리에서 수행)

> **참고:** 실제 가상 환경 생성은 프로젝트 다운로드 후 [8.3 Python 가상 환경 설정](#83-python-가상-환경-설정)에서 진행합니다.

---

## 7. 하드웨어 제어 라이브러리 설치

### 7.1 GPIO 제어 (libgpiod)

```bash
sudo apt install -y \
    libgpiod-dev \
    libgpiod2 \
    gpiod \
    python3-libgpiod
```

**사용자 권한 설정:**

```bash
# gpio 그룹 생성 (이미 있으면 무시됨)
sudo groupadd -f gpio

# 현재 사용자를 gpio 그룹에 추가
sudo usermod -a -G gpio $USER
```

### 7.2 시리얼 포트

```bash
# 시리얼 포트 권한
sudo usermod -a -G dialout $USER
```

### 7.3 카메라 권한

```bash
# video 그룹에 사용자 추가
sudo usermod -a -G video $USER

# v4l2 도구 설치 (카메라 테스트용)
sudo apt install -y v4l-utils
```

### 7.4 Bluetooth (선택사항)

```bash
sudo apt install -y \
    libbluetooth-dev \
    bluez \
    bluez-tools

# Bluetooth 서비스 활성화
sudo systemctl enable bluetooth
sudo systemctl start bluetooth
```

### 7.5 권한 적용을 위한 재로그인

```bash
# 모든 그룹 변경사항 적용을 위해 재로그인 필요
# SSH 사용 시: exit 후 재접속
# GUI 사용 시: 로그아웃 후 재로그인
# 또는 재부팅:
sudo reboot
```

---

## 8. 프로젝트 다운로드 및 설정

### 8.1 프로젝트 클론

```bash
# 홈 디렉토리로 이동
cd ~

# Git 저장소 클론 (실제 저장소 URL로 변경)
git clone https://github.com/your-username/lumiscape.git

# 또는 SSH 사용:
# git clone git@github.com:your-username/lumiscape.git

# 프로젝트 디렉토리로 이동
cd lumiscape
```

### 8.2 프로젝트 구조 확인

```bash
# 프로젝트 구조 확인
ls -la
```

**예상 디렉토리 구조:**

```
lumiscape/
├── assets/          # 리소스 파일 (이미지, 설정 등)
├── python/          # Python 모듈 (MediaPipe, YouTube 등)
├── qml/             # QML UI 파일
├── src/             # C++ 소스 코드
├── resources/       # Qt 리소스
├── CMakeLists.txt   # CMake 빌드 설정
└── README.md
```

### 8.3 Python 가상 환경 설정

```bash
# 프로젝트 디렉토리에서 가상 환경 생성
cd ~/lumiscape
python3 -m venv venv

# 가상 환경 활성화
source venv/bin/activate

# pip 업그레이드
pip install --upgrade pip

# Python 의존성 설치
pip install -r python/requirements.txt
```

**설치되는 패키지:**
- `opencv-python>=4.8.0` - 카메라 입력 및 이미지 처리
- `mediapipe>=0.10.0` - 손 제스처 인식 AI
- `numpy>=1.24.0` - 수치 연산
- `yt-dlp>=2023.10.13` - YouTube 음원 스트리밍

**설치 확인:**

```bash
# 설치된 패키지 확인
pip list | grep -E "opencv|mediapipe|numpy|yt-dlp"

# Python 패키지 테스트
python3 -c "import cv2; print('OpenCV:', cv2.__version__)"
python3 -c "import mediapipe; print('MediaPipe:', mediapipe.__version__)"
python3 -c "import numpy; print('NumPy:', numpy.__version__)"
python3 -c "import yt_dlp; print('yt-dlp OK')"
```

### 8.4 CMakeLists.txt 수정 (Qt 버전 맞추기)

프로젝트는 Qt 6.9를 요구하지만, Qt 6.8.3을 설치한 경우 CMakeLists.txt를 수정해야 합니다.

```bash
# CMakeLists.txt 편집
nano CMakeLists.txt
```

**28번 라인 수정:**

**수정 전:**
```cmake
find_package(Qt6 6.9 REQUIRED COMPONENTS
```

**수정 후:**
```cmake
find_package(Qt6 6.8 REQUIRED COMPONENTS
```

> **참고:** Qt 6.9를 설치했다면 수정 불필요

**저장:** Ctrl+X, Y, Enter

### 8.5 설정 파일 수정

API 키 및 MQTT 설정을 구성합니다.

```bash
# 설정 파일 편집
nano assets/presets/config.json
```

**수정할 항목:**

```json
{
  "deviceUniqueId": "LUMISCAPE_RPI_001",
  "mqtt": {
    "host": "your-mqtt-broker.com",
    "port": 8883,
    "username": "your-username",
    "password": "your-password",
    "useTls": true
  },
  "mediapipe": {
    "cameraId": 0,
    "minDetectionConfidence": 0.6,
    "minTrackingConfidence": 0.4
  },
  "apis": {
    "weather": {
      "apiKey": "YOUR_OPENWEATHER_API_KEY",
      "defaultCity": "Seoul"
    },
    "spotify": {
      "clientId": "YOUR_SPOTIFY_CLIENT_ID",
      "clientSecret": "YOUR_SPOTIFY_CLIENT_SECRET"
    }
  }
}
```

**API 키 발급:**

1. **OpenWeatherMap API**
   - [https://openweathermap.org/api](https://openweathermap.org/api)
   - 무료 계정 생성 후 API 키 발급

2. **Spotify API**
   - [https://developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)
   - 앱 생성 후 Client ID와 Client Secret 발급

**저장:** Ctrl+X, Y, Enter

---

## 9. 빌드 및 실행

### 9.1 빌드 디렉토리 생성

```bash
cd ~/lumiscape

# 빌드 디렉토리 생성
mkdir build
cd build
```

### 9.2 CMake 설정

```bash
# CMake 설정 실행
cmake .. \
    -DCMAKE_BUILD_TYPE=Release \
    -DCMAKE_PREFIX_PATH=/opt/Qt/6.8.3/gcc_arm64 \
    -DLUMISCAPE_ENABLE_LOGGING=ON
```

**주요 옵션 설명:**
- `CMAKE_BUILD_TYPE=Release`: 최적화된 릴리즈 빌드
- `CMAKE_PREFIX_PATH`: Qt 설치 경로 (버전에 맞게 수정)
- `LUMISCAPE_ENABLE_LOGGING=ON`: 디버깅 로그 활성화

**성공 메시지 예시:**

```
-- The CXX compiler identification is GNU 12.2.0
-- Detecting CXX compiler ABI info
-- Detecting CXX compiler ABI info - done
-- Found Qt6: 6.8.3
-- Configuring done
-- Generating done
-- Build files have been written to: /home/pi/lumiscape/build
```

### 9.3 빌드 실행

```bash
# 4코어 병렬 빌드 (라즈베리파이 4/5 기준)
cmake --build . --config Release --parallel 4

# 또는 make 사용
make -j4
```

**예상 빌드 시간:**
- **Raspberry Pi 4 (4GB):** 20-30분
- **Raspberry Pi 5 (8GB):** 10-20분

**빌드 성공 메시지:**

```
[100%] Linking CXX executable Lumiscape
[100%] Built target Lumiscape
```

### 9.4 실행

```bash
# 빌드 디렉토리에서 실행
./Lumiscape

# 또는 전체 경로로 실행
/home/pi/lumiscape/build/Lumiscape
```

**첫 실행 시 확인사항:**

1. **카메라 권한 확인**
   - MediaPipe 서비스가 자동으로 시작됨
   - 카메라가 정상적으로 인식되는지 확인

2. **제스처 테스트**
   - 카메라 앞에서 손을 움직여 커서 이동 확인
   - 주먹(fist): 클릭
   - 손바닥(open_palm): 뒤로가기

3. **화면 모드 전환**
   - 메뉴에서 다양한 모드 테스트

### 9.5 MediaPipe 서비스 단독 테스트

문제가 있을 경우 MediaPipe 서비스를 단독으로 테스트:

```bash
# Python 가상 환경 활성화
cd ~/lumiscape
source venv/bin/activate

# MediaPipe 서비스 실행
cd python
python3 mediapipe_gesture_service.py

# Ctrl+C로 종료
```

---

## 10. 자동 시작 설정

시스템 부팅 시 Lumiscape가 자동으로 시작되도록 설정합니다.

### 10.1 systemd 서비스 파일 생성

```bash
# 서비스 파일 생성
sudo nano /etc/systemd/system/lumiscape.service
```

**내용 (사용자명과 경로 확인):**

```ini
[Unit]
Description=Lumiscape Smart Glass UI
Documentation=https://github.com/your-repo/lumiscape
After=graphical.target network-online.target
Wants=network-online.target

[Service]
Type=simple
User=pi
Group=pi

# 환경 변수
Environment="DISPLAY=:0"
Environment="QT_QPA_PLATFORM=eglfs"
Environment="QT_DIR=/opt/Qt/6.8.3/gcc_arm64"
Environment="LD_LIBRARY_PATH=/opt/Qt/6.8.3/gcc_arm64/lib"
Environment="PATH=/opt/Qt/6.8.3/gcc_arm64/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"

# Python 가상 환경 활성화
Environment="VIRTUAL_ENV=/home/pi/lumiscape/venv"
Environment="PATH=/home/pi/lumiscape/venv/bin:$PATH"

WorkingDirectory=/home/pi/lumiscape/build
ExecStart=/home/pi/lumiscape/build/Lumiscape

# 재시작 설정
Restart=on-failure
RestartSec=10
KillMode=mixed
TimeoutStopSec=30

# 로그 설정
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=graphical.target
```

**저장:** Ctrl+X, Y, Enter

### 10.2 서비스 활성화 및 시작

```bash
# systemd 데몬 리로드
sudo systemctl daemon-reload

# 서비스 활성화 (부팅 시 자동 시작)
sudo systemctl enable lumiscape.service

# 서비스 즉시 시작
sudo systemctl start lumiscape.service

# 서비스 상태 확인
sudo systemctl status lumiscape.service
```

**정상 작동 시 출력:**

```
● lumiscape.service - Lumiscape Smart Glass UI
     Loaded: loaded (/etc/systemd/system/lumiscape.service; enabled; vendor preset: enabled)
     Active: active (running) since Mon 2025-01-20 10:00:00 KST; 5s ago
   Main PID: 1234 (Lumiscape)
      Tasks: 15 (limit: 4915)
        CPU: 2.345s
     CGroup: /system.slice/lumiscape.service
             └─1234 /home/pi/lumiscape/build/Lumiscape
```

### 10.3 서비스 관리 명령어

```bash
# 서비스 중지
sudo systemctl stop lumiscape.service

# 서비스 재시작
sudo systemctl restart lumiscape.service

# 자동 시작 비활성화
sudo systemctl disable lumiscape.service

# 로그 확인
sudo journalctl -u lumiscape.service -f

# 최근 100줄 로그
sudo journalctl -u lumiscape.service -n 100
```

---

## 11. 문제 해결

### 11.1 Qt 모듈을 찾을 수 없음

**오류:**
```
CMake Error: Could not find a configuration file for package "Qt6"
```

**해결:**

```bash
# Qt 경로 확인
which qmake6

# CMake에 Qt 경로 명시
cmake .. -DCMAKE_PREFIX_PATH=/opt/Qt/6.8.3/gcc_arm64

# 환경 변수 확인
echo $QT_DIR
echo $PATH | grep Qt

# 환경 변수 재설정
source ~/.bashrc
```

### 11.2 MediaPipe 카메라 권한 오류

**오류:**
```
cv2.error: OpenCV(4.x.x) error: (-1:Unspecified error) can't open camera
```

**해결:**

```bash
# video 그룹 확인
groups | grep video

# video 그룹에 추가되지 않았다면
sudo usermod -a -G video $USER

# 재로그인 또는 재부팅
sudo reboot

# 카메라 장치 확인
ls -l /dev/video*
v4l2-ctl --list-devices

# 카메라 테스트
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

### 11.3 GStreamer 코덱 누락 (YouTube 재생 실패)

**증상:** YouTube 음악이 재생되지 않거나 무음

**해결:**

```bash
# GStreamer libav 플러그인 설치 확인
dpkg -l | grep gstreamer1.0-libav

# 없다면 설치
sudo apt install -y \
    gstreamer1.0-libav \
    gstreamer1.0-plugins-ugly \
    gstreamer1.0-plugins-bad

# yt-dlp 버전 확인 (2023.10.13 이상)
yt-dlp --version

# yt-dlp 업그레이드
pip install --upgrade yt-dlp

# YouTube 서비스 테스트
cd ~/lumiscape/python
source ../venv/bin/activate
python3 youtube_audio_service.py

# 입력 예시:
# {"youtubeUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}
```

### 11.4 MQTT 연결 실패

**오류:**
```
MQTT error: Bad username or password
```

**해결:**

```bash
# 설정 파일 확인
nano ~/lumiscape/assets/presets/config.json

# MQTT 브로커 연결 테스트 (mosquitto-clients 필요)
sudo apt install -y mosquitto-clients

mosquitto_sub -h your-mqtt-broker.com -p 8883 \
    -u your-username -P your-password \
    -t "test/topic" --capath /etc/ssl/certs

# 네트워크 연결 확인
ping your-mqtt-broker.com
```

### 11.5 메모리 부족

**증상:** 앱이 느리거나 충돌

**해결:**

```bash
# 현재 메모리 사용량 확인
free -h

# 스왑 파일 크기 증가
sudo dphys-swapfile swapoff
sudo nano /etc/dphys-swapfile
# CONF_SWAPSIZE=2048 (2GB로 변경)
sudo dphys-swapfile setup
sudo dphys-swapfile swapon

# GPU 메모리 증가
sudo raspi-config
# Performance Options → GPU Memory → 256MB 설정

# 재부팅
sudo reboot
```

### 11.6 화면이 표시되지 않음

**해결:**

```bash
# EGLFS 플랫폼 사용 (전체화면)
export QT_QPA_PLATFORM=eglfs
./Lumiscape

# 또는 X11 사용 (데스크탑 환경)
export QT_QPA_PLATFORM=xcb
./Lumiscape

# 환경 변수 영구 설정
echo 'export QT_QPA_PLATFORM=eglfs' >> ~/.bashrc
```

### 11.7 빌드 실패 시 클린 빌드

```bash
cd ~/lumiscape

# 빌드 디렉토리 삭제
rm -rf build

# 재빌드
mkdir build && cd build
cmake .. -DCMAKE_PREFIX_PATH=/opt/Qt/6.8.3/gcc_arm64
cmake --build . --parallel 4
```

---

## 12. 성능 최적화

### 12.1 오버클럭 (Raspberry Pi 4)

> ⚠️ **주의:** 오버클럭 시 냉각 솔루션(팬 또는 히트싱크) 필수

```bash
# 설정 파일 편집
sudo nano /boot/firmware/config.txt

# 파일 끝에 추가
[pi4]
arm_freq=2000
gpu_freq=750
over_voltage=6
temp_limit=80
```

**저장 후 재부팅:**
```bash
sudo reboot
```

### 12.2 QML 캐시 활성화

```bash
# .bashrc에 추가
nano ~/.bashrc

# 추가 내용
export QML_DISK_CACHE=1
export QML_DISK_CACHE_PATH=/tmp/qmlcache

# 적용
source ~/.bashrc
```

### 12.3 불필요한 서비스 비활성화

```bash
# Bluetooth 불필요 시
sudo systemctl disable bluetooth
sudo systemctl stop bluetooth

# WiFi 불필요 시 (이더넷 사용)
sudo systemctl disable wpa_supplicant

# Avahi (Bonjour) 불필요 시
sudo systemctl disable avahi-daemon

# 재부팅
sudo reboot
```

### 12.4 해상도 조정

낮은 해상도로 실행하여 성능 향상:

```bash
# config.json 수정
nano ~/lumiscape/assets/presets/config.json

# screenWidth/Height 추가 또는 수정
{
  "screenWidth": 1280,
  "screenHeight": 720
}
```

### 12.5 MediaPipe 최적화

```bash
# config.json 수정
nano ~/lumiscape/assets/presets/config.json

# MediaPipe 설정 조정
{
  "mediapipe": {
    "cameraId": 0,
    "minDetectionConfidence": 0.5,
    "minTrackingConfidence": 0.3
  }
}
```

### 12.6 CPU 거버너 설정

```bash
# 성능 모드로 전환 (배터리 사용량 증가)
echo performance | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor

# 영구 설정
sudo apt install -y cpufrequtils
echo 'GOVERNOR="performance"' | sudo tee /etc/default/cpufrequtils
sudo systemctl restart cpufrequtils
```

---

## 📊 성능 벤치마크

| 모델 | RAM | 예상 FPS | 빌드 시간 | 권장 해상도 |
|------|-----|----------|-----------|------------|
| Raspberry Pi 4 (4GB) | 4GB | 20-30 FPS | 20-30분 | 1280x720 |
| Raspberry Pi 4 (8GB) | 8GB | 30-45 FPS | 20-30분 | 1920x1080 |
| Raspberry Pi 5 (8GB) | 8GB | 45-60 FPS | 10-20분 | 1920x1080 |

---

## 📝 체크리스트

설치가 완료되었는지 확인하세요:

- [ ] Raspberry Pi OS 64-bit 설치 완료
- [ ] 시스템 업데이트 완료
- [ ] Qt 6.8+ 설치 및 환경 변수 설정 완료
- [ ] 모든 시스템 라이브러리 설치 완료
- [ ] Python 3.9+ 및 가상 환경 설정 완료
- [ ] Python 패키지 설치 완료 (opencv, mediapipe, numpy, yt-dlp)
- [ ] 하드웨어 권한 설정 완료 (gpio, video, dialout)
- [ ] 프로젝트 클론 및 설정 파일 수정 완료
- [ ] CMake 설정 성공
- [ ] 빌드 성공 (./Lumiscape 실행 파일 생성)
- [ ] 첫 실행 성공
- [ ] 카메라 및 제스처 인식 정상 작동
- [ ] (선택) 자동 시작 서비스 설정 완료

---

## 🔗 관련 문서

- **[CLAUDE.md](./CLAUDE.md)** - 프로젝트 전체 아키텍처 및 개발 가이드
- **[README.md](./README.md)** - 프로젝트 개요 및 기본 사용법
- **[RASPBERRY_PI_DEPLOYMENT.md](./RASPBERRY_PI_DEPLOYMENT.md)** - 기존 배포 가이드 (레퍼런스)
- **[INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md)** - 패키지 상세 설명 (레퍼런스)

---

## 🆘 추가 지원

문제가 지속되거나 도움이 필요한 경우:

1. **GitHub Issues**: [프로젝트 이슈 페이지]
2. **로그 파일 확인**:
   ```bash
   # 실행 로그
   sudo journalctl -u lumiscape.service -f

   # MediaPipe 로그
   ~/lumiscape/build/Lumiscape 2>&1 | grep MediaPipe
   ```

3. **버그 리포트 시 포함할 정보**:
   - 라즈베리파이 모델 및 RAM
   - OS 버전: `cat /etc/os-release`
   - Qt 버전: `qmake6 --version`
   - Python 버전: `python3 --version`
   - 전체 에러 로그

---

## 📅 문서 정보

- **최종 업데이트:** 2025-01-20
- **Qt 버전:** 6.8.3 / 6.9.x
- **테스트 환경:** Raspberry Pi 4 Model B (8GB), Raspberry Pi OS 64-bit Bookworm
- **작성자:** Lumiscape Development Team

---

**설치를 완료하셨습니다! 🎉**

Lumiscape를 즐겁게 사용하세요. 제스처로 미래를 경험하세요!
