import QtQuick 2.15
import QtQuick.Window 2.15
import QtQuick.Controls 2.15
import QtQuick.Layouts
import QtQuick.Effects
import "../components"
import "../styles"

GlassCard {
    id: root

    width: Window.window ? Window.window.width * 0.352 : 380
    height: Window.window ? Window.window.height * 0.125 : 240

    // 깔끔한 어두운 배경
    Rectangle {
        anchors.fill: parent
        radius: parent.radius
        color: Theme.alpha("#0a0e1a", 0.7)
        border.color: Theme.alpha("#ffffff", 0.1)
        border.width: 1
    }

    Column {
        anchors.fill: parent
        anchors.margins: Theme.paddingM
        spacing: Theme.spacingM

        // 헤더: Spotify 로고
        Row {
            width: parent.width
            spacing: Theme.spacingS

            Text {
                text: "♫"
                font.pixelSize: Window.window ? Window.window.width * 0.022 : 24
                font.weight: Theme.fontWeightBold
                color: "#1DB954"
                anchors.verticalCenter: parent.verticalCenter
            }

            Text {
                text: "Spotify"
                font.pixelSize: Window.window ? Window.window.width * 0.0148 : 16
                font.weight: Theme.fontWeightBold
                color: "#ffffff"
                anchors.verticalCenter: parent.verticalCenter
                opacity: 0.9
            }

            Item { Layout.fillWidth: true; width: parent.width - (Window.window ? Window.window.width * 0.185 : 200) }

            // 재생 상태 인디케이터
            Row {
                visible: spotifyProvider.authenticated && spotifyProvider.playing
                spacing: 4
                anchors.verticalCenter: parent.verticalCenter

                Rectangle {
                    width: 3
                    height: 12
                    radius: 1.5
                    color: "#1DB954"
                    SequentialAnimation on height {
                        loops: Animation.Infinite
                        NumberAnimation { to: 16; duration: 400; easing.type: Easing.InOutSine }
                        NumberAnimation { to: 8; duration: 400; easing.type: Easing.InOutSine }
                    }
                }
                Rectangle {
                    width: 3
                    height: 16
                    radius: 1.5
                    color: "#1DB954"
                    SequentialAnimation on height {
                        loops: Animation.Infinite
                        NumberAnimation { to: 8; duration: 500; easing.type: Easing.InOutSine }
                        NumberAnimation { to: 16; duration: 500; easing.type: Easing.InOutSine }
                    }
                }
                Rectangle {
                    width: 3
                    height: 10
                    radius: 1.5
                    color: "#1DB954"
                    SequentialAnimation on height {
                        loops: Animation.Infinite
                        NumberAnimation { to: 14; duration: 450; easing.type: Easing.InOutSine }
                        NumberAnimation { to: 10; duration: 450; easing.type: Easing.InOutSine }
                    }
                }
            }
        }

        // 트랙 정보
        Column {
            width: parent.width
            spacing: 6
            visible: spotifyProvider.authenticated

            // 트랙명
            Text {
                width: parent.width
                text: spotifyProvider.trackName || "No track playing"
                font.pixelSize: Window.window ? Window.window.width * 0.0148 : 16
                font.weight: Theme.fontWeightSemiBold
                color: "#ffffff"
                elide: Text.ElideRight
                maximumLineCount: 1
            }

            // 아티스트명
            Text {
                width: parent.width
                text: spotifyProvider.artistName || "-"
                font.pixelSize: Window.window ? Window.window.width * 0.0122 : 13
                font.weight: Theme.fontWeightRegular
                color: "#ffffff"
                opacity: 0.6
                elide: Text.ElideRight
            }
        }

        // 프로그레스 바
        Item {
            width: parent.width
            height: Window.window ? Window.window.height * 0.0125 : 24
            visible: spotifyProvider.authenticated && spotifyProvider.duration > 0

            // 프로그레스 바
            Rectangle {
                anchors.top: parent.top
                width: parent.width
                height: 4
                radius: 2
                color: Theme.alpha("#ffffff", 0.15)

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

            // 시간 표시
            Row {
                anchors.bottom: parent.bottom
                width: parent.width

                Text {
                    text: formatTime(spotifyProvider.progress)
                    font.pixelSize: Window.window ? Window.window.width * 0.01 : 11
                    color: "#ffffff"
                    opacity: 0.5
                    font.weight: Theme.fontWeightMedium
                }

                Item { width: parent.width - (Window.window ? Window.window.width * 0.093 : 100) }

                Text {
                    text: formatTime(spotifyProvider.duration)
                    font.pixelSize: Window.window ? Window.window.width * 0.01 : 11
                    color: "#ffffff"
                    opacity: 0.5
                    font.weight: Theme.fontWeightMedium
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
                width: Window.window ? Window.window.width * 0.0407 : 44
                height: Window.window ? Window.window.width * 0.0407 : 44
                radius: width / 2
                color: Theme.alpha(Theme.textPrimary, 0.12)
                border.color: Theme.alpha(Theme.textPrimary, 0.2)
                border.width: 1

                Text {
                    anchors.centerIn: parent
                    text: "⏮"
                    font.pixelSize: Window.window ? Window.window.width * 0.0185 : 20
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
                width: Window.window ? Window.window.width * 0.052 : 56
                height: Window.window ? Window.window.width * 0.052 : 56
                radius: width / 2
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
                    font.pixelSize: Window.window ? Window.window.width * 0.026 : 28
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
                width: Window.window ? Window.window.width * 0.0407 : 44
                height: Window.window ? Window.window.width * 0.0407 : 44
                radius: width / 2
                color: Theme.alpha(Theme.textPrimary, 0.12)
                border.color: Theme.alpha(Theme.textPrimary, 0.2)
                border.width: 1

                Text {
                    anchors.centerIn: parent
                    text: "⏭"
                    font.pixelSize: Window.window ? Window.window.width * 0.0185 : 20
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
            spacing: Theme.spacingS
            visible: !spotifyProvider.authenticated

            Text {
                text: "🔐"
                font.pixelSize: Window.window ? Window.window.width * 0.044 : 48
                opacity: 0.3
                anchors.horizontalCenter: parent.horizontalCenter
            }

            Text {
                text: "Spotify Not Connected"
                font.pixelSize: Window.window ? Window.window.width * 0.0148 : 16
                color: Theme.textTertiary
                font.weight: Theme.fontWeightMedium
                anchors.horizontalCenter: parent.horizontalCenter
            }

            // Step 1: Get Auth URL Button
            Rectangle {
                anchors.horizontalCenter: parent.horizontalCenter
                width: Window.window ? Window.window.width * 0.28 : 300
                height: Window.window ? Window.window.height * 0.022 : 42
                radius: height / 2
                color: Theme.spotifyWidget

                Text {
                    anchors.centerIn: parent
                    text: "1. Get Auth URL (Check Console)"
                    font.pixelSize: Window.window ? Window.window.width * 0.011 : 12
                    font.weight: Theme.fontWeightMedium
                    color: "white"
                }

                MouseArea {
                    anchors.fill: parent
                    cursorShape: Qt.PointingHandCursor
                    onClicked: {
                        console.log("\n" + "=".repeat(70))
                        console.log("🎵 SPOTIFY AUTHENTICATION")
                        console.log("=".repeat(70))
                        console.log("\n📋 Step 1: Open this URL in your browser:\n")
                        console.log(spotifyAuthHelper.authUrl)
                        console.log("\n📋 Step 2: Login and authorize the app")
                        console.log("📋 Step 3: Copy the 'code' from the redirect URL")
                        console.log("📋 Step 4: Paste the code below and click Submit\n")
                        console.log("=".repeat(70) + "\n")
                    }
                    hoverEnabled: true
                    onEntered: parent.scale = 1.03
                    onExited: parent.scale = 1.0
                }

                Behavior on scale {
                    NumberAnimation { duration: 150; easing.type: Easing.OutCubic }
                }
            }

            // Step 2: Code Input Field
            Rectangle {
                anchors.horizontalCenter: parent.horizontalCenter
                width: Window.window ? Window.window.width * 0.28 : 300
                height: Window.window ? Window.window.height * 0.022 : 42
                radius: Theme.radiusM
                color: Theme.alpha(Theme.textPrimary, 0.1)
                border.color: Theme.alpha(Theme.textPrimary, 0.3)
                border.width: 1

                TextInput {
                    id: authCodeInput
                    anchors.fill: parent
                    anchors.margins: 10
                    font.pixelSize: Window.window ? Window.window.width * 0.011 : 12
                    color: Theme.textPrimary
                    verticalAlignment: TextInput.AlignVCenter
                    text: ""

                    Text {
                        anchors.fill: parent
                        text: "2. Paste authorization code here..."
                        font.pixelSize: parent.font.pixelSize
                        color: Theme.textTertiary
                        opacity: 0.5
                        verticalAlignment: Text.AlignVCenter
                        visible: authCodeInput.text.length === 0
                    }
                }
            }

            // Step 3: Submit Button
            Rectangle {
                anchors.horizontalCenter: parent.horizontalCenter
                width: Window.window ? Window.window.width * 0.28 : 300
                height: Window.window ? Window.window.height * 0.022 : 42
                radius: height / 2
                color: authCodeInput.text.length > 0 ? Theme.spotifyWidget : Qt.rgba(0.88, 0.91, 0.94, 0.2)

                Text {
                    anchors.centerIn: parent
                    text: "3. Submit Code"
                    font.pixelSize: Window.window ? Window.window.width * 0.011 : 12
                    font.weight: Theme.fontWeightMedium
                    color: "white"
                }

                MouseArea {
                    anchors.fill: parent
                    enabled: authCodeInput.text.length > 0
                    cursorShape: enabled ? Qt.PointingHandCursor : Qt.ArrowCursor
                    onClicked: {
                        console.log("Submitting authorization code...")
                        spotifyAuthHelper.handleCallback(authCodeInput.text.trim())
                        authCodeInput.text = ""
                    }
                    hoverEnabled: true
                    onEntered: if (enabled) parent.scale = 1.03
                    onExited: parent.scale = 1.0
                }

                Behavior on scale {
                    NumberAnimation { duration: 150; easing.type: Easing.OutCubic }
                }
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
