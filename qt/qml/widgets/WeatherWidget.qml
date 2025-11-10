import QtQuick 2.15
import QtQuick.Window 2.15
import QtQuick.Effects
import "../components"
import "../styles"

Item {
    id: root

    width: Window.window ? Window.window.width * 0.74 : 800
    height: Window.window ? Window.window.height * 0.03125 : 60

    Row {
        anchors.centerIn: parent
        spacing: Window.window ? Window.window.width * 0.0185 : 20

        // 날씨 아이콘
        Text {
            text: getWeatherIcon(weatherProvider.condition)
            font.pixelSize: Window.window ? Window.window.width * 0.044 : 48
            anchors.verticalCenter: parent.verticalCenter

            // 아이콘 애니메이션
            SequentialAnimation on scale {
                loops: Animation.Infinite
                NumberAnimation { to: 1.1; duration: 2000; easing.type: Easing.InOutQuad }
                NumberAnimation { to: 1.0; duration: 2000; easing.type: Easing.InOutQuad }
            }
        }

        // 온도
        Text {
            text: weatherProvider.temperature
            font.pixelSize: Window.window ? Window.window.width * 0.037 : 40
            font.weight: Font.Bold
            color: Theme.alpha("#ffffff", 1.0)
            anchors.verticalCenter: parent.verticalCenter
        }

        // 구분선
        Rectangle {
            width: 2
            height: Window.window ? Window.window.height * 0.021 : 40
            color: Theme.alpha("#ffffff", 0.3)
            anchors.verticalCenter: parent.verticalCenter
        }

        // 날씨 상태
        Text {
            text: weatherProvider.condition
            font.pixelSize: Window.window ? Window.window.width * 0.0185 : 20
            font.weight: Theme.fontWeightMedium
            color: Theme.alpha("#ffffff", 0.85)
            anchors.verticalCenter: parent.verticalCenter
        }

        // 도시명
        Row {
            spacing: Window.window ? Window.window.width * 0.0056 : 6
            anchors.verticalCenter: parent.verticalCenter

            Text {
                text: "📍"
                font.pixelSize: Window.window ? Window.window.width * 0.0167 : 18
                opacity: 0.8
                anchors.verticalCenter: parent.verticalCenter
            }

            Text {
                text: weatherProvider.city
                font.pixelSize: Window.window ? Window.window.width * 0.0167 : 18
                font.weight: Theme.fontWeightMedium
                color: Theme.alpha("#ffffff", 0.75)
                anchors.verticalCenter: parent.verticalCenter
            }
        }

        // 구분선
        Rectangle {
            width: 2
            height: Window.window ? Window.window.height * 0.021 : 40
            color: Theme.alpha("#ffffff", 0.3)
            anchors.verticalCenter: parent.verticalCenter
        }

        // 습도
        Row {
            spacing: Window.window ? Window.window.width * 0.0056 : 6
            anchors.verticalCenter: parent.verticalCenter

            Text {
                text: "💧"
                font.pixelSize: Window.window ? Window.window.width * 0.015 : 16
                anchors.verticalCenter: parent.verticalCenter
            }

            Text {
                text: weatherProvider.humidity + "%"
                font.pixelSize: Window.window ? Window.window.width * 0.015 : 16
                font.weight: Theme.fontWeightMedium
                color: Theme.alpha("#ffffff", 0.75)
                anchors.verticalCenter: parent.verticalCenter
            }
        }

        // 풍속
        Row {
            spacing: Window.window ? Window.window.width * 0.0056 : 6
            anchors.verticalCenter: parent.verticalCenter

            Text {
                text: "💨"
                font.pixelSize: Window.window ? Window.window.width * 0.015 : 16
                anchors.verticalCenter: parent.verticalCenter
            }

            Text {
                text: weatherProvider.windSpeed.toFixed(1) + " m/s"
                font.pixelSize: Window.window ? Window.window.width * 0.015 : 16
                font.weight: Theme.fontWeightMedium
                color: Theme.alpha("#ffffff", 0.75)
                anchors.verticalCenter: parent.verticalCenter
            }
        }
    }

    // 로딩/에러 상태
    Text {
        anchors.centerIn: parent
        text: weatherProvider.loading ? "Loading weather..." : weatherProvider.error
        font.pixelSize: Window.window ? Window.window.width * 0.015 : 16
        color: weatherProvider.error !== "" ? Theme.error : Theme.alpha("#ffffff", 0.7)
        visible: weatherProvider.loading || weatherProvider.error !== ""
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
