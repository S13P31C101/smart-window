import QtQuick 2.15
import QtQuick.Window 2.15
import QtQuick.Effects
import "../components"
import "../styles"

Item {
    id: root

    width: Window.window ? Window.window.width * 0.5 : 540
    height: Window.window ? Window.window.height * 0.045 : 45

    // Background box - semi-transparent gray with no border
    Rectangle {
        id: backgroundBox
        anchors.fill: parent
        anchors.leftMargin: -Window.window ? Window.window.width * 0.03 : -32
        anchors.rightMargin: -Window.window ? Window.window.width * 0.03 : -32
        anchors.topMargin: -Window.window ? Window.window.height * 0.005 : -5
        anchors.bottomMargin: -Window.window ? Window.window.height * 0.005 : -5
        color: Qt.rgba(0.5, 0.5, 0.5, 0.6) // Gray with 60% opacity
        radius: 16
        border.width: 0
    }

    // Main content - horizontal layout
    Row {
        anchors.centerIn: parent
        spacing: Window.window ? Window.window.width * 0.025 : 27

        // Weather icon
        Text {
            id: weatherIcon
            text: getWeatherIcon(weatherProvider.condition)
            font.pixelSize: Window.window ? Window.window.width * 0.03 : 32
            anchors.verticalCenter: parent.verticalCenter

            // Gentle pulse animation
            SequentialAnimation on scale {
                loops: Animation.Infinite
                NumberAnimation { to: 1.08; duration: 2500; easing.type: Easing.InOutQuad }
                NumberAnimation { to: 1.0; duration: 2500; easing.type: Easing.InOutQuad }
            }
        }

        // Temperature - bold and prominent (keep current size)
        Text {
            text: weatherProvider.temperature
            font.pixelSize: Window.window ? Window.window.width * 0.022 : 24
            font.weight: Font.Bold
            color: "#ffffff"
            anchors.verticalCenter: parent.verticalCenter
        }

        // Vertical separator
        Rectangle {
            width: 1.5
            height: root.height * 0.6
            color: Qt.rgba(1, 1, 1, 0.3)
            anchors.verticalCenter: parent.verticalCenter
        }

        // Weather condition
        Text {
            text: weatherProvider.condition
            font.pixelSize: Window.window ? Window.window.width * 0.016 : 17
            font.weight: Font.Medium
            color: Qt.rgba(1, 1, 1, 0.9)
            anchors.verticalCenter: parent.verticalCenter
        }

        // City name
        Row {
            spacing: 5
            anchors.verticalCenter: parent.verticalCenter

            Text {
                text: "📍"
                font.pixelSize: Window.window ? Window.window.width * 0.013 : 14
                opacity: 0.8
                anchors.verticalCenter: parent.verticalCenter
            }

            Text {
                text: weatherProvider.city
                font.pixelSize: Window.window ? Window.window.width * 0.014 : 15
                font.weight: Font.Medium
                color: Qt.rgba(1, 1, 1, 0.8)
                anchors.verticalCenter: parent.verticalCenter
            }
        }

        // Vertical separator
        Rectangle {
            width: 1.5
            height: root.height * 0.6
            color: Qt.rgba(1, 1, 1, 0.3)
            anchors.verticalCenter: parent.verticalCenter
        }

        // Humidity
        Row {
            spacing: 5
            anchors.verticalCenter: parent.verticalCenter

            Text {
                text: "💧"
                font.pixelSize: Window.window ? Window.window.width * 0.013 : 14
                opacity: 0.8
                anchors.verticalCenter: parent.verticalCenter
            }

            Text {
                text: weatherProvider.humidity + "%"
                font.pixelSize: Window.window ? Window.window.width * 0.013 : 14
                color: Qt.rgba(1, 1, 1, 0.75)
                anchors.verticalCenter: parent.verticalCenter
            }
        }

        // Wind speed
        Row {
            spacing: 5
            anchors.verticalCenter: parent.verticalCenter

            Text {
                text: "💨"
                font.pixelSize: Window.window ? Window.window.width * 0.013 : 14
                opacity: 0.8
                anchors.verticalCenter: parent.verticalCenter
            }

            Text {
                text: weatherProvider.windSpeed.toFixed(1) + " m/s"
                font.pixelSize: Window.window ? Window.window.width * 0.013 : 14
                color: Qt.rgba(1, 1, 1, 0.75)
                anchors.verticalCenter: parent.verticalCenter
            }
        }
    }

    // Loading/Error state
    Text {
        anchors.centerIn: parent
        text: weatherProvider.loading ? "Loading weather..." : weatherProvider.error
        font.pixelSize: Window.window ? Window.window.width * 0.015 : 16
        color: weatherProvider.error !== "" ? "#ef4444" : Qt.rgba(1, 1, 1, 0.8)
        visible: weatherProvider.loading || weatherProvider.error !== ""
    }

    // Weather icon mapping
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

    // Smooth hover effect
    MouseArea {
        anchors.fill: parent
        hoverEnabled: true
        onEntered: parent.scale = 1.03
        onExited: parent.scale = 1.0
    }

    Behavior on scale {
        NumberAnimation { duration: 200; easing.type: Easing.OutCubic }
    }
}
