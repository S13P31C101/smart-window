import QtQuick 2.15
import QtQuick.Controls 2.15
import QtMultimedia
import "../components"
import "../widgets"
import "../styles"

Item {
    id: root

    property string currentPeriod: clockProvider.period
    property string weatherCondition: weatherProvider.condition || "clear"
    property bool isVideoMode: false  // Toggle between image and video

    // Function to select scene image based on time and weather
    function getSceneImage() {
        // TODO: Implement weather and time-based scene selection
        // For now, return default image
        // Future structure:
        // - sunny_morning.png, rainy_evening.png, cloudy_afternoon.png, etc.

        return "qrc:/assets/images/scenes/default.png"
    }

    // Function to select scene video based on time and weather
    function getSceneVideo() {
        // TODO: Implement weather and time-based scene selection
        // For now, return default video
        // Future structure:
        // - sunny_morning.mp4, rainy_evening.mp4, cloudy_afternoon.mp4, etc.

        // Use applicationDirPath from AppConfig to build absolute path
        var videoPath = "file://" + appConfig.applicationDirPath + "/assets/videos/scenes/default.mp4"
        console.log("Application directory:", appConfig.applicationDirPath)
        console.log("Loading video from:", videoPath)
        return videoPath
    }

    // Background image
    Image {
        id: backgroundImage
        anchors.fill: parent
        source: getSceneImage()
        fillMode: Image.PreserveAspectCrop
        visible: !isVideoMode

        // Smooth transition when image changes
        Behavior on source {
            SequentialAnimation {
                NumberAnimation { target: backgroundImage; property: "opacity"; to: 0; duration: 300 }
                PropertyAction { target: backgroundImage; property: "source" }
                NumberAnimation { target: backgroundImage; property: "opacity"; to: 1; duration: 300 }
            }
        }
    }

    // Background video
    Video {
        id: backgroundVideo
        anchors.fill: parent
        source: getSceneVideo()
        fillMode: VideoOutput.PreserveAspectCrop
        visible: isVideoMode
        autoPlay: true
        loops: MediaPlayer.Infinite
        muted: true  // Mute by default for ambient video
        playbackRate: 0.2

        // Smooth fade in when video mode is activated
        opacity: visible ? 1.0 : 0.0
        Behavior on opacity {
            NumberAnimation { duration: 500 }
        }

        Component.onCompleted: {
            console.log("Video component created")
            console.log("Video source:", source)
            console.log("Video autoPlay:", autoPlay)
            console.log("Video loops:", loops)
            console.log("Has audio:", hasAudio)
            console.log("Has video:", hasVideo)
        }

        onSourceChanged: {
            console.log("Video source changed to:", source)
        }

        onPlaybackStateChanged: {
            console.log("Video playback state:", playbackState)
            if (playbackState === MediaPlayer.PlayingState) {
                console.log("Video is playing!")
            } else if (playbackState === MediaPlayer.StoppedState) {
                console.log("Video stopped")
            } else if (playbackState === MediaPlayer.PausedState) {
                console.log("Video paused")
            }
        }

        onHasVideoChanged: {
            console.log("Video track detected:", hasVideo)
        }

        onBufferProgressChanged: {
            if (bufferProgress < 1.0) {
                console.log("Buffering progress:", Math.round(bufferProgress * 100) + "%")
            }
        }

        onErrorOccurred: function(error, errorString) {
            console.error("Video playback error:", error, "-", errorString)
            console.error("Attempted source:", source)
            // Fallback to image mode on error
            isVideoMode = false
        }
    }

    // Overlay gradient for better widget visibility
    Rectangle {
        anchors.fill: parent
        gradient: Gradient {
            GradientStop { position: 0.0; color: "transparent" }
            GradientStop { position: 1.0; color: Theme.backgroundDark }
        }
        opacity: 0.4
    }

    // ====== 중앙 상단 위젯 영역 ======
    Column {
        anchors.horizontalCenter: parent.horizontalCenter
        anchors.top: parent.top
        anchors.topMargin: parent.height * 0.12
        spacing: 20

        // 시계 위젯
        ClockWidget {
            anchors.horizontalCenter: parent.horizontalCenter
        }

        // 날씨 위젯
        WeatherWidget {
            anchors.horizontalCenter: parent.horizontalCenter
        }

        // 명언 위젯 (날씨 바로 밑)
        QuoteWidget {
            anchors.horizontalCenter: parent.horizontalCenter
        }
    }

    // ====== 하단 위젯 영역 (Spotify 중앙) ======
    SpotifyWidget {
        anchors.horizontalCenter: parent.horizontalCenter
        anchors.bottom: parent.bottom
        anchors.bottomMargin: parent.height * 0.08
        visible: spotifyProvider.authenticated
    }

    // Back button
    Button {
        anchors.top: parent.top
        anchors.left: parent.left
        anchors.margins: Theme.spacingL
        text: "← Menu"
        onClicked: router.navigateTo("menu")

        background: GlassCard {
            implicitWidth: 100
            implicitHeight: 40
        }

        contentItem: Text {
            text: parent.text
            color: Theme.textPrimary
            font.pixelSize: Theme.fontSizeBody
            horizontalAlignment: Text.AlignHCenter
            verticalAlignment: Text.AlignVCenter
        }
    }

    // Image/Video toggle button
    Button {
        id: mediaToggleButton
        anchors.top: parent.top
        anchors.right: parent.right
        anchors.margins: Theme.spacingL
        text: isVideoMode ? "📷 Image" : "🎥 Video"
        onClicked: {
            isVideoMode = !isVideoMode
            if (isVideoMode) {
                console.log("Switched to video mode")
            } else {
                console.log("Switched to image mode")
            }
        }

        background: GlassCard {
            implicitWidth: 120
            implicitHeight: 40
        }

        contentItem: Text {
            text: parent.text
            color: Theme.textPrimary
            font.pixelSize: Theme.fontSizeBody
            horizontalAlignment: Text.AlignHCenter
            verticalAlignment: Text.AlignVCenter
        }

        // Subtle pulse animation to indicate interactivity
        SequentialAnimation on opacity {
            running: true
            loops: Animation.Infinite
            NumberAnimation { to: 1.0; duration: 2000; easing.type: Easing.InOutQuad }
            NumberAnimation { to: 1.0; duration: 2000; easing.type: Easing.InOutQuad }
        }
    }

    // Video status indicator (optional - shows when video is loading)
    Rectangle {
        anchors.centerIn: parent
        width: 60
        height: 60
        radius: 30
        color: Theme.backgroundDark
        opacity: 0.8
        visible: isVideoMode && backgroundVideo.playbackState !== MediaPlayer.PlayingState

        BusyIndicator {
            anchors.centerIn: parent
            running: parent.visible
        }
    }
}
