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

    // Back button
    Button {
        anchors.top: parent.top
        anchors.left: parent.left
        anchors.margins: Theme.spacingL
        text: "← Menu"
        onClicked: router.navigateTo("menu")

        background: Rectangle {
            implicitWidth: 100
            implicitHeight: 40
            radius: Theme.radiusM
            color: Theme.backgroundLight
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
