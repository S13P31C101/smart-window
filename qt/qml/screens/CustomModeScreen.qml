import QtQuick 2.15
import QtQuick.Controls 2.15
import "../components"
import "../widgets"
import "../styles"

Item {
    id: root

    // Background
    Rectangle {
        anchors.fill: parent
        color: "transparent"
    }

    // ====== 중앙 상단 위젯 영역 ======
    Column {
        id: topWidgets
        anchors.horizontalCenter: parent.horizontalCenter
        anchors.top: parent.top
        anchors.topMargin: parent.height * 0.12
        spacing: 20

        // 시계 위젯
        ClockWidget {
            id: clockWidget
            anchors.horizontalCenter: parent.horizontalCenter
            visible: widgetRegistry.isWidgetActive("clock")
        }

        // 날씨 위젯
        WeatherWidget {
            id: weatherWidget
            anchors.horizontalCenter: parent.horizontalCenter
            visible: widgetRegistry.isWidgetActive("weather")
        }

        // 명언 위젯 (날씨 바로 밑)
        QuoteWidget {
            id: quoteWidget
            anchors.horizontalCenter: parent.horizontalCenter
            visible: widgetRegistry.isWidgetActive("quote")
        }
    }

    // ====== 하단 위젯 영역 (Spotify 중앙) ======
    SpotifyWidget {
        id: spotifyWidget
        anchors.horizontalCenter: parent.horizontalCenter
        anchors.bottom: parent.bottom
        anchors.bottomMargin: parent.height * 0.08
        visible: widgetRegistry.isWidgetActive("spotify")
    }

    // Header with back button
    Row {
        anchors.top: parent.top
        anchors.left: parent.left
        anchors.margins: Theme.spacingL
        spacing: Theme.spacingM

        Button {
            text: "← Back"
            onClicked: router.goBack()

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

        Text {
            anchors.verticalCenter: parent.verticalCenter
            text: "Custom Mode"
            font.pixelSize: Theme.fontSizeH3
            font.weight: Theme.fontWeightBold
            color: Theme.textPrimary
        }
    }
}
