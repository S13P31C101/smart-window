import QtQuick 2.15
import QtQuick.Controls 2.15
import QtQuick.Effects
import "../components"
import "../styles"

GlassCard {
    id: root

    width: 380
    height: 240

    // Spotify 그린 그라디언트 배경
    Rectangle {
        anchors.fill: parent
        radius: parent.radius
        gradient: Gradient {
            GradientStop { position: 0.0; color: Theme.alpha("#1DB954", 0.15) }
            GradientStop { position: 1.0; color: Theme.alpha("#1ed760", 0.08) }
        }
        opacity: spotifyProvider.authenticated ? 0.7 : 0.3
    }

    Column {
        anchors.fill: parent
        anchors.margins: Theme.paddingM
        spacing: Theme.spacingM

        // 헤더: Spotify 로고
        Row {
            width: parent.width
            spacing: Theme.spacingM

            Rectangle {
                width: 36
                height: 36
                radius: 18
                color: Theme.spotifyWidget

                Text {
                    anchors.centerIn: parent
                    text: "♫"
                    font.pixelSize: 20
                    font.weight: Theme.fontWeightBold
                    color: "white"
                }
            }

            Text {
                text: "Spotify"
                font.pixelSize: Theme.fontSizeH4
                font.weight: Theme.fontWeightBold
                color: Theme.spotifyWidget
                anchors.verticalCenter: parent.verticalCenter
            }

            Item { width: parent.width - 200 }

            // 재생 상태 인디케이터
            Rectangle {
                visible: spotifyProvider.authenticated && spotifyProvider.playing
                width: 6
                height: 6
                radius: 3
                color: Theme.spotifyWidget
                anchors.verticalCenter: parent.verticalCenter

                SequentialAnimation on opacity {
                    loops: Animation.Infinite
                    NumberAnimation { to: 1.0; duration: 600 }
                    NumberAnimation { to: 0.3; duration: 600 }
                }
            }
        }

        // 트랙 정보
        Column {
            width: parent.width
            spacing: Theme.spacingS
            visible: spotifyProvider.authenticated

            // 트랙명
            Text {
                width: parent.width
                text: spotifyProvider.trackName || "No track playing"
                font.pixelSize: Theme.fontSizeBodyLarge
                font.weight: Theme.fontWeightSemiBold
                color: Theme.textPrimary
                elide: Text.ElideRight
                maximumLineCount: 1
            }

            // 아티스트명
            Row {
                spacing: Theme.spacingS

                Text {
                    text: "🎤"
                    font.pixelSize: 14
                    opacity: 0.7
                    anchors.verticalCenter: parent.verticalCenter
                }

                Text {
                    width: root.width - 80
                    text: spotifyProvider.artistName || "-"
                    font.pixelSize: Theme.fontSizeCaption
                    font.weight: Theme.fontWeightRegular
                    color: Theme.textSecondary
                    elide: Text.ElideRight
                    anchors.verticalCenter: parent.verticalCenter
                }
            }
        }

        // 프로그레스 바
        Item {
            width: parent.width
            height: 24
            visible: spotifyProvider.authenticated && spotifyProvider.duration > 0

            // 시간 표시
            Row {
                width: parent.width

                Text {
                    text: formatTime(spotifyProvider.progress)
                    font.pixelSize: Theme.fontSizeSmall
                    color: Theme.textTertiary
                    font.weight: Theme.fontWeightMedium
                }

                Item { width: parent.width - 100 }

                Text {
                    text: formatTime(spotifyProvider.duration)
                    font.pixelSize: Theme.fontSizeSmall
                    color: Theme.textTertiary
                    font.weight: Theme.fontWeightMedium
                }
            }

            // 프로그레스 바
            Rectangle {
                anchors.bottom: parent.bottom
                width: parent.width
                height: 6
                radius: 3
                color: Theme.alpha(Theme.textPrimary, 0.15)

                Rectangle {
                    width: parent.width * (spotifyProvider.duration > 0 ? spotifyProvider.progress / spotifyProvider.duration : 0)
                    height: parent.height
                    radius: parent.radius
                    color: Theme.spotifyWidget

                    Behavior on width {
                        NumberAnimation { duration: 500; easing.type: Easing.OutCubic }
                    }
                }
            }
        }

        Item { height: Theme.spacingS }

        // 컨트롤 버튼
        Row {
            anchors.horizontalCenter: parent.horizontalCenter
            spacing: Theme.spacingL
            visible: spotifyProvider.authenticated

            // Previous 버튼
            Rectangle {
                width: 44
                height: 44
                radius: 22
                color: Theme.alpha(Theme.textPrimary, 0.12)
                border.color: Theme.alpha(Theme.textPrimary, 0.2)
                border.width: 1

                Text {
                    anchors.centerIn: parent
                    text: "⏮"
                    font.pixelSize: 20
                    color: Theme.textPrimary
                }

                MouseArea {
                    anchors.fill: parent
                    cursorShape: Qt.PointingHandCursor
                    onClicked: spotifyProvider.previous()
                    hoverEnabled: true
                    onEntered: parent.scale = 1.1
                    onExited: parent.scale = 1.0
                }

                Behavior on scale {
                    NumberAnimation { duration: 150; easing.type: Easing.OutCubic }
                }
            }

            // Play/Pause 버튼 (메인)
            Rectangle {
                width: 56
                height: 56
                radius: 28
                color: Theme.spotifyWidget

                layer.enabled: true
                layer.effect: MultiEffect {
                    shadowEnabled: true
                    shadowOpacity: 0.4
                    shadowBlur: 0.6
                    shadowColor: Theme.spotifyWidget
                }

                Text {
                    anchors.centerIn: parent
                    text: spotifyProvider.playing ? "⏸" : "▶"
                    font.pixelSize: 28
                    color: "white"
                }

                MouseArea {
                    anchors.fill: parent
                    cursorShape: Qt.PointingHandCursor
                    onClicked: spotifyProvider.playing ? spotifyProvider.pause() : spotifyProvider.play()
                    hoverEnabled: true
                    onEntered: parent.scale = 1.08
                    onExited: parent.scale = 1.0
                }

                Behavior on scale {
                    NumberAnimation { duration: 150; easing.type: Easing.OutCubic }
                }
            }

            // Next 버튼
            Rectangle {
                width: 44
                height: 44
                radius: 22
                color: Theme.alpha(Theme.textPrimary, 0.12)
                border.color: Theme.alpha(Theme.textPrimary, 0.2)
                border.width: 1

                Text {
                    anchors.centerIn: parent
                    text: "⏭"
                    font.pixelSize: 20
                    color: Theme.textPrimary
                }

                MouseArea {
                    anchors.fill: parent
                    cursorShape: Qt.PointingHandCursor
                    onClicked: spotifyProvider.next()
                    hoverEnabled: true
                    onEntered: parent.scale = 1.1
                    onExited: parent.scale = 1.0
                }

                Behavior on scale {
                    NumberAnimation { duration: 150; easing.type: Easing.OutCubic }
                }
            }
        }

        // 인증 안됨 메시지
        Column {
            anchors.horizontalCenter: parent.horizontalCenter
            spacing: Theme.spacingM
            visible: !spotifyProvider.authenticated

            Text {
                text: "🔐"
                font.pixelSize: 48
                opacity: 0.3
                anchors.horizontalCenter: parent.horizontalCenter
            }

            Text {
                text: "Not authenticated"
                font.pixelSize: Theme.fontSizeBody
                color: Theme.textTertiary
                font.weight: Theme.fontWeightMedium
                anchors.horizontalCenter: parent.horizontalCenter
            }

            Text {
                text: "Connect your Spotify account"
                font.pixelSize: Theme.fontSizeSmall
                color: Theme.textDisabled
                anchors.horizontalCenter: parent.horizontalCenter
            }
        }
    }

    // 시간 포맷팅 함수 (초 -> MM:SS)
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return mins + ":" + (secs < 10 ? "0" : "") + secs
    }
}
