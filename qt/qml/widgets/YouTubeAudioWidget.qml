import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import "../components"

/**
 * YouTube Audio Widget - yt-dlp based
 * Compact audio player with title, uploader, and play/pause control
 * Supports gesture control
 */
Item {
    id: root

    width: 640
    height: 200

    // Exposed property for setting YouTube URL from outside
    property string youtubeUrl: ""

    // Auto-play on URL change
    property bool autoPlay: true

    // Signal when player is ready
    signal playerReady()

    // Track if play button is hovered by gesture cursor
    property bool playButtonGestureHovered: false

    // Glass morphism background with higher transparency
    Rectangle {
        anchors.fill: parent
        radius: 24
        color: Qt.rgba(0.1, 0.1, 0.15, 0.4)
        border.color: Qt.rgba(1, 1, 1, 0.15)
        border.width: 1

        // Subtle gradient overlay
        Rectangle {
            anchors.fill: parent
            radius: parent.radius
            gradient: Gradient {
                GradientStop { position: 0.0; color: Qt.rgba(1, 1, 1, 0.03) }
                GradientStop { position: 1.0; color: Qt.rgba(0, 0, 0, 0.03) }
            }
        }
    }

    RowLayout {
        anchors.fill: parent
        anchors.margins: 15
        spacing: 15

        // Left: YouTube Logo
        Rectangle {
            Layout.preferredWidth: 120
            Layout.fillHeight: true
            color: "transparent"

            Image {
                id: youtubeLogo
                anchors.centerIn: parent
                width: 50
                height: 50
                source: "qrc:/assets/fonts/Youtube_logo.png"
                fillMode: Image.PreserveAspectFit
                asynchronous: true
                smooth: true
                cache: true

                onStatusChanged: {
                    if (status === Image.Error) {
                        console.error("Failed to load YouTube logo")
                    }
                }
            }

            // Fallback text if image fails
            Text {
                anchors.centerIn: parent
                text: youtubeLogo.status === Image.Error ? "♫" : ""
                font.pixelSize: 44
                color: "#FF0000"
                visible: youtubeLogo.status === Image.Error
            }
        }

        // Right: Track Info and Control
        Rectangle {
            Layout.fillWidth: true
            Layout.fillHeight: true
            radius: 12
            color: Qt.rgba(0, 0, 0, 0.2)
            clip: true

            ColumnLayout {
                anchors.fill: parent
                anchors.margins: 15
                spacing: 10

                // Track Title
                Text {
                    Layout.fillWidth: true
                    text: youtubeProvider.currentTitle || "No track loaded"
                    font.pixelSize: 18
                    font.weight: Font.Medium
                    color: "white"
                    elide: Text.ElideRight
                    wrapMode: Text.NoWrap
                }

                // Uploader Name
                Text {
                    Layout.fillWidth: true
                    text: youtubeProvider.currentUploader || "Select a YouTube URL to play"
                    font.pixelSize: 15
                    color: Qt.rgba(1, 1, 1, 0.7)
                    elide: Text.ElideRight
                    wrapMode: Text.NoWrap
                }

                // Progress bar
                Rectangle {
                    Layout.fillWidth: true
                    Layout.preferredHeight: 6
                    radius: 3
                    color: Qt.rgba(1, 1, 1, 0.2)
                    visible: youtubeProvider.currentTitle !== ""

                    Rectangle {
                        width: youtubeProvider.duration > 0 ?
                               (parent.width * youtubeProvider.position / youtubeProvider.duration) : 0
                        height: parent.height
                        radius: parent.radius
                        color: "#FF0000"
                    }
                }

                Item { Layout.fillHeight: true }

                // Play/Pause Button - Larger size with gesture support
                Rectangle {
                    id: playButton
                    Layout.alignment: Qt.AlignHCenter
                    Layout.preferredWidth: 160
                    Layout.preferredHeight: 50
                    radius: 25
                    color: {
                        if (youtubeProvider.currentTitle === "") return Qt.rgba(1, 1, 1, 0.2)
                        if (root.playButtonGestureHovered) return Qt.lighter("#FF0000", 1.2)
                        if (playButtonMouseArea.pressed) return Qt.darker("#FF0000", 1.3)
                        return "#FF0000"
                    }
                    border.color: root.playButtonGestureHovered ? "#FFFFFF" : Qt.rgba(1, 1, 1, 0.3)
                    border.width: root.playButtonGestureHovered ? 2 : 1

                    // Gesture hover detection
                    function checkGestureHover() {
                        if (typeof gestureBridge === 'undefined') return false

                        // Get the application window
                        var win = root.Window.window
                        if (!win) {
                            console.warn("YouTubeAudioWidget: Window not found")
                            return false
                        }

                        // Convert normalized gesture coordinates (0-1) to absolute window coordinates
                        var cursorX = gestureBridge.cursorX * win.width
                        var cursorY = gestureBridge.cursorY * win.height

                        // Get button position in window coordinates (null = window)
                        var buttonPos = playButton.mapToItem(null, 0, 0)

                        // Check if cursor is inside button bounds
                        var isHovered = cursorX >= buttonPos.x &&
                                       cursorX <= buttonPos.x + playButton.width &&
                                       cursorY >= buttonPos.y &&
                                       cursorY <= buttonPos.y + playButton.height

                        return isHovered
                    }

                    RowLayout {
                        anchors.centerIn: parent
                        spacing: 8

                        Text {
                            text: {
                                if (youtubeProvider.isLoading) return "⏳"
                                if (youtubeProvider.isPlaying) return "⏸"
                                if (youtubeProvider.currentTitle !== "") return "▶"
                                return "▶"
                            }
                            font.pixelSize: 20
                            color: youtubeProvider.currentTitle !== "" ? "white" : Qt.rgba(1, 1, 1, 0.5)
                        }

                        Text {
                            text: {
                                if (youtubeProvider.isLoading) return "Loading"
                                if (youtubeProvider.isPlaying) return "Pause"
                                if (youtubeProvider.currentTitle !== "") return "Play"
                                return "Ready"
                            }
                            font.pixelSize: 16
                            font.weight: Font.Medium
                            color: youtubeProvider.currentTitle !== "" ? "white" : Qt.rgba(1, 1, 1, 0.5)
                        }
                    }

                    MouseArea {
                        id: playButtonMouseArea
                        anchors.fill: parent
                        enabled: youtubeProvider.currentTitle !== "" && !youtubeProvider.isLoading
                        cursorShape: enabled ? Qt.PointingHandCursor : Qt.ArrowCursor

                        onClicked: togglePlayPause()
                    }

                    // Update hover state on cursor position change
                    Connections {
                        target: typeof gestureBridge !== 'undefined' ? gestureBridge : null
                        function onCursorXChanged() {
                            root.playButtonGestureHovered = playButton.checkGestureHover()
                        }
                        function onCursorYChanged() {
                            root.playButtonGestureHovered = playButton.checkGestureHover()
                        }
                    }
                }
            }
        }
    }

    // Function to toggle play/pause
    function togglePlayPause() {
        if (youtubeProvider.currentTitle === "" || youtubeProvider.isLoading) {
            return
        }

        if (youtubeProvider.isPlaying) {
            youtubeProvider.pause()
        } else {
            youtubeProvider.play()
        }
    }

    // Watch for URL changes
    onYoutubeUrlChanged: {
        if (youtubeUrl && youtubeUrl.length > 0) {
            console.log("YouTubeAudioWidget: Loading URL:", youtubeUrl)
            try {
                youtubeProvider.playYouTubeUrl(youtubeUrl)
            } catch (error) {
                console.error("YouTubeAudioWidget: Failed to load URL:", youtubeUrl, "Error:", error)
            }
        } else if (youtubeUrl === "") {
            console.log("YouTubeAudioWidget: URL cleared, widget will hide")
        }
    }

    // Watch for stream ready
    Connections {
        target: youtubeProvider
        function onStreamReady() {
            console.log("YouTubeAudioWidget: Stream ready")
            root.playerReady()

            // Auto-play if enabled
            if (root.autoPlay && !youtubeProvider.isPlaying) {
                youtubeProvider.play()
            }
        }
    }

    // Gesture click detection (fist gesture)
    Connections {
        target: typeof gestureBridge !== 'undefined' ? gestureBridge : null
        function onFistDetected() {
            console.log("YouTubeAudioWidget: Fist gesture detected, button hovered:", root.playButtonGestureHovered)
            if (root.playButtonGestureHovered) {
                console.log("YouTubeAudioWidget: Gesture click detected on play button - toggling playback")
                togglePlayPause()
            }
        }
    }

    // Debug: Log hover state changes
    onPlayButtonGestureHoveredChanged: {
        if (playButtonGestureHovered) {
            console.log("YouTubeAudioWidget: Play button HOVERED by gesture cursor")
        }
    }

    // Note: Stop() calls removed to prevent conflicts during screen transitions
    // When a new URL is loaded via playYouTubeUrl(), the previous playback
    // is automatically stopped and replaced by YouTubeProvider
    // This prevents race conditions with Loader destroying/creating screens

    // Error display (small indicator in corner)
    Rectangle {
        anchors.right: parent.right
        anchors.top: parent.top
        anchors.margins: 10
        width: 30
        height: 30
        radius: 15
        color: "#FF4444"
        visible: youtubeProvider.errorMessage !== ""

        Text {
            anchors.centerIn: parent
            text: "!"
            font.pixelSize: 18
            font.weight: Font.Bold
            color: "white"
        }

        MouseArea {
            anchors.fill: parent
            onClicked: {
                console.log("YouTube Error:", youtubeProvider.errorMessage)
            }
        }

        ToolTip.visible: youtubeProvider.errorMessage !== ""
        ToolTip.text: youtubeProvider.errorMessage
        ToolTip.delay: 500
    }

    Component.onCompleted: {
        console.log("YouTubeAudioWidget (yt-dlp based) initialized")
    }
}
