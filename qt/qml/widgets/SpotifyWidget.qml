import QtQuick 2.15
import QtQuick.Controls 2.15
import "../components"
import "../styles"

GlassCard {
    id: root

    width: 400
    height: 250

    Column {
        anchors.fill: parent
        anchors.margins: Theme.paddingM
        spacing: Theme.spacingM

        // Header
        Row {
            width: parent.width
            spacing: Theme.spacingS

            Text {
                text: "🎵"
                font.pixelSize: Theme.fontSizeH4
            }

            Text {
                text: "Spotify"
                font.pixelSize: Theme.fontSizeH4
                font.weight: Theme.fontWeightBold
                color: Theme.spotifyWidget
            }
        }

        // Track info
        Column {
            width: parent.width
            spacing: Theme.spacingS
            visible: spotifyProvider.authenticated

            Text {
                width: parent.width
                text: spotifyProvider.trackName || "No track playing"
                font.pixelSize: Theme.fontSizeBody
                font.weight: Theme.fontWeightMedium
                color: Theme.textPrimary
                elide: Text.ElideRight
            }

            Text {
                width: parent.width
                text: spotifyProvider.artistName || "-"
                font.pixelSize: Theme.fontSizeCaption
                color: Theme.textSecondary
                elide: Text.ElideRight
            }
        }

        // Progress bar
        Rectangle {
            width: parent.width
            height: 4
            radius: 2
            color: Theme.alpha(Theme.textPrimary, 0.2)
            visible: spotifyProvider.authenticated && spotifyProvider.duration > 0

            Rectangle {
                width: parent.width * (spotifyProvider.progress / spotifyProvider.duration)
                height: parent.height
                radius: parent.radius
                color: Theme.spotifyWidget
            }
        }

        // Controls
        Row {
            anchors.horizontalCenter: parent.horizontalCenter
            spacing: Theme.spacingM
            visible: spotifyProvider.authenticated

            Button {
                text: "⏮"
                onClicked: spotifyProvider.previous()
                background: Rectangle {
                    implicitWidth: 40
                    implicitHeight: 40
                    radius: 20
                    color: Theme.alpha(Theme.textPrimary, 0.1)
                }
                contentItem: Text {
                    text: parent.text
                    color: Theme.textPrimary
                    horizontalAlignment: Text.AlignHCenter
                    verticalAlignment: Text.AlignVCenter
                }
            }

            Button {
                text: spotifyProvider.playing ? "⏸" : "▶"
                onClicked: spotifyProvider.playing ? spotifyProvider.pause() : spotifyProvider.play()
                background: Rectangle {
                    implicitWidth: 50
                    implicitHeight: 50
                    radius: 25
                    color: Theme.spotifyWidget
                }
                contentItem: Text {
                    text: parent.text
                    color: Theme.textPrimary
                    font.pixelSize: Theme.fontSizeH4
                    horizontalAlignment: Text.AlignHCenter
                    verticalAlignment: Text.AlignVCenter
                }
            }

            Button {
                text: "⏭"
                onClicked: spotifyProvider.next()
                background: Rectangle {
                    implicitWidth: 40
                    implicitHeight: 40
                    radius: 20
                    color: Theme.alpha(Theme.textPrimary, 0.1)
                }
                contentItem: Text {
                    text: parent.text
                    color: Theme.textPrimary
                    horizontalAlignment: Text.AlignHCenter
                    verticalAlignment: Text.AlignVCenter
                }
            }
        }

        // Not authenticated message
        Text {
            anchors.horizontalCenter: parent.horizontalCenter
            text: "Not authenticated"
            font.pixelSize: Theme.fontSizeCaption
            color: Theme.textTertiary
            visible: !spotifyProvider.authenticated
        }
    }
}
