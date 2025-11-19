import QtQuick 2.15
import QtQuick.Window 2.15
import QtQuick.Controls 2.15
import QtQuick.Effects
import "../components"
import "../styles"

Item {
    id: root

    width: Window.window ? Window.window.width * 0.5 : 550
    height: 140

    // Glassmorphism background
    Rectangle {
        anchors.fill: parent
        radius: 28
        color: "#66FFFFFF"
        border.color: "#40000000"
        border.width: 1.5

        layer.enabled: true
        layer.effect: MultiEffect {
            shadowEnabled: true
            shadowOpacity: 0.15
            shadowBlur: 0.5
            shadowColor: "#000000"
        }
    }

    // Playing state
    Item {
        anchors.fill: parent
        anchors.margins: 20
        visible: spotifyProvider.authenticated && spotifyProvider.trackName

        // Album artwork - LEFT SIDE - Absolute position
        Rectangle {
            id: albumArt
            anchors.left: parent.left
            anchors.verticalCenter: parent.verticalCenter
            width: 100
            height: 100
            radius: 18
            color: "#26000000"
            clip: true

            layer.enabled: true
            layer.effect: MultiEffect {
                shadowEnabled: true
                shadowOpacity: 0.15
                shadowBlur: 0.4
                shadowColor: "#000000"
            }

            Image {
                anchors.fill: parent
                source: spotifyProvider.albumArtUrl || ""
                fillMode: Image.PreserveAspectCrop
                smooth: true
            }

            Text {
                anchors.centerIn: parent
                text: "♫"
                font.pixelSize: 32
                color: "#1DB954"
                opacity: 0.6
                visible: !spotifyProvider.albumArtUrl
            }
        }

        // Track info - RIGHT SIDE - Absolute position
        Item {
            id: trackInfo
            anchors.left: albumArt.right
            anchors.leftMargin: 20
            anchors.right: parent.right
            anchors.verticalCenter: parent.verticalCenter
            height: parent.height

            // Now Playing label
            Text {
                id: nowPlayingLabel
                anchors.top: parent.top
                anchors.topMargin: 0
                text: "♫ Now Playing"
                font.pixelSize: 12
                color: "#1DB954"
                font.weight: Font.Bold
            }

            // Track name
            Text {
                id: trackNameText
                anchors.top: nowPlayingLabel.bottom
                anchors.topMargin: 8
                anchors.left: parent.left
                anchors.right: parent.right
                text: spotifyProvider.trackName || "Loading..."
                font.pixelSize: 20
                font.weight: Font.Bold
                color: "#000000"
                elide: Text.ElideRight
                wrapMode: Text.NoWrap

                Connections {
                    target: spotifyProvider
                    function onTrackChanged() {
                        trackNameText.text = spotifyProvider.trackName
                    }
                }
            }

            // Artist name
            Text {
                id: artistNameText
                anchors.top: trackNameText.bottom
                anchors.topMargin: 4
                anchors.left: parent.left
                anchors.right: parent.right
                text: spotifyProvider.artistName || "Unknown"
                font.pixelSize: 16
                color: "#000000"
                opacity: 0.6
                elide: Text.ElideRight
                wrapMode: Text.NoWrap
            }

            // Progress bar
            Rectangle {
                anchors.bottom: parent.bottom
                anchors.left: parent.left
                anchors.right: parent.right
                height: 3
                radius: 1.5
                color: "#26000000"
                visible: spotifyProvider.duration > 0

                Rectangle {
                    width: parent.width * (spotifyProvider.duration > 0 ? spotifyProvider.progress / spotifyProvider.duration : 0)
                    height: parent.height
                    radius: parent.radius
                    color: "#1DB954"

                    Behavior on width {
                        NumberAnimation { duration: 500; easing.type: Easing.OutCubic }
                    }
                }
            }
        }
    }

    // No playback state
    Column {
        anchors.centerIn: parent
        spacing: 12
        visible: spotifyProvider.authenticated && !spotifyProvider.trackName

        Text {
            text: "♫"
            font.pixelSize: 36
            color: "#1DB954"
            opacity: 0.5
            anchors.horizontalCenter: parent.horizontalCenter
        }

        Text {
            text: "No Active Playback"
            font.pixelSize: 14
            color: "#000000"
            opacity: 0.7
            font.weight: Font.Bold
            anchors.horizontalCenter: parent.horizontalCenter
        }

        Text {
            text: "Play music in Spotify app first"
            font.pixelSize: 12
            color: "#000000"
            opacity: 0.5
            anchors.horizontalCenter: parent.horizontalCenter
        }
    }

    // Not authenticated state
    Column {
        anchors.centerIn: parent
        spacing: Theme.spacingM
        visible: !spotifyProvider.authenticated

        Text {
            text: "♫"
            font.pixelSize: 36
            color: "#1DB954"
            opacity: 0.5
            anchors.horizontalCenter: parent.horizontalCenter
        }

        Text {
            text: "Spotify Not Connected"
            font.pixelSize: 14
            color: "#000000"
            opacity: 0.6
            font.weight: Font.Bold
            anchors.horizontalCenter: parent.horizontalCenter
        }

        Rectangle {
            anchors.horizontalCenter: parent.horizontalCenter
            width: 260
            height: 36
            radius: 18
            color: Theme.spotifyWidget

            Text {
                anchors.centerIn: parent
                text: "Connect Spotify (Check Console)"
                font.pixelSize: 11
                font.weight: Font.Bold
                color: "white"
            }

            MouseArea {
                anchors.fill: parent
                cursorShape: Qt.PointingHandCursor
                onClicked: {
                    console.log("\n🎵 SPOTIFY AUTHENTICATION")
                    console.log("Open this URL: " + spotifyAuthHelper.authUrl)
                }
            }
        }
    }
}
