import QtQuick 2.15
import QtQuick.Controls 2.15
import QtQuick.Effects
import "../components"
import "../widgets"
import "../styles"

Item {
    id: root

    // 위젯 표시 상태
    property bool showClock: true
    property bool showWeather: true
    property bool showSpotify: true  // Changed to true - show by default when authenticated
    property bool showQuote: false

    // Auto-play when Spotify widget is shown
    onShowSpotifyChanged: {
        if (showSpotify && spotifyProvider.authenticated) {
            console.log("Spotify widget toggled ON - attempting to resume playback")
            spotifyProvider.play()
        }
    }

    // Show Spotify widget automatically when track data is available
    Connections {
        target: spotifyProvider
        function onTrackChanged() {
            if (spotifyProvider.authenticated && spotifyProvider.trackName && !showSpotify) {
                console.log("Track detected - showing Spotify widget automatically")
                showSpotify = true
            }
        }
    }

    // Transparent glass effect background
    Rectangle {
        anchors.fill: parent
        color: Theme.alpha(Theme.glassBackground, 0.05)
    }

    // ====== 중앙 상단 위젯 영역 ======
    Column {
        id: topWidgets
        anchors.horizontalCenter: parent.horizontalCenter
        anchors.top: parent.top
        anchors.topMargin: root.height * 0.12
        spacing: 20

        // 시계 위젯
        ClockWidget {
            anchors.horizontalCenter: parent.horizontalCenter
            visible: showClock
        }

        // 날씨 위젯
        WeatherWidget {
            anchors.horizontalCenter: parent.horizontalCenter
            visible: showWeather
        }

        // 명언 위젯 (날씨 바로 밑)
        QuoteWidget {
            anchors.horizontalCenter: parent.horizontalCenter
            visible: showQuote
        }
    }

    // ====== 하단 위젯 영역 (Spotify 중앙) ======
    SpotifyWidget {
        anchors.horizontalCenter: parent.horizontalCenter
        anchors.bottom: parent.bottom
        anchors.bottomMargin: root.height * 0.08
        visible: showSpotify
    }

    // ====== 위젯 토글 버튼 (우측 중앙) - Gesture controlled ======
    GestureControlledUI {
        anchors.right: root.right
        anchors.verticalCenter: root.verticalCenter
        anchors.margins: root.width * 0.03

        Column {
            spacing: root.height * 0.015

        // 토글 버튼 스타일 - 둥근 네모 모양으로 더 크게
        component ToggleButton: Rectangle {
            id: toggleButton
            width: root.width * 0.14   // Increased from 0.05 to 0.14 for better gesture control
            height: root.height * 0.065 // Increased height for better visibility
            radius: 20  // Rounded corners instead of full circle
            color: isActive ? "#59FFFFFF" : "#33FFFFFF"  // 35% or 20% opacity white
            border.color: "#40000000"  // 25% opacity black (subtle border)
            border.width: 2  // Slightly thicker border

            property bool isActive: false
            property string icon: ""
            property string label: ""  // Add text label
            property bool hovered: false
            property bool gestureHovered: false
            signal clicked()

            layer.enabled: true
            layer.effect: MultiEffect {
                shadowEnabled: true
                shadowOpacity: 0.2  // Slightly more visible shadow
                shadowBlur: 0.5
                shadowColor: "#000000"
            }

            // Icon and label in a row
            Row {
                anchors.centerIn: parent
                spacing: 8

                Text {
                    anchors.verticalCenter: parent.verticalCenter
                    text: icon
                    font.pixelSize: toggleButton.height * 0.4  // Larger icon
                    opacity: toggleButton.isActive ? 1.0 : 0.7
                }

                Text {
                    anchors.verticalCenter: parent.verticalCenter
                    text: label
                    font.pixelSize: toggleButton.height * 0.28  // Text size
                    font.weight: Font.Medium
                    color: "#000000"
                    opacity: toggleButton.isActive ? 1.0 : 0.7
                }
            }

            MouseArea {
                anchors.fill: parent
                hoverEnabled: true
                cursorShape: Qt.PointingHandCursor
                onClicked: parent.clicked()
                onEntered: parent.hovered = true
                onExited: parent.hovered = false
            }

            scale: (hovered || gestureHovered) ? 1.1 : 1.0
            Behavior on scale {
                NumberAnimation { duration: 200; easing.type: Easing.OutCubic }
            }
            Behavior on color {
                ColorAnimation { duration: 200 }
            }

            // Gesture hover detection
            Timer {
                interval: 50
                running: typeof gestureBridge !== 'undefined' && gestureBridge.handDetected
                repeat: true

                onTriggered: {
                    if (!gestureBridge || !gestureBridge.handDetected) {
                        toggleButton.gestureHovered = false
                        return
                    }

                    var cursorX = gestureBridge.cursorX
                    var cursorY = gestureBridge.cursorY
                    var windowItem = toggleButton.Window.window
                    if (!windowItem) return

                    var screenWidth = windowItem.width
                    var screenHeight = windowItem.height
                    var cursorScreenX = cursorX * screenWidth
                    var cursorScreenY = cursorY * screenHeight

                    var buttonPos = toggleButton.mapToItem(null, 0, 0)
                    var buttonLeft = buttonPos.x
                    var buttonTop = buttonPos.y
                    var buttonRight = buttonLeft + toggleButton.width
                    var buttonBottom = buttonTop + toggleButton.height

                    var isInside = (cursorScreenX >= buttonLeft &&
                                  cursorScreenX <= buttonRight &&
                                  cursorScreenY >= buttonTop &&
                                  cursorScreenY <= buttonBottom)

                    toggleButton.gestureHovered = isInside
                }
            }

            // Gesture click detection
            Connections {
                target: typeof gestureBridge !== 'undefined' ? gestureBridge : null

                function onFistDetected() {
                    if (toggleButton.gestureHovered) {
                        console.log("Gesture click on toggle button:", toggleButton.icon)
                        toggleButton.clicked()
                    }
                }
            }
        }

        // 시계 토글
        ToggleButton {
            icon: "🕐"
            label: "Clock"
            isActive: showClock
            onClicked: showClock = !showClock
        }

        // 날씨 토글
        ToggleButton {
            icon: "🌤️"
            label: "Weather"
            isActive: showWeather
            onClicked: showWeather = !showWeather
        }

        // Spotify 토글
        ToggleButton {
            icon: "🎵"
            label: "Music"
            isActive: showSpotify
            onClicked: showSpotify = !showSpotify
        }

        // 명언 토글
        ToggleButton {
            icon: "💭"
            label: "Quote"
            isActive: showQuote
            onClicked: showQuote = !showQuote
        }
        }
    }

    // ====== Back 버튼 (좌측 중앙) - Gesture controlled ======
    GestureControlledUI {
        anchors.left: root.left
        anchors.verticalCenter: root.verticalCenter
        anchors.margins: root.width * 0.03

        MinimalButton {
            text: "← Menu"
            implicitWidth: root.width * 0.12
            implicitHeight: root.height * 0.055
            buttonRadius: 28
            onClicked: router.navigateTo("menu")
        }
    }

    // ====== 힌트 텍스트 (중앙 하단) ======
    Text {
        anchors.horizontalCenter: parent.horizontalCenter
        anchors.bottom: parent.bottom
        anchors.bottomMargin: root.height * 0.02
        text: "Use toggle buttons to show/hide widgets"
        color: Theme.alpha(Theme.textTertiary, 0.6)
        font.pixelSize: root.width * 0.012
        font.weight: Theme.fontWeightRegular
        visible: !showSpotify && !showQuote
    }
}
