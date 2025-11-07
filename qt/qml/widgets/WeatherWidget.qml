import QtQuick 2.15
import QtQuick.Effects
import "../components"
import "../styles"

GlassCard {
    id: root

    width: 320
    height: 220

    // 날씨별 배경 그라디언트
    Rectangle {
        anchors.fill: parent
        radius: parent.radius
        gradient: Gradient {
            GradientStop {
                position: 0.0
                color: Theme.alpha(getWeatherColor(), 0.12)
            }
            GradientStop {
                position: 1.0
                color: Theme.alpha(getWeatherColor(), 0.05)
            }
        }
        opacity: 0.7
    }

    Column {
        anchors.fill: parent
        anchors.margins: Theme.paddingM
        spacing: Theme.spacingM

        // 헤더: 도시명
        Row {
            width: parent.width
            spacing: Theme.spacingS

            Text {
                text: "📍"
                font.pixelSize: 18
                opacity: 0.8
            }

            Text {
                text: weatherProvider.city
                font.pixelSize: Theme.fontSizeH4
                font.weight: Theme.fontWeightSemiBold
                color: Theme.textPrimary
            }
        }

        // 메인: 날씨 아이콘 + 온도
        Row {
            anchors.horizontalCenter: parent.horizontalCenter
            spacing: Theme.spacingL

            // 큰 날씨 아이콘
            Text {
                text: getWeatherIcon(weatherProvider.condition)
                font.pixelSize: 72
                anchors.verticalCenter: parent.verticalCenter

                // 아이콘 애니메이션
                SequentialAnimation on scale {
                    loops: Animation.Infinite
                    NumberAnimation { to: 1.1; duration: 2000; easing.type: Easing.InOutQuad }
                    NumberAnimation { to: 1.0; duration: 2000; easing.type: Easing.InOutQuad }
                }
            }

            // 온도
            Column {
                spacing: 4
                anchors.verticalCenter: parent.verticalCenter

                Text {
                    text: weatherProvider.temperature
                    font.pixelSize: 56
                    font.weight: Theme.fontWeightLight
                    color: Theme.textPrimary
                }

                Text {
                    text: weatherProvider.condition
                    font.pixelSize: Theme.fontSizeCaption
                    font.weight: Theme.fontWeightMedium
                    color: Theme.textSecondary
                    opacity: 0.9
                }
            }
        }

        // 추가 정보: 습도 & 풍속
        Row {
            anchors.horizontalCenter: parent.horizontalCenter
            spacing: Theme.spacingXl

            // 습도
            Rectangle {
                width: 90
                height: 36
                radius: 18
                color: Theme.alpha(Theme.accent, 0.12)
                border.color: Theme.alpha(Theme.accent, 0.2)
                border.width: 1

                Row {
                    anchors.centerIn: parent
                    spacing: 6

                    Text {
                        text: "💧"
                        font.pixelSize: 16
                        anchors.verticalCenter: parent.verticalCenter
                    }

                    Text {
                        text: weatherProvider.humidity + "%"
                        font.pixelSize: Theme.fontSizeCaption
                        font.weight: Theme.fontWeightMedium
                        color: Theme.textPrimary
                        anchors.verticalCenter: parent.verticalCenter
                    }
                }
            }

            // 풍속
            Rectangle {
                width: 90
                height: 36
                radius: 18
                color: Theme.alpha(Theme.primary, 0.12)
                border.color: Theme.alpha(Theme.primary, 0.2)
                border.width: 1

                Row {
                    anchors.centerIn: parent
                    spacing: 6

                    Text {
                        text: "💨"
                        font.pixelSize: 16
                        anchors.verticalCenter: parent.verticalCenter
                    }

                    Text {
                        text: weatherProvider.windSpeed.toFixed(1) + " m/s"
                        font.pixelSize: Theme.fontSizeCaption
                        font.weight: Theme.fontWeightMedium
                        color: Theme.textPrimary
                        anchors.verticalCenter: parent.verticalCenter
                    }
                }
            }
        }

        // 로딩/에러 상태
        Text {
            anchors.horizontalCenter: parent.horizontalCenter
            text: weatherProvider.loading ? "Loading..." : weatherProvider.error
            font.pixelSize: Theme.fontSizeCaption
            color: weatherProvider.error !== "" ? Theme.error : Theme.textTertiary
            visible: weatherProvider.loading || weatherProvider.error !== ""
            opacity: 0.8
        }
    }

    // 날씨별 색상 반환
    function getWeatherColor() {
        const condition = weatherProvider.condition.toLowerCase()
        if (condition.includes("clear")) return "#FFA500"  // 오렌지 (맑음)
        if (condition.includes("cloud")) return "#87CEEB"  // 하늘색 (구름)
        if (condition.includes("rain")) return "#4169E1"   // 파랑 (비)
        if (condition.includes("snow")) return "#ADD8E6"   // 연한 파랑 (눈)
        if (condition.includes("thunder")) return "#8B00FF" // 보라 (천둥)
        return Theme.primary
    }

    // 날씨 아이콘
    function getWeatherIcon(condition) {
        switch (condition.toLowerCase()) {
            case "clear": return "☀️"
            case "clouds": return "☁️"
            case "rain": return "🌧️"
            case "drizzle": return "🌦️"
            case "snow": return "❄️"
            case "thunderstorm": return "⛈️"
            case "mist":
            case "fog": return "🌫️"
            default: return "🌤️"
        }
    }
}
