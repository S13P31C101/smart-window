# Lumiscape

**스마트 글래스를 위한 제스처 기반 UI 시스템**

[![Qt Version](https://img.shields.io/badge/Qt-6.8%2B-brightgreen)](https://www.qt.io/)
[![Python Version](https://img.shields.io/badge/Python-3.9%2B-blue)](https://www.python.org/)
[![License](https://img.shields.io/badge/License-Proprietary-red)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Linux%20%7C%20Raspberry%20Pi-lightgrey)](https://github.com/your-repo/lumiscape)

Lumiscape는 Qt 6와 MediaPipe를 기반으로 한 차세대 스마트 글래스 UI 시스템입니다. 손 제스처 인식을 통한 직관적인 상호작용과 다양한 디스플레이 모드를 제공하여 미래형 웨어러블 디바이스 경험을 실현합니다.

---

## ✨ 주요 기능

### 🤚 제스처 제어
- **MediaPipe 기반 손 인식**: 실시간 손 제스처 감지 및 추적
- **직관적인 제스처**:
  - 👉 **포인팅**: 커서 이동 및 탐색
  - ✊ **주먹**: 선택 및 클릭
  - ✋ **손바닥**: 뒤로가기 및 취소
  - ✌️ **피스**: 특수 동작
  - 👍 **좋아요**: 확인
- **적응형 좌표 매핑**: 카메라 인식 영역의 가장자리 여유 공간 자동 조정으로 편리한 조작

### 🎨 다양한 디스플레이 모드

#### Glass Mode (유리 모드)
- 투명한 글래스모피즘 디자인
- 주변 환경과 조화로운 앰비언트 디스플레이
- 실시간 날씨, 시계 등 필수 정보 표시

#### Privacy Mode (프라이버시 모드)
- 불투명한 집중 모드
- 개인정보 보호가 필요한 작업에 최적화
- 전체 화면 위젯 지원

#### Custom Mode (커스텀 모드)
- 드래그 앤 드롭으로 위젯 자유 배치
- 개인화된 레이아웃 저장 및 로드
- 위젯 크기 조절 가능

#### Auto Mode (자동 모드)
- 시간대와 날씨 기반 스마트 추천
- 상황에 맞는 위젯 자동 활성화
- 사용 패턴 학습 (향후 구현 예정)

### 🧩 확장 가능한 위젯 시스템

**기본 위젯:**
- **⏰ 시계**: 실시간 시간, 날짜, 요일 표시
- **🌤️ 날씨**: OpenWeatherMap API 연동, 현재 날씨 및 예보
- **🎵 음악**: Spotify/YouTube 음악 재생 제어
- **💬 명언**: 랜덤 영감을 주는 명언 표시

**추가 가능한 위젯:**
- 알람 및 타이머
- 센서 데이터 모니터링
- IoT 디바이스 제어
- 커스텀 위젯 (플러그인 시스템)

### 🌐 외부 서비스 통합
- **MQTT**: IoT 디바이스 통신 및 제어
- **REST API**: 날씨, Spotify 등 외부 API 연동
- **OAuth 2.0**: Spotify 인증 (PKCE 플로우)

### 🎯 현대적인 UI/UX
- **글래스모피즘 디자인**: 반투명 효과, 블러, 그라데이션
- **부드러운 애니메이션**: Qt Quick 기반 60fps 애니메이션
- **반응형 레이아웃**: 다양한 화면 크기 지원
- **다크/라이트 테마**: 자동 또는 수동 전환

---

## 🖥️ 지원 플랫폼

| 플랫폼 | CPU | 최소 RAM | 상태 |
|--------|-----|----------|------|
| **Raspberry Pi 4** | ARM Cortex-A72 | 4GB | ✅ 완전 지원 |
| **Raspberry Pi 5** | ARM Cortex-A76 | 4GB | ✅ 완전 지원 |
| **Linux Desktop (AMD)** | AMD Ryzen 3+ | 4GB | ✅ 완전 지원 |
| **Linux Desktop (Intel)** | Intel Core i3+ | 4GB | ✅ 완전 지원 |
| **macOS** | Intel/Apple Silicon | 8GB | 🚧 실험적 지원 |
| **Windows** | x86_64 | 8GB | 🚧 실험적 지원 |

---

## 🚀 빠른 시작

### 사전 요구사항

- **Qt 6.8.3 이상** (6.9.x 권장)
- **Python 3.9 이상** (3.11+ 권장)
- **CMake 3.21 이상**
- **웹캠** (제스처 인식용, 선택사항)

### 플랫폼별 설치 가이드

#### 📱 Raspberry Pi
완전한 단계별 가이드는 **[RASPBERRY_PI_SETUP_GUIDE.md](./RASPBERRY_PI_SETUP_GUIDE.md)** 참고

```bash
# 1. 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# 2. Qt 6.8+ 설치 (Qt Online Installer 사용)
wget https://download.qt.io/official_releases/online_installers/qt-unified-linux-arm64-online.run
chmod +x qt-unified-linux-arm64-online.run
./qt-unified-linux-arm64-online.run

# 3. 의존성 설치
sudo apt install -y build-essential cmake git python3 python3-pip python3-venv \
    libgstreamer1.0-dev gstreamer1.0-plugins-base gstreamer1.0-plugins-good \
    gstreamer1.0-plugins-bad gstreamer1.0-plugins-ugly gstreamer1.0-libav

# 4. 프로젝트 클론 및 빌드
git clone https://github.com/your-username/lumiscape.git
cd lumiscape
python3 -m venv venv && source venv/bin/activate
pip install -r python/requirements.txt
mkdir build && cd build
cmake .. -DCMAKE_PREFIX_PATH=/opt/Qt/6.8.3/gcc_arm64
cmake --build . --parallel 4
./Lumiscape
```

#### 💻 Linux Desktop (AMD/Intel)
완전한 단계별 가이드는 **[LINUX_DESKTOP_SETUP_GUIDE.md](./LINUX_DESKTOP_SETUP_GUIDE.md)** 참고

```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y
sudo apt install -y build-essential cmake git python3 python3-pip python3-venv \
    libgstreamer1.0-dev gstreamer1.0-libav

# Fedora
sudo dnf update -y
sudo dnf install -y gcc-c++ cmake git python3 python3-pip \
    gstreamer1-devel gstreamer1-libav

# Arch Linux
sudo pacman -Syu
sudo pacman -S base-devel cmake git python python-pip \
    gstreamer gst-libav

# Qt 6.8+ 설치 후 빌드
git clone https://github.com/your-username/lumiscape.git
cd lumiscape
python3 -m venv venv && source venv/bin/activate
pip install -r python/requirements.txt
mkdir build && cd build
cmake .. -DCMAKE_PREFIX_PATH=/opt/Qt/6.8.3/gcc_64
cmake --build . --parallel $(nproc)
./Lumiscape
```

---

## 📦 기술 스택

### Frontend
- **Qt 6.8+**: 크로스 플랫폼 UI 프레임워크
- **QML**: 선언적 UI 언어
- **Qt Quick Controls 2**: 모던 UI 컴포넌트

### Backend
- **C++17**: 고성능 코어 로직
- **Qt Core**: 이벤트 루프, 신호/슬롯
- **Qt Network**: REST API 클라이언트
- **Qt MQTT**: IoT 통신

### AI/ML
- **MediaPipe 0.10+**: 손 제스처 인식
- **OpenCV 4.8+**: 카메라 입력 처리
- **NumPy 1.24+**: 수치 연산

### 멀티미디어
- **Qt Multimedia**: 오디오/비디오 재생
- **GStreamer 1.20+**: 멀티미디어 백엔드
- **yt-dlp 2023.10+**: YouTube 스트리밍

### 빌드 시스템
- **CMake 3.21+**: 크로스 플랫폼 빌드
- **Qt qmake**: Qt 프로젝트 관리

---

## 📁 프로젝트 구조

```
lumiscape/
├── src/                          # C++ 소스 코드
│   ├── core/                     # 핵심 시스템
│   │   ├── main.cpp              # 애플리케이션 진입점
│   │   ├── AppConfig.*           # JSON 설정 관리
│   │   ├── Router.*              # 화면 네비게이션
│   │   ├── MediaPipeClient.*     # Python 프로세스 관리
│   │   ├── GestureBridge.*       # 제스처 데이터 처리
│   │   ├── MqttClient.*          # MQTT 통신
│   │   ├── RestClient.*          # REST API 클라이언트
│   │   ├── SensorBus.*           # 센서 이벤트 버스
│   │   └── AlarmManager.*        # 알람 관리
│   ├── widgets/                  # 위젯 프로바이더
│   │   ├── WidgetRegistry.*      # 위젯 등록 및 관리
│   │   ├── ClockProvider.*       # 시계 위젯
│   │   ├── WeatherProvider.*     # 날씨 위젯
│   │   ├── YouTubeProvider.*     # YouTube 음악 위젯
│   │   └── SensorManager.*       # 센서 데이터 위젯
│   └── hardware/                 # 하드웨어 제어
│       ├── GpioControl.*         # GPIO 제어 (라즈베리파이)
│       ├── PDLCController.*      # PDLC 필름 제어
│       └── WindowController.*    # 윈도우 투명도 제어
├── qml/                          # QML UI 파일
│   ├── Main.qml                  # 루트 컴포넌트
│   ├── screens/                  # 화면 컴포넌트
│   │   ├── LoadingScreen.qml     # 로딩 화면
│   │   ├── MenuScreen.qml        # 메인 메뉴
│   │   ├── GlassModeScreen.qml   # 유리 모드
│   │   ├── PrivacyModeScreen.qml # 프라이버시 모드
│   │   ├── CustomModeScreen.qml  # 커스텀 모드
│   │   ├── AutoModeScreen.qml    # 자동 모드
│   │   ├── AlarmScreen.qml       # 알람 화면
│   │   └── StandbyScreen.qml     # 대기 화면
│   ├── components/               # 재사용 UI 컴포넌트
│   │   ├── GestureCursor.qml     # 제스처 커서
│   │   ├── RadialMenu.qml        # 원형 메뉴
│   │   ├── GlassCard.qml         # 글래스 카드
│   │   ├── AmbientGlow.qml       # 앰비언트 효과
│   │   ├── MinimalButton.qml     # 미니멀 버튼
│   │   └── GestureControlledUI.qml # 제스처 제어 래퍼
│   ├── widgets/                  # 위젯 뷰
│   │   ├── ClockWidget.qml       # 시계
│   │   ├── WeatherWidget.qml     # 날씨
│   │   ├── YouTubeAudioWidget.qml # YouTube 음악
│   │   └── QuoteWidget.qml       # 명언
│   └── styles/                   # 스타일 및 테마
│       ├── Theme.qml             # 색상, 폰트, 간격
│       └── Effects.qml           # 시각 효과
├── python/                       # Python 모듈
│   ├── mediapipe_gesture_service.py  # MediaPipe 제스처 인식
│   ├── youtube_audio_service.py      # YouTube URL 추출
│   └── requirements.txt              # Python 의존성
├── assets/                       # 리소스 파일
│   └── presets/                  # 설정 파일
│       ├── config.json           # 메인 설정
│       ├── widgets.json          # 위젯 메타데이터
│       └── auto_scenes.json      # 자동 모드 시나리오
├── resources/                    # Qt 리소스
│   └── lumiscape.qrc             # 리소스 파일
├── build/                        # 빌드 디렉토리 (생성됨)
├── CMakeLists.txt                # CMake 빌드 설정
├── README.md                     # 프로젝트 개요 (본 파일)
├── CLAUDE.md                     # 개발자 아키텍처 가이드
├── RASPBERRY_PI_SETUP_GUIDE.md  # 라즈베리파이 설치 가이드
└── LINUX_DESKTOP_SETUP_GUIDE.md # Linux 데스크탑 설치 가이드
```

---

## 🎮 사용법

### 제스처 컨트롤

| 제스처 | 동작 | 설명 |
|--------|------|------|
| 👉 **포인팅** | 커서 이동 | 검지 손가락으로 화면 포인팅 |
| ✊ **주먹** | 클릭/선택 | 주먹을 쥐어 버튼 클릭 |
| ✋ **손바닥** | 뒤로가기 | 손바닥 펴서 이전 화면으로 |
| ⬅️ **왼쪽 스와이프** | 이전 항목 | 손을 빠르게 왼쪽으로 이동 |
| ➡️ **오른쪽 스와이프** | 다음 항목 | 손을 빠르게 오른쪽으로 이동 |

### 키보드 단축키 (개발 모드)

| 키 | 동작 |
|----|------|
| `M` | 메뉴로 돌아가기 |
| `G` | Glass Mode |
| `P` | Privacy Mode |
| `C` | Custom Mode |
| `A` | Auto Mode |
| `Q` | 종료 |
| `F11` | 전체화면 토글 |
| `F12` | 개발자 도구 |

---

## ⚙️ 설정

### API 키 설정

`assets/presets/config.json` 파일을 편집하여 API 키를 설정합니다:

```json
{
  "deviceUniqueId": "LUMISCAPE_001",
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

**API 키 발급 방법:**

1. **OpenWeatherMap**
   - [https://openweathermap.org/api](https://openweathermap.org/api)
   - 무료 계정 생성 후 API 키 발급

2. **Spotify**
   - [https://developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)
   - 앱 생성 후 Client ID와 Client Secret 발급
   - Redirect URI: `http://127.0.0.1:8888/callback`

### 위젯 활성화/비활성화

`assets/presets/config.json`에서 위젯 활성화 여부 설정:

```json
{
  "widgets": {
    "clock": { "enabled": true },
    "weather": { "enabled": true },
    "youtube": { "enabled": true },
    "quote": { "enabled": false }
  }
}
```

---

## 🛠️ 개발

### 새 위젯 추가하기

1. **Provider 클래스 생성** (`src/widgets/`)

```cpp
// MyWidgetProvider.h
#pragma once
#include <QObject>

class MyWidgetProvider : public QObject
{
    Q_OBJECT
    Q_PROPERTY(QString data READ data NOTIFY dataChanged)

public:
    explicit MyWidgetProvider(QObject *parent = nullptr);
    QString data() const { return m_data; }

public slots:
    void updateData();

signals:
    void dataChanged();

private:
    QString m_data;
};
```

2. **WidgetRegistry에 등록** (`src/main.cpp`)

```cpp
auto myWidget = new MyWidgetProvider(&app);
widgetRegistry.registerWidget("mywidget", myWidget);
engine.rootContext()->setContextProperty("myWidgetProvider", myWidget);
```

3. **QML 위젯 뷰 생성** (`qml/widgets/MyWidget.qml`)

```qml
import QtQuick
import QtQuick.Controls

Rectangle {
    width: 200
    height: 100

    Text {
        text: myWidgetProvider.data
        anchors.centerIn: parent
    }

    Connections {
        target: myWidgetProvider
        function onDataChanged() {
            console.log("Data updated")
        }
    }
}
```

4. **CMakeLists.txt에 파일 추가**

```cmake
set(PROJECT_SOURCES
    src/widgets/MyWidgetProvider.cpp
    src/widgets/MyWidgetProvider.h
)

set(PROJECT_QML_FILES
    qml/widgets/MyWidget.qml
)
```

### 빌드 타입

```bash
# Debug 빌드 (개발용)
cmake .. -DCMAKE_BUILD_TYPE=Debug
cmake --build .

# Release 빌드 (배포용)
cmake .. -DCMAKE_BUILD_TYPE=Release
cmake --build .

# 로그 활성화
cmake .. -DLUMISCAPE_ENABLE_LOGGING=ON
```

### 테스트

```bash
# MediaPipe 서비스 단독 테스트
cd python
python3 mediapipe_gesture_service.py

# 웹캠 테스트
python3 -c "import cv2; cap = cv2.VideoCapture(0); print('OK' if cap.isOpened() else 'FAIL')"

# Qt 설치 확인
qmake6 --version

# GStreamer 플러그인 확인
gst-inspect-1.0 | grep libav
```

---

## 🐛 문제 해결

### 일반적인 문제

#### Qt를 찾을 수 없음
```bash
export QT_DIR=/opt/Qt/6.8.3/gcc_64
export PATH=$QT_DIR/bin:$PATH
export LD_LIBRARY_PATH=$QT_DIR/lib:$LD_LIBRARY_PATH
cmake .. -DCMAKE_PREFIX_PATH=$QT_DIR
```

#### 웹캠 권한 오류
```bash
sudo usermod -a -G video $USER
# 재로그인 필요
```

#### YouTube 재생 안됨
```bash
# GStreamer libav 플러그인 설치
sudo apt install gstreamer1.0-libav  # Ubuntu/Debian
sudo dnf install gstreamer1-libav    # Fedora
sudo pacman -S gst-libav             # Arch

# yt-dlp 업그레이드
pip install --upgrade yt-dlp
```

#### MediaPipe 느림
```bash
# config.json에서 정확도 낮추기
{
  "mediapipe": {
    "minDetectionConfidence": 0.5,
    "minTrackingConfidence": 0.3
  }
}
```

더 많은 문제 해결 방법은 각 플랫폼별 가이드를 참고하세요.

---

## 📚 문서

- **[CLAUDE.md](./CLAUDE.md)** - 프로젝트 아키텍처 및 개발 가이드
- **[RASPBERRY_PI_SETUP_GUIDE.md](./RASPBERRY_PI_SETUP_GUIDE.md)** - 라즈베리파이 완전 설치 가이드
- **[LINUX_DESKTOP_SETUP_GUIDE.md](./LINUX_DESKTOP_SETUP_GUIDE.md)** - Linux Desktop 완전 설치 가이드

---

## 🗺️ 로드맵

### v1.1 (진행 중)
- [x] 제스처 좌표 매핑 개선
- [ ] 음성 명령 지원
- [ ] 사용자 프로필 시스템
- [ ] 위젯 마켓플레이스

### v1.2 (계획)
- [ ] AI 기반 사용 패턴 학습
- [ ] 다중 사용자 지원
- [ ] 클라우드 동기화
- [ ] 모바일 앱 연동

### v2.0 (미래)
- [ ] AR 오버레이 지원
- [ ] 실시간 번역 위젯
- [ ] 건강 모니터링 통합
- [ ] 스마트홈 통합 확장

---

## 🤝 기여

Lumiscape는 현재 비공개 프로젝트입니다. 기여에 관심이 있으시면 프로젝트 관리자에게 문의하세요.

### 개발 환경 설정

```bash
# 프로젝트 클론
git clone https://github.com/your-username/lumiscape.git
cd lumiscape

# 개발 브랜치 생성
git checkout -b feature/your-feature-name

# 개발용 빌드
mkdir build && cd build
cmake .. -DCMAKE_BUILD_TYPE=Debug -DLUMISCAPE_ENABLE_LOGGING=ON
cmake --build .

# 변경사항 커밋
git add .
git commit -m "Add your feature"
git push origin feature/your-feature-name
```

### 코드 스타일

- **C++**: [Qt 코딩 컨벤션](https://wiki.qt.io/Qt_Coding_Style) 준수
- **QML**: [QML 코딩 컨벤션](https://doc.qt.io/qt-6/qml-codingconventions.html) 준수
- **Python**: [PEP 8](https://www.python.org/dev/peps/pep-0008/) 준수

---

## 📄 라이선스

Proprietary License - Lumiscape Project

이 소프트웨어는 독점 라이선스 하에 있으며, 저작권 소유자의 명시적 허가 없이는 복제, 배포, 수정할 수 없습니다.

---

## 👥 제작

**Lumiscape Development Team**

- Qt/C++ 개발
- MediaPipe 통합
- UI/UX 디자인
- 하드웨어 통합

---

## 🙏 감사의 말

이 프로젝트는 다음 오픈소스 프로젝트들을 사용합니다:

- [Qt](https://www.qt.io/) - 크로스 플랫폼 UI 프레임워크
- [MediaPipe](https://mediapipe.dev/) - 손 제스처 인식
- [OpenCV](https://opencv.org/) - 컴퓨터 비전 라이브러리
- [GStreamer](https://gstreamer.freedesktop.org/) - 멀티미디어 프레임워크
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) - YouTube 스트리밍

---

## 📞 연락처

- **프로젝트 홈페이지**: [https://github.com/your-username/lumiscape](https://github.com/your-username/lumiscape)
- **이슈 트래커**: [https://github.com/your-username/lumiscape/issues](https://github.com/your-username/lumiscape/issues)
- **이메일**: lumiscape-dev@example.com

---

## 📊 프로젝트 통계

![Lines of Code](https://img.shields.io/badge/Lines%20of%20Code-15k%2B-blue)
![Files](https://img.shields.io/badge/Files-100%2B-green)
![Commits](https://img.shields.io/badge/Commits-500%2B-orange)

---

<div align="center">

**Lumiscape - 손끝으로 펼쳐지는 미래**

제스처로 경험하는 차세대 스마트 글래스

[시작하기](#-빠른-시작) • [문서](./CLAUDE.md) • [설치 가이드](./RASPBERRY_PI_SETUP_GUIDE.md)

Made with ❤️ by Lumiscape Team

</div>
