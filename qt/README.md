# Lumiscape

Smart Glass UI System with Gesture Control

## Overview

Lumiscape is a sophisticated Qt-based user interface system designed for smart glass devices. It features gesture-based control using MediaPipe, multiple display modes, and a modular widget system.

## Features

- **Gesture Control**: Hand gesture recognition using MediaPipe for intuitive interaction
- **Multiple Modes**:
  - Custom: Personalized widget arrangement
  - Glass: Transparent ambient display
  - Privacy: Opaque mode for focus
  - Auto: Smart recommendations based on time and weather
- **Widget System**: Extensible widgets including clock, weather, Spotify integration, and quotes
- **Modern UI**: Glass morphism design with smooth animations
- **IoT Integration**: MQTT support for device communication
- **External APIs**: Weather and Spotify integration

## Technology Stack

- **UI Framework**: Qt 6.5 LTS (QML + C++)
- **Gesture Recognition**: MediaPipe (Python)
- **Communication**: MQTT, REST APIs
- **Build System**: CMake
- **Language**: C++17, Python 3.8+

## Project Structure

```
lumiscape/
├── src/                      # C++ source code
│   ├── core/                 # Core system classes
│   ├── widgets/              # Widget providers
│   └── integrations/         # External service integrations
├── qml/                      # QML UI files
│   ├── screens/              # Screen components
│   ├── components/           # Reusable UI components
│   ├── widgets/              # Widget views
│   └── styles/               # Theme and styling
├── python/                   # Python modules
│   └── mediapipe_gesture_service.py
├── assets/                   # Static resources
│   └── presets/              # Configuration files
└── resources/                # Qt resources
    └── lumiscape.qrc
```

## Requirements

### System Requirements
- Qt 6.5 or later
- CMake 3.21 or later
- C++17 compatible compiler
- Python 3.8 or later
- Webcam (for gesture control)

### Qt Modules
- Qt6::Core
- Qt6::Quick
- Qt6::QuickControls2
- Qt6::Qml
- Qt6::Network
- Qt6::Mqtt
- Qt6::Multimedia
- Qt6::Svg

### Python Dependencies
```bash
pip install -r python/requirements.txt
```

## Building

### 1. Install Dependencies

**Ubuntu/Debian:**
```bash
sudo apt install qt6-base-dev qt6-declarative-dev qt6-mqtt-dev \
                 qt6-multimedia-dev qt6-svg-dev \
                 cmake build-essential python3 python3-pip

pip3 install opencv-python mediapipe numpy
```

**macOS:**
```bash
brew install qt@6 cmake python3
pip3 install opencv-python mediapipe numpy
```

### 2. Configure and Build

```bash
mkdir build
cd build
cmake ..
cmake --build . --config Release
```

### 3. Run

```bash
./Lumiscape
```

## Configuration

Edit `assets/presets/config.json` to configure:

- **MQTT Settings**: Broker connection details
- **API Keys**: OpenWeatherMap and Spotify credentials
- **Widget Settings**: Default widget configurations
- **Mode Settings**: Behavior for each display mode

Example:
```json
{
  "apis": {
    "weather": {
      "apiKey": "YOUR_API_KEY",
      "defaultCity": "Seoul"
    },
    "spotify": {
      "clientId": "YOUR_CLIENT_ID",
      "clientSecret": "YOUR_CLIENT_SECRET"
    }
  }
}
```

## Gesture Controls

- **Pointing**: Move cursor
- **Fist**: Click/Select
- **Open Palm**: Navigate/Back
- **Peace Sign**: Special action
- **Thumbs Up**: Confirm

## Development

### Adding a New Widget

1. Create Provider class in `src/widgets/`
2. Register in `WidgetRegistry`
3. Create QML widget in `qml/widgets/`
4. Add to resource file

### Customizing Theme

Edit `qml/styles/Theme.qml` to modify:
- Colors
- Typography
- Spacing
- Effects

## Qt Version Recommendation

**Recommended: Qt 6.5.3 LTS**
- Long-term support for embedded systems
- Stable and well-tested
- Good performance on embedded hardware

Alternative: Qt 6.7+ for latest features

## Troubleshooting

### Camera Not Working
- Check camera permissions
- Verify camera ID in config (default: 0)
- Test with: `python3 python/mediapipe_gesture_service.py`

### MediaPipe Errors
- Install required Python packages
- Check Python version (>=3.8)
- Verify OpenCV installation

### Build Errors
- Ensure Qt 6.5+ is installed
- Check CMake version (>=3.21)
- Verify all Qt modules are available

## License

Proprietary - Lumiscape Project

## Authors

- Qt/C++ Development
- MediaPipe Integration
- UI/UX Design

## Version

1.0.0 - Initial Release
