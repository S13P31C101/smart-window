import QtQuick 2.15
import QtQuick.Controls 2.15
import "../components"
import "../widgets"
import "../styles"

Item {
    id: root

    // Transparent glass effect background
    Rectangle {
        anchors.fill: parent
        color: Theme.alpha(Theme.glassBackground, 0.1)
    }

    // Minimal widgets display
    Row {
        anchors.horizontalCenter: parent.horizontalCenter
        anchors.bottom: parent.bottom
        anchors.bottomMargin: Theme.spacingXl
        spacing: Theme.spacingL

        ClockWidget {
            scale: 0.8
        }

        WeatherWidget {
            scale: 0.8
        }
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
            glassOpacity: 0.1
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
