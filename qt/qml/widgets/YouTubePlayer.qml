import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QtWebEngine

/**
 * YouTube Player Widget - WebEngine Version
 * Embeds YouTube IFrame Player with logo on the left
 */
Item {
    id: root

    width: 480
    height: 160

    // Exposed property for setting YouTube URL from outside
    property string youtubeUrl: ""

    // Signal when player is ready
    signal playerReady()

    // Glass morphism background with higher transparency
    Rectangle {
        anchors.fill: parent
        radius: 24
        color: Qt.rgba(0.1, 0.1, 0.15, 0.4)  // More transparent
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
            Layout.preferredWidth: 100
            Layout.fillHeight: true
            color: "transparent"
            z: 10  // Ensure logo is above video

            Image {
                id: youtubeLogo
                anchors.centerIn: parent
                width: 40
                height: 40
                source: "qrc:/assets/fonts/Youtube_logo.png"
                fillMode: Image.PreserveAspectFit
                asynchronous: true
                smooth: true
                cache: true

                onStatusChanged: {
                    if (status === Image.Error) {
                        console.error("Failed to load YouTube logo from:", source)
                    } else if (status === Image.Ready) {
                        console.log("YouTube logo loaded successfully")
                    }
                }
            }

            // Debug text if image fails to load
            Text {
                anchors.centerIn: parent
                text: youtubeLogo.status === Image.Error ? "Youtube" : ""
                font.pixelSize: 24
                font.bold: true
                color: "#000000"
                visible: youtubeLogo.status === Image.Error
            }
        }

        // Right: Video Player
        Rectangle {
            Layout.fillWidth: true
            Layout.fillHeight: true
            radius: 12
            color: "#000000"
            clip: true
            z: 1  // Video is behind logo

            WebEngineView {
                id: webview
                anchors.fill: parent

                settings.javascriptEnabled: true
                settings.pluginsEnabled: true
                settings.localStorageEnabled: true
                settings.autoLoadImages: true
                settings.playbackRequiresUserGesture: false  // Enable autoplay

                onLoadingChanged: function(loadRequest) {
                    if (loadRequest.status === WebEngineView.LoadSucceededStatus) {
                        statusText.text = "재생 중"
                        root.playerReady()
                    } else if (loadRequest.status === WebEngineView.LoadFailedStatus) {
                        statusText.text = "로딩 실패"
                        console.log("YouTube player load failed:", loadRequest.errorString)
                    }
                }
            }

            // Loading/Status overlay
            Rectangle {
                anchors.fill: parent
                color: Qt.rgba(0, 0, 0, 0.8)
                visible: statusText.text === "로딩 중..."
                radius: 12

                Text {
                    id: statusText
                    anchors.centerIn: parent
                    text: "로딩 중..."
                    color: "white"
                    font.pixelSize: 14
                }
            }
        }
    }

    // Extract video ID from YouTube URL
    function extractVideoId(url) {
        if (!url)
            return ""

        // 1) youtu.be/XXXXXXXXXXX format
        var match = url.match(/youtu\.be\/([A-Za-z0-9_-]{11})/)
        if (match && match.length > 1)
            return match[1]

        // 2) youtube.com/watch?v=XXXXXXXXXXX format
        match = url.match(/[?&]v=([A-Za-z0-9_-]{11})/)
        if (match && match.length > 1)
            return match[1]

        // 3) Just the ID
        if (url.length === 11 && url.match(/^[A-Za-z0-9_-]+$/))
            return url

        return ""
    }

    // Load YouTube video by URL
    function loadYoutubeVideo(url) {
        var videoId = extractVideoId(url)
        if (!videoId) {
            console.log("Invalid YouTube URL:", url)
            statusText.text = "잘못된 URL"
            return
        }

        statusText.text = "로딩 중..."

        // Virtual origin for IFrame API security
        var virtualOrigin = "https://youtube-player.lumiscape.com"

        // Build embed URL with parameters
        var embedUrl =
            "https://www.youtube-nocookie.com/embed/" + videoId +
            "?autoplay=1" +
            "&modestbranding=1" +
            "&rel=0" +
            "&enablejsapi=1" +
            "&playsinline=1" +
            "&origin=" + virtualOrigin

        console.log("Loading YouTube video:", videoId)

        // HTML content with embedded IFrame
        var htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    html, body, #player {
                        margin: 0;
                        padding: 0;
                        width: 100%;
                        height: 100%;
                        overflow: hidden;
                        background-color: #000;
                    }
                </style>
            </head>
            <body>
                <iframe id="player"
                        src="${embedUrl}"
                        frameborder="0"
                        allow="autoplay; encrypted-media"
                        allowfullscreen>
                </iframe>
            </body>
            </html>
        `

        // Load HTML with virtual origin
        webview.loadHtml(htmlContent, virtualOrigin)
    }

    // Watch for URL changes
    onYoutubeUrlChanged: {
        if (youtubeUrl && youtubeUrl.length > 0) {
            loadYoutubeVideo(youtubeUrl)
        }
    }

    Component.onCompleted: {
        console.log("YouTube Player (WebEngine) initialized")
    }
}
