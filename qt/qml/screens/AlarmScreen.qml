import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import "../widgets"

/**
 * @brief Alarm Screen
 *
 * Full-screen flashing alarm display (black/white) with gesture-based dismissal.
 *
 * Features:
 * - Flashing effect (200ms interval)
 * - Central target for fist gesture dismissal
 * - Alarm name and time display
 * - Visual feedback for gesture interaction
 */
Rectangle {
    id: root
    anchors.fill: parent

    // Flash state (alternates between black and white)
    property bool isWhite: false
    property string alarmName: alarmManager.currentAlarmName

    // Background music from config
    property string backgroundMusicUrl: "https://www.youtube.com/watch?v=F7iVmUtZNBI"

    // Flashing background color
    color: isWhite ? "#FFFFFF" : "#000000"

    // Timer for flashing effect (200ms = 0.2s interval)
    Timer {
        id: flashTimer
        interval: 200
        running: true
        repeat: true
        onTriggered: {
            root.isWhite = !root.isWhite
        }
    }

    // Smooth color transition
    Behavior on color {
        ColorAnimation {
            duration: 50
        }
    }

    // ====== 하단 위젯 영역 (YouTube Audio Player) - yt-dlp based ======
    YouTubeAudioWidget {
        id: youtubeAudioWidget
        anchors.horizontalCenter: parent.horizontalCenter
        anchors.bottom: parent.bottom
        anchors.bottomMargin: root.height * 0.08
        visible: false

        youtubeUrl: root.backgroundMusicUrl
        width: Math.min(parent.width * 0.55, 700)
        height: 200

        onPlayerReady: {
            console.log("YouTube audio player ready in Glass Mode")
        }
    }

    // Central content
    ColumnLayout {
        anchors.centerIn: parent
        spacing: 40
        width: parent.width * 0.7

        // Alarm icon
        Rectangle {
            Layout.alignment: Qt.AlignHCenter
            width: 120
            height: 120
            radius: 60
            color: root.isWhite ? "#FF6B6B" : "#FFE66D"
            border.width: 4
            border.color: root.isWhite ? "#000000" : "#FFFFFF"

            // Alarm bell icon (using text)
            Text {
                anchors.centerIn: parent
                text: "🔔"
                font.pixelSize: 64
                color: root.isWhite ? "#000000" : "#FFFFFF"
            }

            // Pulse animation
            SequentialAnimation on scale {
                running: true
                loops: Animation.Infinite

                NumberAnimation {
                    from: 1.0
                    to: 1.15
                    duration: 300
                    easing.type: Easing.InOutQuad
                }
                NumberAnimation {
                    from: 1.15
                    to: 1.0
                    duration: 300
                    easing.type: Easing.InOutQuad
                }
            }
        }

        // Alarm name
        Text {
            Layout.alignment: Qt.AlignHCenter
            text: root.alarmName || "Alarm"
            font.pixelSize: 48
            font.weight: Font.Bold
            color: root.isWhite ? "#000000" : "#FFFFFF"
            horizontalAlignment: Text.AlignHCenter
            wrapMode: Text.WordWrap
            Layout.fillWidth: true
        }

        // Current time
        Text {
            Layout.alignment: Qt.AlignHCenter
            text: Qt.formatTime(new Date(), "hh:mm:ss")
            font.pixelSize: 72
            font.weight: Font.Bold
            color: root.isWhite ? "#000000" : "#FFFFFF"
            horizontalAlignment: Text.AlignHCenter

            // Update time every second
            Timer {
                interval: 1000
                running: true
                repeat: true
                onTriggered: parent.text = Qt.formatTime(new Date(), "hh:mm:ss")
            }
        }

        // Dismiss instruction
        Text {
            Layout.alignment: Qt.AlignHCenter
            Layout.topMargin: 40
            text: "Make a FIST gesture to dismiss"
            font.pixelSize: 32
            color: root.isWhite ? "#333333" : "#CCCCCC"
            horizontalAlignment: Text.AlignHCenter
            wrapMode: Text.WordWrap
            Layout.fillWidth: true
        }

        // Gesture target (for visual feedback)
        Rectangle {
            id: gestureTarget
            Layout.alignment: Qt.AlignHCenter
            Layout.topMargin: 20
            width: 200
            height: 200
            radius: 100
            color: "transparent"
            border.width: 4
            border.color: root.isWhite ? "#FF6B6B" : "#FFE66D"
            opacity: 0.5

            // Crosshair
            Rectangle {
                anchors.centerIn: parent
                width: parent.width * 0.6
                height: 4
                color: parent.border.color
            }
            Rectangle {
                anchors.centerIn: parent
                width: 4
                height: parent.height * 0.6
                color: parent.border.color
            }

            // Fist gesture icon
            Text {
                anchors.centerIn: parent
                text: "✊"
                font.pixelSize: 64
                opacity: 0.7
            }

            // Pulse animation
            SequentialAnimation on scale {
                running: true
                loops: Animation.Infinite

                NumberAnimation {
                    from: 0.9
                    to: 1.1
                    duration: 600
                    easing.type: Easing.InOutQuad
                }
                NumberAnimation {
                    from: 1.1
                    to: 0.9
                    duration: 600
                    easing.type: Easing.InOutQuad
                }
            }
        }

        // Gesture cursor indicator
        Item {
            Layout.alignment: Qt.AlignHCenter
            Layout.topMargin: 20
            width: parent.width
            height: 40

            Text {
                anchors.centerIn: parent
                text: gestureBridge.handDetected
                      ? (gestureBridge.isFist
                         ? "✓ FIST DETECTED - Dismissing..."
                         : "Hand detected - Show FIST gesture")
                      : "Waiting for hand..."
                font.pixelSize: 24
                font.weight: gestureBridge.isFist ? Font.Bold : Font.Normal
                color: gestureBridge.isFist
                       ? (root.isWhite ? "#00C851" : "#00E676")
                       : (root.isWhite ? "#666666" : "#999999")
                horizontalAlignment: Text.AlignHCenter

                // Flash when fist detected
                SequentialAnimation on opacity {
                    running: gestureBridge.isFist
                    loops: Animation.Infinite

                    NumberAnimation {
                        from: 1.0
                        to: 0.3
                        duration: 200
                    }
                    NumberAnimation {
                        from: 0.3
                        to: 1.0
                        duration: 200
                    }
                }
            }
        }
    }

    // Gesture detection
    Connections {
        target: gestureBridge

        function onFistDetected() {
            console.log("========================================")
            console.log("FIST GESTURE DETECTED - Dismissing alarm")
            console.log("========================================")

            // Visual feedback
            dismissFeedback.start()

            // Dismiss alarm after short delay
            dismissTimer.start()
        }
    }

    // Visual feedback animation
    SequentialAnimation {
        id: dismissFeedback

        ParallelAnimation {
            // Flash target green
            ColorAnimation {
                target: gestureTarget
                property: "color"
                to: "#00C851"
                duration: 100
            }
            // Scale up
            NumberAnimation {
                target: gestureTarget
                property: "scale"
                to: 1.3
                duration: 100
            }
        }

        PauseAnimation {
            duration: 200
        }

        ParallelAnimation {
            // Fade out target
            NumberAnimation {
                target: gestureTarget
                property: "opacity"
                to: 0
                duration: 300
            }
            // Scale down
            NumberAnimation {
                target: gestureTarget
                property: "scale"
                to: 0.5
                duration: 300
            }
        }
    }

    // Timer to dismiss alarm (after gesture detected)
    Timer {
        id: dismissTimer
        interval: 500
        repeat: false
        onTriggered: {
            console.log("Dismissing alarm and returning to menu...")

            // Stop flash timer
            flashTimer.stop()

            // Dismiss alarm in AlarmManager
            alarmManager.dismissAlarm()

            // Navigate back to menu
            router.navigateTo("menu")
        }
    }

    // Component lifecycle
    Component.onCompleted: {
        console.log("========================================")
        console.log("AlarmScreen loaded")
        console.log("Alarm name:", root.alarmName)
        console.log("Flash interval: 200ms")
        console.log("========================================")
    }

    Component.onDestruction: {
        flashTimer.stop()
    }
}
