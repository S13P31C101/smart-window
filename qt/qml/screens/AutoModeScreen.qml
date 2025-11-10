import QtQuick 2.15
import QtQuick.Controls 2.15
import "../components"
import "../widgets"
import "../styles"

Item {
    id: root

    property string currentPeriod: clockProvider.period

    // Dynamic background based on time
    Rectangle {
        anchors.fill: parent
        gradient: Gradient {
            GradientStop {
                position: 0.0
                color: {
                    switch (currentPeriod) {
                        case "Morning": return "#FDB372"
                        case "Afternoon": return "#60A5FA"
                        case "Evening": return "#F472B6"
                        case "Night": return "#1E293B"
                        default: return Theme.backgroundDark
                    }
                }
            }
            GradientStop { position: 1.0; color: Theme.backgroundDark }
        }
        opacity: 0.3
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
}
