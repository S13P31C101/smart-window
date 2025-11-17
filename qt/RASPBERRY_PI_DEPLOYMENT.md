# Lumiscape - Raspberry Pi Deployment Guide

라즈베리파이에서 Lumiscape 스마트 글래스 UI 시스템을 실행하기 위한 완전한 가이드입니다.

---

## 📋 목차

1. [시스템 요구사항](#-시스템-요구사항)
2. [사전 준비](#-사전-준비)
3. [Qt 6.8.3 설치](#-qt-683-설치)
4. [의존성 패키지 설치](#-의존성-패키지-설치)
5. [Python 환경 설정](#-python-환경-설정)
6. [코드 수정사항](#-코드-수정사항)
7. [빌드 및 실행](#-빌드-및-실행)
8. [문제 해결](#-문제-해결)
9. [성능 최적화](#-성능-최적화)

---

## 🖥️ 시스템 요구사항

### 하드웨어
- **Raspberry Pi 4 Model B** (4GB RAM 이상 권장)
- **Raspberry Pi 5** (최적 성능)
- microSD 카드: 32GB 이상
- 카메라 모듈 (제스처 인식용, 선택사항)
- 디스플레이: HDMI 연결 가능한 모니터

### 운영체제
- **Raspberry Pi OS (64-bit)** - Bookworm (Debian 12) 기반
- 커널 버전: 6.1 이상

### 네트워크
- 인터넷 연결 (패키지 다운로드 및 API 사용)

---

## 🔧 사전 준비

### 1. Raspberry Pi OS 업데이트

```bash
sudo apt update
sudo apt upgrade -y
sudo reboot
```

### 2. 필수 시스템 패키지 설치

```bash
sudo apt install -y \
    build-essential \
    cmake \
    git \
    pkg-config \
    python3 \
    python3-pip \
    python3-venv \
    libssl-dev \
    libdbus-1-dev \
    libbluetooth-dev \
    libgpiod-dev \
    libgpiod2
```

---

## 📦 Qt 6.8.3 설치

### 옵션 1: Qt Online Installer 사용 (권장)

```bash
# Qt Online Installer 다운로드
wget https://download.qt.io/official_releases/online_installers/qt-unified-linux-arm64-online.run

# 실행 권한 부여
chmod +x qt-unified-linux-arm64-online.run

# 설치 실행 (GUI 필요)
./qt-unified-linux-arm64-online.run
```

**설치 시 선택할 컴포넌트:**
- Qt 6.8.3 for Linux (ARM64)
- Qt Quick
- Qt Quick Controls
- Qt Network
- Qt Multimedia
- Qt MQTT
- Qt WebEngine (선택사항 - 메모리 여유 있을 때만)
- Qt SVG
- Qt Serial Port
- Qt WebChannel
- Qt Positioning

**설치 경로 예시:** `/opt/Qt/6.8.3`

### 옵션 2: 소스 빌드 (고급 사용자)

> ⚠️ **주의**: 소스 빌드는 6-8시간 이상 소요될 수 있습니다.

```bash
# Qt 소스 다운로드
git clone https://code.qt.io/qt/qt5.git -b 6.8.3
cd qt5
./init-repository --module-subset=qtbase,qtdeclarative,qtmultimedia,qtnetworkauth,qtsvg,qtserialport,qtwebchannel

# 빌드 설정
mkdir build && cd build
../configure -prefix /opt/Qt/6.8.3 -release -opensource -confirm-license \
    -nomake examples -nomake tests \
    -skip qtwebengine  # 라즈베리파이에서는 WebEngine 생략 권장

# 빌드 및 설치 (매우 오래 걸림)
cmake --build . --parallel 4
sudo cmake --install .
```

---

## 📚 의존성 패키지 설치

### 1. Qt 추가 라이브러리

```bash
# Qt 6.8.3이 시스템 경로에 없는 경우 환경변수 설정
export QT_DIR=/opt/Qt/6.8.3/gcc_arm64
export PATH=$QT_DIR/bin:$PATH
export LD_LIBRARY_PATH=$QT_DIR/lib:$LD_LIBRARY_PATH
export PKG_CONFIG_PATH=$QT_DIR/lib/pkgconfig:$PKG_CONFIG_PATH

# ~/.bashrc에 추가하여 영구 설정
echo 'export QT_DIR=/opt/Qt/6.8.3/gcc_arm64' >> ~/.bashrc
echo 'export PATH=$QT_DIR/bin:$PATH' >> ~/.bashrc
echo 'export LD_LIBRARY_PATH=$QT_DIR/lib:$LD_LIBRARY_PATH' >> ~/.bashrc
echo 'export PKG_CONFIG_PATH=$QT_DIR/lib/pkgconfig:$PKG_CONFIG_PATH' >> ~/.bashrc
source ~/.bashrc
```

### 2. MQTT 라이브러리

```bash
# Qt MQTT가 포함되지 않은 경우
sudo apt install -y libqt6mqtt6 libqt6mqtt6-dev
```

### 3. 멀티미디어 코덱

```bash
sudo apt install -y \
    libgstreamer1.0-dev \
    libgstreamer-plugins-base1.0-dev \
    gstreamer1.0-plugins-good \
    gstreamer1.0-plugins-bad \
    gstreamer1.0-plugins-ugly \
    gstreamer1.0-libav \
    gstreamer1.0-tools \
    libpulse-dev
```

---

## 🐍 Python 환경 설정

### 1. 가상 환경 생성

```bash
cd /path/to/lumiscape
python3 -m venv venv
source venv/bin/activate
```

### 2. Python 패키지 설치

```bash
# requirements.txt 사용
pip install -r python/requirements.txt

# 또는 개별 설치
pip install opencv-python>=4.8.0
pip install mediapipe>=0.10.0
pip install numpy>=1.24.0
```

### 3. 카메라 권한 설정

```bash
# 현재 사용자를 video 그룹에 추가
sudo usermod -a -G video $USER

# 재로그인 필요
```

---

## ⚙️ 코드 수정사항

### 1. CMakeLists.txt 수정 (필수)

`CMakeLists.txt` 파일의 **29번 라인**을 수정합니다:

**수정 전:**
```cmake
find_package(Qt6 6.9 REQUIRED COMPONENTS
```

**수정 후:**
```cmake
find_package(Qt6 6.8 REQUIRED COMPONENTS
```

### 2. WebEngine 모듈 비활성화 (메모리 부족 시)

라즈베리파이 4 (4GB 이하)에서는 WebEngine이 무거울 수 있습니다.

`CMakeLists.txt` **39번 라인** 주석 처리:

**수정 전:**
```cmake
find_package(Qt6 6.8 REQUIRED COMPONENTS
    Core
    Quick
    QuickControls2
    Qml
    Network
    Mqtt
    Multimedia
    Svg
    WebChannel
    WebEngineQuick    # ← 이 줄
    SerialPort
    Concurrent
)
```

**수정 후:**
```cmake
find_package(Qt6 6.8 REQUIRED COMPONENTS
    Core
    Quick
    QuickControls2
    Qml
    Network
    Mqtt
    Multimedia
    Svg
    WebChannel
    # WebEngineQuick    # ← 주석 처리 (라즈베리파이에서 무거움)
    SerialPort
    Concurrent
)
```

그리고 **228번 라인**도 주석 처리:

**수정 전:**
```cmake
target_link_libraries(Lumiscape PRIVATE
    Qt6::Core
    Qt6::Quick
    Qt6::QuickControls2
    Qt6::Qml
    Qt6::Network
    Qt6::Mqtt
    Qt6::Multimedia
    Qt6::Svg
    Qt6::WebChannel
    Qt6::WebEngineQuick    # ← 이 줄
    Qt6::SerialPort
    Qt6::Concurrent
)
```

**수정 후:**
```cmake
target_link_libraries(Lumiscape PRIVATE
    Qt6::Core
    Qt6::Quick
    Qt6::QuickControls2
    Qt6::Qml
    Qt6::Network
    Qt6::Mqtt
    Qt6::Multimedia
    Qt6::Svg
    Qt6::WebChannel
    # Qt6::WebEngineQuick    # ← 주석 처리
    Qt6::SerialPort
    Qt6::Concurrent
)
```

**주의:** WebEngine을 비활성화하면 YouTubePlayer 위젯이 작동하지 않습니다. 필요시 해당 위젯을 비활성화하거나 대체 방법을 구현하세요.

### 3. 설정 파일 수정

`assets/presets/config.json` 파일을 라즈베리파이 환경에 맞게 수정:

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
      "apiKey": "YOUR_OPENWEATHER_API_KEY"
    },
    "spotify": {
      "clientId": "YOUR_SPOTIFY_CLIENT_ID",
      "clientSecret": "YOUR_SPOTIFY_CLIENT_SECRET"
    }
  }
}
```

---

## 🔨 빌드 및 실행

### 1. 프로젝트 클론 및 설정

```bash
cd ~
git clone https://github.com/your-repo/lumiscape.git
cd lumiscape
```

### 2. 빌드 디렉토리 생성

```bash
mkdir build && cd build
```

### 3. CMake 설정

```bash
# Qt 경로 지정하여 CMake 실행
cmake .. \
    -DCMAKE_BUILD_TYPE=Release \
    -DCMAKE_PREFIX_PATH=/opt/Qt/6.8.3/gcc_arm64 \
    -DLUMISCAPE_ENABLE_LOGGING=ON
```

**주요 옵션:**
- `CMAKE_BUILD_TYPE=Release`: 최적화된 릴리즈 빌드
- `CMAKE_PREFIX_PATH`: Qt 설치 경로
- `LUMISCAPE_ENABLE_LOGGING=ON`: 디버깅용 로그 활성화

### 4. 빌드

```bash
# 4코어 사용 (라즈베리파이 4/5 기준)
cmake --build . --config Release --parallel 4
```

**예상 빌드 시간:**
- Raspberry Pi 4: 15-30분
- Raspberry Pi 5: 10-20분

### 5. 실행

```bash
# 빌드 디렉토리에서
./Lumiscape

# 또는 전체 경로 지정
/home/pi/lumiscape/build/Lumiscape
```

### 6. 자동 시작 설정 (선택사항)

systemd 서비스로 등록:

```bash
# 서비스 파일 생성
sudo nano /etc/systemd/system/lumiscape.service
```

**내용:**
```ini
[Unit]
Description=Lumiscape Smart Glass UI
After=graphical.target

[Service]
Type=simple
User=pi
Environment="DISPLAY=:0"
Environment="QT_QPA_PLATFORM=eglfs"
Environment="QT_DIR=/opt/Qt/6.8.3/gcc_arm64"
Environment="LD_LIBRARY_PATH=/opt/Qt/6.8.3/gcc_arm64/lib"
WorkingDirectory=/home/pi/lumiscape/build
ExecStart=/home/pi/lumiscape/build/Lumiscape
Restart=on-failure
RestartSec=10

[Install]
WantedBy=graphical.target
```

**서비스 활성화:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable lumiscape.service
sudo systemctl start lumiscape.service

# 상태 확인
sudo systemctl status lumiscape.service
```

---

## 🐛 문제 해결

### 1. Qt 모듈을 찾을 수 없음

**오류:**
```
CMake Error: Could not find Qt6
```

**해결:**
```bash
# Qt 경로 확인
which qmake6

# CMake에 경로 명시
cmake .. -DCMAKE_PREFIX_PATH=/opt/Qt/6.8.3/gcc_arm64
```

### 2. MediaPipe 카메라 권한 오류

**오류:**
```
cv2.error: OpenCV(4.x.x) error: (-1:Unspecified error) can't open camera
```

**해결:**
```bash
# video 그룹 확인
groups

# 그룹에 추가되지 않았다면
sudo usermod -a -G video $USER
# 재로그인 필요

# 카메라 장치 확인
ls -l /dev/video*
```

### 3. MQTT 연결 실패

**오류:**
```
MQTT error: Bad username or password
```

**해결:**
- `assets/presets/config.json`에서 MQTT 자격 증명 확인
- 네트워크 연결 확인
- MQTT 브로커 주소 및 포트 확인

### 4. 메모리 부족

**증상:** 앱이 느리거나 충돌

**해결:**
```bash
# 스왑 파일 크기 증가
sudo dphys-swapfile swapoff
sudo nano /etc/dphys-swapfile
# CONF_SWAPSIZE=2048 (2GB로 변경)
sudo dphys-swapfile setup
sudo dphys-swapfile swapon

# GPU 메모리 증가
sudo raspi-config
# Performance Options → GPU Memory → 256MB로 설정
```

### 5. 화면이 표시되지 않음

**해결:**
```bash
# EGLFS 플랫폼 사용
export QT_QPA_PLATFORM=eglfs
./Lumiscape

# 또는 X11 사용 (데스크탑 환경)
export QT_QPA_PLATFORM=xcb
./Lumiscape
```

---

## ⚡ 성능 최적화

### 1. 오버클럭 (Raspberry Pi 4)

```bash
sudo nano /boot/config.txt
```

**추가:**
```ini
# Raspberry Pi 4 오버클럭
arm_freq=2000
gpu_freq=750
over_voltage=6

# 냉각 필수!
```

### 2. QML 캐시 활성화

```bash
export QML_DISK_CACHE=1
export QML_DISK_CACHE_PATH=/tmp/qmlcache
```

### 3. 불필요한 서비스 비활성화

```bash
# Bluetooth 불필요 시
sudo systemctl disable bluetooth

# WiFi 불필요 시 (이더넷 사용)
sudo systemctl disable wpa_supplicant
```

### 4. 해상도 조정

낮은 해상도로 실행 시 성능 향상:

```bash
# config.json 수정
{
  "screenWidth": 1280,
  "screenHeight": 720
}
```

### 5. MediaPipe 최적화

`assets/presets/config.json`:

```json
{
  "mediapipe": {
    "cameraId": 0,
    "minDetectionConfidence": 0.5,   // 낮추면 성능 향상, 정확도 감소
    "minTrackingConfidence": 0.3      // 낮추면 성능 향상
  }
}
```

---

## 📊 성능 벤치마크

| 모델 | RAM | FPS (예상) | 빌드 시간 |
|------|-----|-----------|----------|
| Raspberry Pi 4 (4GB) | 4GB | 20-30 FPS | 20-30분 |
| Raspberry Pi 4 (8GB) | 8GB | 30-45 FPS | 20-30분 |
| Raspberry Pi 5 (8GB) | 8GB | 45-60 FPS | 10-20분 |

---

## 📝 추가 정보

### 관련 문서
- [CLAUDE.md](./CLAUDE.md) - 프로젝트 전체 개요
- [README.md](./README.md) - 일반 사용자 가이드

### 지원 플랫폼
- ✅ Raspberry Pi 4 Model B (4GB/8GB)
- ✅ Raspberry Pi 5 (4GB/8GB)
- ⚠️ Raspberry Pi 3 (제한적 지원, 성능 낮음)

### 라이선스
- 프로젝트 라이선스 참고

---

## 🆘 문제 보고

버그나 문제 발견 시:
1. GitHub Issues 페이지 방문
2. 다음 정보 포함:
   - Raspberry Pi 모델 및 RAM
   - OS 버전 (`cat /etc/os-release`)
   - Qt 버전 (`qmake6 --version`)
   - 에러 로그

---

**마지막 업데이트:** 2025-01-17
**Qt 버전:** 6.8.3
**테스트 환경:** Raspberry Pi 4 Model B (8GB), Raspberry Pi OS 64-bit Bookworm
