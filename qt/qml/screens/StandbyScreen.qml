import QtQuick 2.15
import QtQuick.Controls 2.15
import "../components"
import "../styles"

Item {
    id: root

    // Black background
    Rectangle {
        anchors.fill: parent
        color: "#000000"
    }

    // Dim clock display in center
    Column {
        anchors.centerIn: parent
        spacing: 20

        // Current time
        Text {
            id: timeDisplay
            anchors.horizontalCenter: parent.horizontalCenter
            font.pixelSize: 48
            font.weight: Font.Light
            color: "#40FFFFFF"  // 25% white (very dim)
            text: Qt.formatDateTime(new Date(), "hh:mm")

            // Update time every second
            Timer {
                interval: 1000
                running: true
                repeat: true
                onTriggered: {
                    timeDisplay.text = Qt.formatDateTime(new Date(), "hh:mm")
                }
            }
        }

        // Standby indicator
        Text {
            anchors.horizontalCenter: parent.horizontalCenter
            font.pixelSize: 14
            color: "#20FFFFFF"  // 12% white (very dim)
            text: "STANDBY"
            font.letterSpacing: 3

            // Subtle pulsing animation
            SequentialAnimation on opacity {
                running: true
                loops: Animation.Infinite
                NumberAnimation { from: 0.3; to: 0.6; duration: 2000; easing.type: Easing.InOutQuad }
                NumberAnimation { from: 0.6; to: 0.3; duration: 2000; easing.type: Easing.InOutQuad }
            }
        }
    }

    // Bottom status indicators (very subtle)
    Row {
        anchors.bottom: parent.bottom
        anchors.horizontalCenter: parent.horizontalCenter
        anchors.bottomMargin: 30
        spacing: 20
        opacity: 0.2

        // MQTT status
        Row {
            spacing: 8
            Rectangle {
                width: 8
                height: 8
                radius: 4
                color: mqttClient.isConnected ? "#4ECDC4" : "#FF6B6B"
                anchors.verticalCenter: parent.verticalCenter
            }
            Text {
                text: "MQTT"
                font.pixelSize: 10
                color: "#FFFFFF"
                anchors.verticalCenter: parent.verticalCenter
            }
        }

        // Sensor status
        Row {
            spacing: 8
            Rectangle {
                width: 8
                height: 8
                radius: 4
                color: "#4ECDC4"
                anchors.verticalCenter: parent.verticalCenter
            }
            Text {
                text: "SENSORS"
                font.pixelSize: 10
                color: "#FFFFFF"
                anchors.verticalCenter: parent.verticalCenter
            }
        }

        // Window control status
        Row {
            spacing: 8
            Rectangle {
                width: 8
                height: 8
                radius: 4
                color: windowController.isConnected ? "#4ECDC4" : "#64748b"
                anchors.verticalCenter: parent.verticalCenter
            }
            Text {
                text: "WINDOW"
                font.pixelSize: 10
                color: "#FFFFFF"
                anchors.verticalCenter: parent.verticalCenter
            }
        }
    }

    // Debug info (optional - remove in production)
    Component.onCompleted: {
        console.log("✓ Entered Smart Standby mode")
        console.log("  - Display: OFF (showing minimal UI)")
        console.log("  - Gesture: Should be OFF")
        console.log("  - Sensors: ON (monitoring)")
        console.log("  - MQTT: ON (listening)")
        console.log("  - Window Control: ON (manual only)")
    }
}
