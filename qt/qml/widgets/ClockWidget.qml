import QtQuick 2.15
import "../components"
import "../styles"

GlassCard {
    id: root

    width: 300
    height: 200

    Column {
        anchors.centerIn: parent
        spacing: Theme.spacingM

        // Time
        Text {
            anchors.horizontalCenter: parent.horizontalCenter
            text: clockProvider.timeString
            font.pixelSize: Theme.fontSizeH1
            font.weight: Theme.fontWeightBold
            color: Theme.textPrimary
        }

        // Date
        Text {
            anchors.horizontalCenter: parent.horizontalCenter
            text: clockProvider.dayOfWeek + ", " + clockProvider.dateString
            font.pixelSize: Theme.fontSizeBody
            color: Theme.textSecondary
        }

        // Period
        Text {
            anchors.horizontalCenter: parent.horizontalCenter
            text: clockProvider.period
            font.pixelSize: Theme.fontSizeCaption
            font.weight: Theme.fontWeightMedium
            color: Theme.primary
        }
    }
}
