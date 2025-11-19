import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QtWebEngine
import QtWebChannel

/**
 * Spotify Web Player - Uses Spotify Web Playback SDK
 * This enables direct audio playback on this device (Premium account required)
 */
Item {
    id: root

    width: 400
    height: 140

    // Properties
    property var bridge: null
    property bool playerReady: false
    property string accessToken: ""

    // Expose bridge properties
    readonly property bool playing: bridge ? bridge.playing : false
    readonly property string trackName: bridge ? bridge.trackName : ""
    readonly property string artistName: bridge ? bridge.artistName : ""
    readonly property string albumName: bridge ? bridge.albumName : ""
    readonly property string albumArtUrl: bridge ? bridge.albumArtUrl : ""
    readonly property int progress: bridge ? bridge.progress : 0
    readonly property int duration: bridge ? bridge.duration : 0
    readonly property string deviceId: bridge ? bridge.deviceId : ""
    readonly property string error: bridge ? bridge.error : ""

    // Signals
    signal playerInitialized(string deviceId)

    // Glass morphism background
    Rectangle {
        anchors.fill: parent
        radius: 28
        color: Qt.rgba(0.05, 0.05, 0.08, 0.75)
        border.color: Qt.rgba(1, 1, 1, 0.15)
        border.width: 1
    }

    RowLayout {
        anchors.fill: parent
        anchors.margins: 15
        spacing: 15

        // Album Art
        Rectangle {
            Layout.preferredWidth: 100
            Layout.preferredHeight: 100
            Layout.alignment: Qt.AlignVCenter
            radius: 12
            color: Qt.rgba(0, 0, 0, 0.4)
            border.color: Qt.rgba(1, 1, 1, 0.1)
            border.width: 1
            clip: true  // Clip image to rounded corners

            Image {
                id: albumArt
                anchors.fill: parent
                anchors.margins: 1
                source: root.albumArtUrl || ""
                fillMode: Image.PreserveAspectCrop
                asynchronous: true
                smooth: true
                visible: status === Image.Ready
            }

            // Placeholder when no album art
            Text {
                anchors.centerIn: parent
                text: "♫"
                font.pixelSize: 40
                color: Qt.rgba(1, 1, 1, 0.3)
                visible: albumArt.status !== Image.Ready
            }
        }

        // Track Info
        ColumnLayout {
            Layout.fillWidth: true
            Layout.fillHeight: true
            spacing: 8

            Item { Layout.fillHeight: true }

            // Status or Track Name
            Text {
                Layout.fillWidth: true
                text: {
                    if (!root.playerReady) return "Initializing Web Player..."
                    if (root.error) return "Error: " + root.error
                    if (!root.trackName) return "No Active Playback"
                    return root.trackName
                }
                font.pixelSize: 16
                font.bold: true
                color: root.error ? "#ff6b6b" : "white"
                elide: Text.ElideRight
            }

            // Artist & Album
            Text {
                Layout.fillWidth: true
                text: {
                    if (root.artistName && root.albumName) {
                        return root.artistName + " • " + root.albumName
                    } else if (root.artistName) {
                        return root.artistName
                    } else if (!root.playerReady) {
                        return "Loading Spotify SDK..."
                    } else if (!root.deviceId) {
                        return "Waiting for device registration..."
                    }
                    return "Play music from Spotify app"
                }
                font.pixelSize: 12
                color: Qt.rgba(1, 1, 1, 0.6)
                elide: Text.ElideRight
                visible: !root.error
            }

            // Device Info
            Text {
                Layout.fillWidth: true
                text: root.deviceId ? "Device: Lumiscape Smart Glass ✓" : ""
                font.pixelSize: 10
                color: "#1DB954"
                visible: root.playerReady && root.deviceId && !root.error
            }

            Item { Layout.fillHeight: true }

            // Progress Bar
            Rectangle {
                Layout.fillWidth: true
                Layout.preferredHeight: 4
                radius: 2
                color: Qt.rgba(1, 1, 1, 0.2)
                visible: root.duration > 0

                Rectangle {
                    width: root.duration > 0 ? (parent.width * root.progress / root.duration) : 0
                    height: parent.height
                    radius: parent.radius
                    color: "#1DB954"

                    Behavior on width {
                        NumberAnimation {
                            duration: 500
                            easing.type: Easing.OutCubic
                        }
                    }
                }
            }
        }
    }

    // TEMPORARILY DISABLED - WebEngine causes crash
    /*
    // WebChannel for QML-JS communication
    WebChannel {
        id: webChannel
        registeredObjects: root.bridge ? [root.bridge] : []
    }

    // WebEngine Player (hidden)
    WebEngineView {
        id: webEngine
        width: 1
        height: 1
        visible: false

        settings.javascriptEnabled: true
        settings.localStorageEnabled: true

        webChannel: webChannel

        onLoadingChanged: function(loadRequest) {
            if (loadRequest.status === WebEngineView.LoadSucceededStatus) {
                console.log("Spotify Web Player loaded successfully")

                // Initialize player with access token
                if (root.accessToken) {
                    webEngine.runJavaScript(
                        "if (window.spotifyPlayerAPI) { " +
                        "  window.spotifyPlayerAPI.initialize('" + root.accessToken + "'); " +
                        "}"
                    )
                }
            } else if (loadRequest.status === WebEngineView.LoadFailedStatus) {
                console.error("Spotify Web Player load failed:", loadRequest.errorString)
                if (root.bridge) {
                    root.bridge.onError("Failed to load player: " + loadRequest.errorString)
                }
            }
        }

        Component.onCompleted: {
            if (!root.bridge) {
                console.error("SpotifyWebPlayer: bridge is null! Cannot initialize player.")
                return
            }

            // Load the HTML player from assets directory
            var htmlPath = "file://" + appConfig.applicationDirPath + "/assets/html/spotify_player.html"
            console.log("Loading Spotify Web Player from:", htmlPath)
            url = htmlPath
        }
    }
    */

    // DEBUG: Simple text to verify the widget loads
    Text {
        anchors.centerIn: parent
        text: "SpotifyWebPlayer (WebEngine temporarily disabled)"
        color: "white"
        font.pixelSize: 14
    }

    // Playback controls (temporarily disabled)
    function play() {
        console.log("Play() - WebEngine disabled")
    }

    function pause() {
        console.log("Pause() - WebEngine disabled")
    }

    function togglePlay() {
        console.log("TogglePlay() - WebEngine disabled")
    }

    function nextTrack() {
        console.log("NextTrack() - WebEngine disabled")
    }

    function previousTrack() {
        console.log("PreviousTrack() - WebEngine disabled")
    }

    function setVolume(volume) {
        console.log("SetVolume() - WebEngine disabled")
    }

    function seek(positionMs) {
        console.log("Seek() - WebEngine disabled")
    }

    // Watch for access token changes
    onAccessTokenChanged: {
        if (bridge) {
            bridge.accessToken = accessToken
        }
    }

    // Watch for device ID changes
    Connections {
        target: bridge
        enabled: bridge !== null
        function onPlayerReady(deviceId) {
            console.log("Spotify Web Player ready! Device ID:", deviceId)
            root.playerReady = true
            root.playerInitialized(deviceId)
        }
    }

    Component.onCompleted: {
        if (!bridge) {
            console.error("SpotifyWebPlayer: bridge is null at initialization!")
            console.error("Make sure 'spotifyWebBridge' is available in QML context")
        } else {
            console.log("SpotifyWebPlayer initialized with bridge")
        }
    }
}
