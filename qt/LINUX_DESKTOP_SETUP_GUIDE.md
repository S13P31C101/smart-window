# Lumiscape - Linux Desktop (AMD/Intel) 설치 가이드

AMD 또는 Intel 프로세서를 사용하는 Linux 데스크탑/노트북에서 Lumiscape 스마트 글래스 UI 시스템을 설치하고 실행하기 위한 완전한 가이드입니다.

---

## 📋 목차

1. [시스템 요구사항](#1-시스템-요구사항)
2. [지원 배포판](#2-지원-배포판)
3. [시스템 준비](#3-시스템-준비)
4. [Qt 6.8+ 설치](#4-qt-68-설치)
5. [시스템 라이브러리 설치](#5-시스템-라이브러리-설치)
6. [Python 환경 설정](#6-python-환경-설정)
7. [프로젝트 다운로드 및 설정](#7-프로젝트-다운로드-및-설정)
8. [빌드 및 실행](#8-빌드-및-실행)
9. [자동 시작 설정](#9-자동-시작-설정-선택사항)
10. [문제 해결](#10-문제-해결)
11. [성능 최적화](#11-성능-최적化)

---

## 1. 시스템 요구사항

### 1.1 하드웨어

**최소 사양:**
- **CPU:** AMD Ryzen 3 / Intel Core i3 (4세대 이상) 또는 동급
- **RAM:** 4GB (8GB 이상 권장)
- **저장공간:** 20GB 이상 여유 공간
- **그래픽:** OpenGL 3.3 이상 지원 (통합 그래픽 가능)
- **웹캠:** USB 웹캠 또는 내장 카메라 (제스처 인식용, 선택사항)

**권장 사양:**
- **CPU:** AMD Ryzen 5 / Intel Core i5 이상
- **RAM:** 8GB 이상
- **그래픽:** 전용 GPU (AMD/NVIDIA) 또는 최신 통합 그래픽
- **디스플레이:** 1920x1080 이상

### 1.2 소프트웨어

- **운영체제:** Linux (64-bit)
  - Ubuntu 22.04 LTS / 24.04 LTS
  - Fedora 38+
  - Arch Linux
  - Debian 12+
  - openSUSE Leap 15.5+
- **Qt 버전:** 6.8.3 이상 (6.9.x 권장)
- **Python 버전:** 3.9 이상 (3.11+ 권장)
- **CMake 버전:** 3.21 이상
- **Kernel:** 5.15 이상

### 1.3 네트워크

- 인터넷 연결 (패키지 다운로드 및 API 사용)

---

## 2. 지원 배포판

이 가이드는 주요 Linux 배포판을 지원합니다. 각 배포판별 명령어가 제공됩니다.

### 2.1 Ubuntu/Debian 계열

- Ubuntu 22.04 LTS (Jammy)
- Ubuntu 24.04 LTS (Noble)
- Debian 12 (Bookworm)
- Linux Mint 21+
- Pop!_OS 22.04+

**패키지 관리자:** `apt`

### 2.2 Fedora/RHEL 계열

- Fedora 38+
- RHEL 9+
- CentOS Stream 9+
- Rocky Linux 9+

**패키지 관리자:** `dnf`

### 2.3 Arch 계열

- Arch Linux
- Manjaro
- EndeavourOS

**패키지 관리자:** `pacman`

### 2.4 openSUSE

- openSUSE Leap 15.5+
- openSUSE Tumbleweed

**패키지 관리자:** `zypper`

---

## 3. 시스템 준비

### 3.1 시스템 업데이트

배포판에 맞는 명령어를 선택하세요.

#### Ubuntu/Debian

```bash
sudo apt update
sudo apt upgrade -y
sudo apt autoremove -y
```

#### Fedora

```bash
sudo dnf update -y
sudo dnf autoremove -y
```

#### Arch Linux

```bash
sudo pacman -Syu
```

#### openSUSE

```bash
sudo zypper refresh
sudo zypper update -y
```

### 3.2 필수 빌드 도구 설치

#### Ubuntu/Debian

```bash
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
    curl \
    tar \
    unzip
```

#### Fedora

```bash
sudo dnf groupinstall -y "Development Tools"
sudo dnf install -y \
    gcc \
    gcc-c++ \
    cmake \
    ninja-build \
    git \
    pkg-config \
    wget \
    curl
```

#### Arch Linux

```bash
sudo pacman -S --needed \
    base-devel \
    cmake \
    ninja \
    git \
    wget \
    curl
```

#### openSUSE

```bash
sudo zypper install -y -t pattern devel_basis
sudo zypper install -y \
    cmake \
    ninja \
    git \
    wget \
    curl
```

### 3.3 설치 확인

```bash
# GCC 버전 (7.0 이상)
gcc --version

# CMake 버전 (3.21 이상)
cmake --version

# Git 버전
git --version
```

---

## 4. Qt 6.8+ 설치

Qt는 Lumiscape의 핵심 UI 프레임워크입니다. **Qt 6.8.3 이상** 버전이 필요합니다.

### 4.1 방법 1: Qt Online Installer (권장)

#### 4.1.1 Installer 다운로드

```bash
# 홈 디렉토리로 이동
cd ~

# x86_64용 Qt Online Installer 다운로드
wget https://download.qt.io/official_releases/online_installers/qt-unified-linux-x64-online.run

# 실행 권한 부여
chmod +x qt-unified-linux-x64-online.run
```

#### 4.1.2 Installer 실행

```bash
# GUI 환경에서 실행
./qt-unified-linux-x64-online.run
```

**설치 진행:**

1. **Qt 계정 로그인**
   - 계정이 없다면 무료 계정 생성: [https://login.qt.io/register](https://login.qt.io/register)

2. **설치 타입 선택**
   - "Custom Installation" 선택

3. **Qt 버전 선택**
   - **Qt 6.8.3** 또는 **Qt 6.9.x** 선택 (최신 안정 버전)

4. **필수 컴포넌트 선택**
   - ✅ **Qt 6.8.3 (또는 6.9.x) for Linux Desktop**
   - ✅ **Qt Quick**
   - ✅ **Qt Quick Controls 2**
   - ✅ **Qt Network**
   - ✅ **Qt Multimedia**
   - ✅ **Qt MQTT**
   - ✅ **Qt SVG**
   - ✅ **Qt SerialPort**
   - ✅ **Qt WebChannel**
   - ✅ **Qt WebEngine** (YouTube 재생용, 권장)
   - ✅ **Qt Concurrent**
   - ✅ **Qt Positioning** (선택사항)
   - ✅ **Qt Charts** (선택사항)

5. **설치 경로 설정**
   - 권장 경로: `/opt/Qt/6.8.3` (또는 `~/Qt/6.8.3`)

6. **설치 시작**
   - "Install" 클릭 (약 10-30분 소요)

#### 4.1.3 Qt 환경 변수 설정

```bash
# Qt 설치 경로 확인 (버전에 맞게 수정)
ls /opt/Qt/
# 또는
ls ~/Qt/

# .bashrc 편집
nano ~/.bashrc
```

**파일 끝에 다음 내용 추가** (Qt 버전 및 설치 경로에 맞게 수정):

```bash
# Qt 6.8.3 Environment Variables
export QT_DIR=/opt/Qt/6.8.3/gcc_64
export PATH=$QT_DIR/bin:$PATH
export LD_LIBRARY_PATH=$QT_DIR/lib:$LD_LIBRARY_PATH
export PKG_CONFIG_PATH=$QT_DIR/lib/pkgconfig:$PKG_CONFIG_PATH
export QML_IMPORT_PATH=$QT_DIR/qml
export QT_PLUGIN_PATH=$QT_DIR/plugins
```

**저장 및 적용:**

```bash
# Ctrl+X, Y, Enter로 저장

# 변경사항 적용
source ~/.bashrc

# Qt 설치 확인
qmake6 --version
# 출력: QMake version 3.1, Using Qt version 6.8.3

which qmake6
```

### 4.2 방법 2: 배포판 패키지 관리자 (제한적)

> ⚠️ **주의:** 배포판 저장소의 Qt 버전이 6.5 미만일 수 있습니다. Qt Online Installer 사용을 권장합니다.

#### Ubuntu 24.04+

```bash
sudo apt install -y \
    qt6-base-dev \
    qt6-declarative-dev \
    qt6-multimedia-dev \
    qml6-module-qtquick \
    qml6-module-qtquick-controls \
    libqt6network6 \
    libqt6svg6-dev \
    libqt6serialport6-dev
```

#### Fedora 38+

```bash
sudo dnf install -y \
    qt6-qtbase-devel \
    qt6-qtdeclarative-devel \
    qt6-qtmultimedia-devel \
    qt6-qtnetworkauth-devel \
    qt6-qtsvg-devel \
    qt6-qtserialport-devel
```

#### Arch Linux

```bash
sudo pacman -S \
    qt6-base \
    qt6-declarative \
    qt6-multimedia \
    qt6-svg \
    qt6-serialport \
    qt6-websockets
```

---

## 5. 시스템 라이브러리 설치

### 5.1 보안 및 네트워크 라이브러리

#### Ubuntu/Debian

```bash
sudo apt install -y \
    libssl-dev \
    libdbus-1-dev \
    ca-certificates \
    openssl
```

#### Fedora

```bash
sudo dnf install -y \
    openssl-devel \
    dbus-devel
```

#### Arch Linux

```bash
sudo pacman -S \
    openssl \
    dbus
```

#### openSUSE

```bash
sudo zypper install -y \
    libopenssl-devel \
    dbus-1-devel
```

### 5.2 멀티미디어 라이브러리 (GStreamer)

Qt Multimedia는 GStreamer를 백엔드로 사용하므로 필수입니다.

#### Ubuntu/Debian

```bash
sudo apt install -y \
    libgstreamer1.0-dev \
    libgstreamer-plugins-base1.0-dev \
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

#### Fedora

```bash
sudo dnf install -y \
    gstreamer1-devel \
    gstreamer1-plugins-base-devel \
    gstreamer1-plugins-base \
    gstreamer1-plugins-good \
    gstreamer1-plugins-bad-free \
    gstreamer1-plugins-ugly-free \
    gstreamer1-libav \
    pulseaudio-libs-devel \
    alsa-lib-devel

# RPM Fusion 저장소 추가 (H.264 코덱용)
sudo dnf install -y \
    https://download1.rpmfusion.org/free/fedora/rpmfusion-free-release-$(rpm -E %fedora).noarch.rpm \
    https://download1.rpmfusion.org/nonfree/fedora/rpmfusion-nonfree-release-$(rpm -E %fedora).noarch.rpm

sudo dnf install -y \
    gstreamer1-plugins-bad-free-extras \
    gstreamer1-plugins-ugly
```

#### Arch Linux

```bash
sudo pacman -S \
    gstreamer \
    gst-plugins-base \
    gst-plugins-good \
    gst-plugins-bad \
    gst-plugins-ugly \
    gst-libav \
    pulseaudio \
    alsa-lib
```

#### openSUSE

```bash
sudo zypper install -y \
    gstreamer-devel \
    gstreamer-plugins-base-devel \
    gstreamer-plugins-base \
    gstreamer-plugins-good \
    gstreamer-plugins-bad \
    gstreamer-plugins-ugly \
    gstreamer-plugins-libav \
    pulseaudio-devel
```

**GStreamer 설치 확인:**

```bash
gst-launch-1.0 --version
gst-inspect-1.0 | grep -E "libav|x264|aac"
```

### 5.3 그래픽 및 렌더링 라이브러리

#### Ubuntu/Debian

```bash
sudo apt install -y \
    libgl1-mesa-dev \
    libglu1-mesa-dev \
    libegl1-mesa-dev \
    libgles2-mesa-dev \
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
    libxcb-render-util0-dev \
    libxkbcommon-dev \
    libxkbcommon-x11-dev
```

#### Fedora

```bash
sudo dnf install -y \
    mesa-libGL-devel \
    mesa-libGLU-devel \
    mesa-libEGL-devel \
    mesa-libGLES-devel \
    libX11-devel \
    libXext-devel \
    libXfixes-devel \
    libXi-devel \
    libXrender-devel \
    libxcb-devel \
    xcb-util-keysyms-devel \
    xcb-util-image-devel \
    xcb-util-wm-devel \
    xcb-util-renderutil-devel \
    libxkbcommon-devel \
    libxkbcommon-x11-devel
```

#### Arch Linux

```bash
sudo pacman -S \
    mesa \
    libglvnd \
    libx11 \
    libxext \
    libxfixes \
    libxi \
    libxrender \
    libxcb \
    xcb-util-keysyms \
    xcb-util-image \
    xcb-util-wm \
    xcb-util-renderutil \
    libxkbcommon \
    libxkbcommon-x11
```

#### openSUSE

```bash
sudo zypper install -y \
    Mesa-libGL-devel \
    Mesa-libGLU-devel \
    Mesa-libEGL-devel \
    libX11-devel \
    libXext-devel \
    libXfixes-devel \
    libXi-devel \
    libXrender-devel \
    libxcb-devel \
    xcb-util-keysyms-devel \
    xcb-util-image-devel \
    xcb-util-wm-devel \
    libxkbcommon-devel
```

### 5.4 폰트 라이브러리

#### Ubuntu/Debian

```bash
sudo apt install -y \
    fontconfig \
    libfontconfig1-dev \
    libfreetype6-dev \
    fonts-noto \
    fonts-noto-cjk \
    fonts-noto-color-emoji
```

#### Fedora

```bash
sudo dnf install -y \
    fontconfig-devel \
    freetype-devel \
    google-noto-sans-fonts \
    google-noto-cjk-fonts \
    google-noto-emoji-fonts
```

#### Arch Linux

```bash
sudo pacman -S \
    fontconfig \
    freetype2 \
    noto-fonts \
    noto-fonts-cjk \
    noto-fonts-emoji
```

#### openSUSE

```bash
sudo zypper install -y \
    fontconfig-devel \
    freetype2-devel \
    google-noto-sans-fonts \
    google-noto-sans-cjk-fonts
```

---

## 6. Python 환경 설정

### 6.1 Python 기본 패키지 설치

#### Ubuntu/Debian

```bash
sudo apt install -y \
    python3 \
    python3-pip \
    python3-venv \
    python3-dev
```

#### Fedora

```bash
sudo dnf install -y \
    python3 \
    python3-pip \
    python3-virtualenv \
    python3-devel
```

#### Arch Linux

```bash
sudo pacman -S \
    python \
    python-pip \
    python-virtualenv
```

#### openSUSE

```bash
sudo zypper install -y \
    python3 \
    python3-pip \
    python3-virtualenv \
    python3-devel
```

**Python 버전 확인:**

```bash
python3 --version  # Python 3.9 이상 필요
```

### 6.2 시스템 레벨 Python 라이브러리 (선택사항)

#### Ubuntu/Debian

```bash
sudo apt install -y \
    python3-opencv \
    python3-numpy
```

#### Fedora

```bash
sudo dnf install -y \
    python3-opencv \
    python3-numpy
```

#### Arch Linux

```bash
sudo pacman -S \
    python-opencv \
    python-numpy
```

---

## 7. 프로젝트 다운로드 및 설정

### 7.1 프로젝트 클론

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

### 7.2 Python 가상 환경 설정

```bash
# 가상 환경 생성
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
pip list | grep -E "opencv|mediapipe|numpy|yt-dlp"

python3 -c "import cv2; print('OpenCV:', cv2.__version__)"
python3 -c "import mediapipe; print('MediaPipe:', mediapipe.__version__)"
python3 -c "import numpy; print('NumPy:', numpy.__version__)"
python3 -c "import yt_dlp; print('yt-dlp OK')"
```

### 7.3 CMakeLists.txt 수정 (Qt 버전 맞추기)

프로젝트는 Qt 6.9를 요구하지만, Qt 6.8.3을 설치한 경우 수정이 필요합니다.

```bash
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

### 7.4 설정 파일 수정

API 키 및 MQTT 설정을 구성합니다.

```bash
nano assets/presets/config.json
```

**수정할 항목:**

```json
{
  "deviceUniqueId": "LUMISCAPE_DESKTOP_001",
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

## 8. 빌드 및 실행

### 8.1 빌드 디렉토리 생성

```bash
cd ~/lumiscape

# 빌드 디렉토리 생성
mkdir build
cd build
```

### 8.2 CMake 설정

```bash
# CMake 설정 실행
cmake .. \
    -DCMAKE_BUILD_TYPE=Release \
    -DCMAKE_PREFIX_PATH=/opt/Qt/6.8.3/gcc_64 \
    -DLUMISCAPE_ENABLE_LOGGING=ON
```

**주요 옵션:**
- `CMAKE_BUILD_TYPE=Release`: 최적화된 릴리즈 빌드
- `CMAKE_PREFIX_PATH`: Qt 설치 경로 (설치 경로에 맞게 수정)
- `LUMISCAPE_ENABLE_LOGGING=ON`: 디버깅 로그 활성화

**성공 메시지 예시:**

```
-- The CXX compiler identification is GNU 13.2.0
-- Found Qt6: 6.8.3
-- Configuring done
-- Generating done
-- Build files have been written to: /home/user/lumiscape/build
```

### 8.3 빌드 실행

```bash
# CPU 코어 수만큼 병렬 빌드
cmake --build . --config Release --parallel $(nproc)

# 또는 make 사용
make -j$(nproc)
```

**예상 빌드 시간:**
- **최신 CPU (Ryzen 5/Core i5 이상):** 3-5분
- **중급 CPU:** 5-10분
- **저사양 CPU:** 10-15분

**빌드 성공 메시지:**

```
[100%] Linking CXX executable Lumiscape
[100%] Built target Lumiscape
```

### 8.4 실행

```bash
# 빌드 디렉토리에서 실행
./Lumiscape

# 또는 전체 경로로 실행
/home/user/lumiscape/build/Lumiscape
```

**첫 실행 시 확인사항:**

1. **카메라 권한 확인**
   - MediaPipe 서비스가 자동으로 시작됨
   - 웹캠이 정상적으로 인식되는지 확인

2. **제스처 테스트**
   - 카메라 앞에서 손을 움직여 커서 이동 확인
   - 주먹(fist): 클릭
   - 손바닥(open_palm): 뒤로가기

3. **화면 모드 전환**
   - 메뉴에서 다양한 모드 테스트
   - Glass Mode, Privacy Mode, Custom Mode 등

### 8.5 MediaPipe 서비스 단독 테스트

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

### 8.6 웹캠 테스트

```bash
# 웹캠 장치 확인
ls -l /dev/video*

# v4l2 도구로 웹캠 정보 확인
v4l2-ctl --list-devices

# Python으로 웹캠 테스트
python3 << 'EOF'
import cv2
cap = cv2.VideoCapture(0)
if cap.isOpened():
    print("✅ 웹캠 정상 작동")
    ret, frame = cap.read()
    if ret:
        print(f"해상도: {frame.shape[1]}x{frame.shape[0]}")
    cap.release()
else:
    print("❌ 웹캠 열기 실패")
EOF
```

---

## 9. 자동 시작 설정 (선택사항)

로그인 시 Lumiscape가 자동으로 시작되도록 설정합니다.

### 9.1 systemd 사용자 서비스 생성

```bash
# 사용자 systemd 디렉토리 생성
mkdir -p ~/.config/systemd/user

# 서비스 파일 생성
nano ~/.config/systemd/user/lumiscape.service
```

**내용 (경로 확인):**

```ini
[Unit]
Description=Lumiscape Smart Glass UI
Documentation=https://github.com/your-repo/lumiscape
After=graphical.target

[Service]
Type=simple

# 환경 변수
Environment="DISPLAY=:0"
Environment="QT_DIR=/opt/Qt/6.8.3/gcc_64"
Environment="LD_LIBRARY_PATH=/opt/Qt/6.8.3/gcc_64/lib"
Environment="PATH=/opt/Qt/6.8.3/gcc_64/bin:/usr/local/bin:/usr/bin:/bin"

# Python 가상 환경
Environment="VIRTUAL_ENV=%h/lumiscape/venv"
Environment="PATH=%h/lumiscape/venv/bin:$PATH"

WorkingDirectory=%h/lumiscape/build
ExecStart=%h/lumiscape/build/Lumiscape

# 재시작 설정
Restart=on-failure
RestartSec=5

# 로그 설정
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=default.target
```

**저장:** Ctrl+X, Y, Enter

### 9.2 서비스 활성화

```bash
# systemd 사용자 데몬 리로드
systemctl --user daemon-reload

# 서비스 활성화 (로그인 시 자동 시작)
systemctl --user enable lumiscape.service

# 서비스 즉시 시작
systemctl --user start lumiscape.service

# 서비스 상태 확인
systemctl --user status lumiscape.service
```

### 9.3 서비스 관리 명령어

```bash
# 서비스 중지
systemctl --user stop lumiscape.service

# 서비스 재시작
systemctl --user restart lumiscape.service

# 자동 시작 비활성화
systemctl --user disable lumiscape.service

# 로그 확인
journalctl --user -u lumiscape.service -f
```

### 9.4 데스크탑 자동 시작 (대안)

systemd 대신 데스크탑 환경의 자동 시작 기능 사용:

```bash
# 자동 시작 디렉토리 생성
mkdir -p ~/.config/autostart

# 데스크탑 파일 생성
nano ~/.config/autostart/lumiscape.desktop
```

**내용:**

```ini
[Desktop Entry]
Type=Application
Name=Lumiscape
Comment=Smart Glass UI System
Exec=/home/user/lumiscape/build/Lumiscape
Icon=/home/user/lumiscape/assets/icon.png
Terminal=false
Categories=Utility;
```

**저장:** Ctrl+X, Y, Enter

---

## 10. 문제 해결

### 10.1 Qt 모듈을 찾을 수 없음

**오류:**
```
CMake Error: Could not find a configuration file for package "Qt6"
```

**해결:**

```bash
# Qt 경로 확인
which qmake6

# CMake에 Qt 경로 명시
cmake .. -DCMAKE_PREFIX_PATH=/opt/Qt/6.8.3/gcc_64

# 환경 변수 확인
echo $QT_DIR
echo $PATH | grep Qt

# 환경 변수 재설정
source ~/.bashrc
```

### 10.2 웹캠 권한 오류

**오류:**
```
cv2.error: can't open camera by index 0
```

**해결:**

```bash
# video 그룹에 사용자 추가
sudo usermod -a -G video $USER

# 재로그인 또는 재부팅
# 로그아웃 후 다시 로그인

# 웹캠 장치 확인
ls -l /dev/video*

# 웹캠 권한 확인
groups | grep video

# 웹캠 테스트
cheese  # GNOME Cheese 카메라 앱
# 또는
guvcview  # GTK+ UVC Viewer
```

### 10.3 GStreamer 코덱 누락 (YouTube 재생 실패)

**증상:** YouTube 음악이 재생되지 않거나 무음

**해결:**

#### Ubuntu/Debian

```bash
# GStreamer libav 플러그인 확인
dpkg -l | grep gstreamer1.0-libav

# 없다면 설치
sudo apt install -y \
    gstreamer1.0-libav \
    gstreamer1.0-plugins-ugly \
    gstreamer1.0-plugins-bad

# yt-dlp 업그레이드
pip install --upgrade yt-dlp
```

#### Fedora

```bash
# RPM Fusion 저장소 확인
dnf repolist | grep rpmfusion

# GStreamer 플러그인 설치
sudo dnf install -y \
    gstreamer1-libav \
    gstreamer1-plugins-ugly \
    gstreamer1-plugins-bad-free-extras

# yt-dlp 업그레이드
pip install --upgrade yt-dlp
```

#### Arch Linux

```bash
# GStreamer 플러그인 확인
pacman -Q gst-libav

# 없다면 설치
sudo pacman -S gst-libav gst-plugins-ugly

# yt-dlp 업그레이드
pip install --upgrade yt-dlp
```

### 10.4 NVIDIA GPU 관련 문제

**증상:** 화면이 느리거나 깜빡임

**해결:**

```bash
# NVIDIA 드라이버 확인
nvidia-smi

# NVIDIA 드라이버 설치 (Ubuntu)
sudo apt install -y nvidia-driver-535

# NVIDIA 드라이버 설치 (Fedora)
sudo dnf install -y akmod-nvidia

# NVIDIA 드라이버 설치 (Arch)
sudo pacman -S nvidia nvidia-utils

# 재부팅
sudo reboot

# Qt에서 NVIDIA GPU 강제 사용
export __NV_PRIME_RENDER_OFFLOAD=1
export __GLX_VENDOR_LIBRARY_NAME=nvidia
./Lumiscape
```

### 10.5 AMD GPU 관련 문제

**증상:** 화면이 느리거나 그래픽 오류

**해결:**

```bash
# Mesa 드라이버 확인
glxinfo | grep "OpenGL renderer"

# Mesa 최신 버전 설치 (Ubuntu)
sudo add-apt-repository ppa:kisak/kisak-mesa
sudo apt update
sudo apt upgrade

# Mesa 최신 버전 설치 (Fedora)
sudo dnf upgrade mesa*

# RADV 드라이버 강제 사용
export MESA_LOADER_DRIVER_OVERRIDE=radv
./Lumiscape

# AMDGPU 프로 드라이버 사용 (선택사항)
# https://www.amd.com/en/support/linux-drivers
```

### 10.6 Wayland vs X11 문제

**증상:** Qt 앱이 실행되지 않거나 입력 오류

**해결:**

```bash
# 현재 디스플레이 서버 확인
echo $XDG_SESSION_TYPE

# X11 강제 사용
export QT_QPA_PLATFORM=xcb
./Lumiscape

# Wayland 강제 사용
export QT_QPA_PLATFORM=wayland
./Lumiscape

# 환경 변수 영구 설정
echo 'export QT_QPA_PLATFORM=xcb' >> ~/.bashrc
```

### 10.7 빌드 실패 시 클린 빌드

```bash
cd ~/lumiscape

# 빌드 디렉토리 삭제
rm -rf build

# 재빌드
mkdir build && cd build
cmake .. -DCMAKE_PREFIX_PATH=/opt/Qt/6.8.3/gcc_64
cmake --build . --parallel $(nproc)
```

### 10.8 Python 패키지 충돌

**오류:**
```
ImportError: cannot import name 'something'
```

**해결:**

```bash
# 가상 환경 삭제 및 재생성
cd ~/lumiscape
rm -rf venv
python3 -m venv venv
source venv/bin/activate

# pip 업그레이드
pip install --upgrade pip

# 의존성 재설치
pip install -r python/requirements.txt

# 캐시 클리어
pip cache purge
```

---

## 11. 성능 최적화

### 11.1 GPU 가속 활성화

#### NVIDIA GPU

```bash
# .bashrc에 추가
nano ~/.bashrc

# 추가 내용
export __NV_PRIME_RENDER_OFFLOAD=1
export __GLX_VENDOR_LIBRARY_NAME=nvidia
export VK_ICD_FILENAMES=/usr/share/vulkan/icd.d/nvidia_icd.json

# 적용
source ~/.bashrc
```

#### AMD GPU

```bash
# .bashrc에 추가
nano ~/.bashrc

# 추가 내용
export MESA_LOADER_DRIVER_OVERRIDE=radv
export AMD_VULKAN_ICD=RADV

# 적용
source ~/.bashrc
```

### 11.2 QML 캐시 활성화

```bash
# .bashrc에 추가
nano ~/.bashrc

# 추가 내용
export QML_DISK_CACHE=1
export QML_DISK_CACHE_PATH=~/.cache/qmlcache

# 적용
source ~/.bashrc
```

### 11.3 CPU 거버너 설정

```bash
# 현재 거버너 확인
cat /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor

# 성능 모드로 전환 (일시적)
echo performance | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor

# 영구 설정 (Ubuntu/Debian)
sudo apt install -y cpufrequtils
echo 'GOVERNOR="performance"' | sudo tee /etc/default/cpufrequtils
sudo systemctl restart cpufrequtils
```

### 11.4 컴파일러 최적화

더 빠른 실행 파일을 위한 고급 최적화:

```bash
cd ~/lumiscape/build

# 공격적인 최적화로 재빌드
cmake .. \
    -DCMAKE_BUILD_TYPE=Release \
    -DCMAKE_CXX_FLAGS="-O3 -march=native -mtune=native" \
    -DCMAKE_PREFIX_PATH=/opt/Qt/6.8.3/gcc_64

cmake --build . --parallel $(nproc)
```

### 11.5 메모리 스왑 최적화

```bash
# 현재 스왑 사용량 확인
free -h

# 스왑 사용 줄이기 (RAM 8GB 이상)
sudo sysctl vm.swappiness=10

# 영구 설정
echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
```

### 11.6 불필요한 서비스 비활성화

```bash
# Bluetooth 불필요 시
sudo systemctl disable bluetooth
sudo systemctl stop bluetooth

# CUPS 프린터 서비스 (프린터 사용 안 할 시)
sudo systemctl disable cups
sudo systemctl stop cups
```

---

## 📊 성능 벤치마크

| CPU | GPU | RAM | 예상 FPS | 빌드 시간 | 권장 해상도 |
|-----|-----|-----|----------|-----------|------------|
| Ryzen 3/Core i3 | 통합 그래픽 | 4GB | 30-45 FPS | 10-15분 | 1280x720 |
| Ryzen 5/Core i5 | 통합 그래픽 | 8GB | 45-60 FPS | 5-10분 | 1920x1080 |
| Ryzen 5/Core i5 | 전용 GPU | 8GB | 60+ FPS | 3-5분 | 1920x1080 |
| Ryzen 7/Core i7 | RTX/RX 6000 | 16GB | 120+ FPS | 2-4분 | 2560x1440+ |

---

## 📝 체크리스트

설치가 완료되었는지 확인하세요:

- [ ] Linux 배포판 최신 업데이트 완료
- [ ] 빌드 도구 설치 완료 (gcc, cmake, git)
- [ ] Qt 6.8+ 설치 및 환경 변수 설정 완료
- [ ] GStreamer 멀티미디어 라이브러리 설치 완료
- [ ] 그래픽 라이브러리 설치 완료 (OpenGL, X11)
- [ ] Python 3.9+ 및 가상 환경 설정 완료
- [ ] Python 패키지 설치 완료 (opencv, mediapipe, numpy, yt-dlp)
- [ ] 프로젝트 클론 및 설정 파일 수정 완료
- [ ] CMake 설정 성공
- [ ] 빌드 성공 (./Lumiscape 실행 파일 생성)
- [ ] 첫 실행 성공
- [ ] 웹캠 및 제스처 인식 정상 작동 (선택사항)
- [ ] (선택) 자동 시작 서비스 설정 완료

---

## 🔗 관련 문서

- **[CLAUDE.md](./CLAUDE.md)** - 프로젝트 전체 아키텍처 및 개발 가이드
- **[README.md](./README.md)** - 프로젝트 개요 및 기본 사용법
- **[RASPBERRY_PI_SETUP_GUIDE.md](./RASPBERRY_PI_SETUP_GUIDE.md)** - 라즈베리파이 전용 가이드

---

## 🆘 추가 지원

문제가 지속되거나 도움이 필요한 경우:

1. **GitHub Issues**: [프로젝트 이슈 페이지]
2. **로그 파일 확인**:
   ```bash
   # 실행 로그
   journalctl --user -u lumiscape.service -f

   # MediaPipe 로그
   ~/lumiscape/build/Lumiscape 2>&1 | grep MediaPipe
   ```

3. **버그 리포트 시 포함할 정보**:
   - 배포판 및 버전: `cat /etc/os-release`
   - CPU/GPU 정보: `lscpu`, `lspci | grep VGA`
   - Qt 버전: `qmake6 --version`
   - Python 버전: `python3 --version`
   - 전체 에러 로그

---

## 🎮 배포판별 빠른 설치 스크립트

각 배포판에 맞는 원클릭 스크립트를 제공합니다.

### Ubuntu/Debian

```bash
#!/bin/bash
# Lumiscape Ubuntu/Debian 설치 스크립트

echo "🚀 Lumiscape 설치를 시작합니다..."

# 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# 빌드 도구
sudo apt install -y build-essential g++ gcc make cmake ninja-build git pkg-config wget curl

# 시스템 라이브러리
sudo apt install -y \
    libssl-dev libdbus-1-dev \
    libgstreamer1.0-dev gstreamer1.0-plugins-base gstreamer1.0-plugins-good \
    gstreamer1.0-plugins-bad gstreamer1.0-plugins-ugly gstreamer1.0-libav \
    libgl1-mesa-dev libglu1-mesa-dev libegl1-mesa-dev \
    libx11-dev libxcb1-dev libxkbcommon-dev \
    fontconfig libfontconfig1-dev fonts-noto fonts-noto-cjk

# Python
sudo apt install -y python3 python3-pip python3-venv python3-dev

echo "✅ 시스템 패키지 설치 완료!"
echo "다음 단계: Qt 6.8+ 설치 (Qt Online Installer 사용)"
```

### Fedora

```bash
#!/bin/bash
# Lumiscape Fedora 설치 스크립트

echo "🚀 Lumiscape 설치를 시작합니다..."

# 시스템 업데이트
sudo dnf update -y

# 빌드 도구
sudo dnf groupinstall -y "Development Tools"
sudo dnf install -y gcc gcc-c++ cmake ninja-build git pkg-config wget curl

# RPM Fusion 저장소
sudo dnf install -y \
    https://download1.rpmfusion.org/free/fedora/rpmfusion-free-release-$(rpm -E %fedora).noarch.rpm \
    https://download1.rpmfusion.org/nonfree/fedora/rpmfusion-nonfree-release-$(rpm -E %fedora).noarch.rpm

# 시스템 라이브러리
sudo dnf install -y \
    openssl-devel dbus-devel \
    gstreamer1-devel gstreamer1-plugins-base gstreamer1-plugins-good \
    gstreamer1-plugins-bad-free gstreamer1-plugins-ugly gstreamer1-libav \
    mesa-libGL-devel mesa-libGLU-devel \
    libX11-devel libxcb-devel libxkbcommon-devel \
    fontconfig-devel google-noto-sans-fonts google-noto-cjk-fonts

# Python
sudo dnf install -y python3 python3-pip python3-virtualenv python3-devel

echo "✅ 시스템 패키지 설치 완료!"
echo "다음 단계: Qt 6.8+ 설치 (Qt Online Installer 사용)"
```

### Arch Linux

```bash
#!/bin/bash
# Lumiscape Arch Linux 설치 스크립트

echo "🚀 Lumiscape 설치를 시작합니다..."

# 시스템 업데이트
sudo pacman -Syu

# 빌드 도구
sudo pacman -S --needed base-devel cmake ninja git wget curl

# 시스템 라이브러리
sudo pacman -S \
    openssl dbus \
    gstreamer gst-plugins-base gst-plugins-good gst-plugins-bad \
    gst-plugins-ugly gst-libav \
    mesa libglvnd \
    libx11 libxcb libxkbcommon \
    fontconfig noto-fonts noto-fonts-cjk

# Python
sudo pacman -S python python-pip python-virtualenv

echo "✅ 시스템 패키지 설치 완료!"
echo "다음 단계: Qt 6.8+ 설치 (Qt Online Installer 사용)"
```

---

## 📅 문서 정보

- **최종 업데이트:** 2025-01-20
- **Qt 버전:** 6.8.3 / 6.9.x
- **테스트 환경:**
  - Ubuntu 24.04 LTS (AMD Ryzen 5, 16GB RAM)
  - Fedora 39 (Intel Core i5, 8GB RAM)
  - Arch Linux (AMD Ryzen 7, 32GB RAM)
- **작성자:** Lumiscape Development Team

---

**설치를 완료하셨습니다! 🎉**

Linux 데스크탑에서 Lumiscape를 즐겁게 사용하세요!
