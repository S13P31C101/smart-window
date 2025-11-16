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

    // Centered message
    Column {
        anchors.centerIn: parent
        spacing: Theme.spacingXl

        Text {
            anchors.horizontalCenter: parent.horizontalCenter
            text: "🔒"
            font.pixelSize: 120
        }

        Text {
            anchors.horizontalCenter: parent.horizontalCenter
            text: "Privacy Mode Active"
            font.pixelSize: Theme.fontSizeH2
            font.weight: Theme.fontWeightBold
            color: Theme.textPrimary
        }

        Text {
            anchors.horizontalCenter: parent.horizontalCenter
            text: "No content displayed for privacy"
            font.pixelSize: Theme.fontSizeBody
            color: Theme.textSecondary
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
