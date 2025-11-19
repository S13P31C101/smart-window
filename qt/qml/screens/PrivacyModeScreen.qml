import QtQuick 2.15
import QtQuick.Controls 2.15
import "../components"
import "../styles"

Item {
    id: root

    // Opaque background for privacy
    Rectangle {
        anchors.fill: parent
        color: Theme.backgroundDark
    }

    // Main content area
    Column {
        anchors.centerIn: parent
        width: Math.min(parent.width * 0.6, 600)
        spacing: 40

        // Privacy Mode Header
        Column {
            anchors.horizontalCenter: parent.horizontalCenter
            spacing: Theme.spacingLg

            Text {
                anchors.horizontalCenter: parent.horizontalCenter
                text: "🔑"
                font.pixelSize: 80
            }

            Text {
                anchors.horizontalCenter: parent.horizontalCenter
                text: "Privacy Mode"
                font.pixelSize: Theme.fontSizeH2
                font.weight: Theme.fontWeightBold
                color: Theme.textPrimary
            }

            Text {
                anchors.horizontalCenter: parent.horizontalCenter
                text: "Audio playback only - no visual content"
                font.pixelSize: Theme.fontSizeBody
                color: Theme.textSecondary
            }
        }
    }

    // Back button - Gesture controlled and vertically centered
    GestureControlledUI {
        anchors.left: root.left
        anchors.verticalCenter: root.verticalCenter
        anchors.margins: root.width * 0.03

        MinimalButton {
            text: "← Menu"
            implicitWidth: root.width * 0.12
            implicitHeight: root.height * 0.055
            buttonRadius: 28
            onClicked: router.navigateTo("menu")
        }
    }
}
