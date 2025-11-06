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

    // Widget container (draggable widgets)
    Item {
        id: widgetContainer
        anchors.fill: parent
        anchors.margins: Theme.spacingL

        // Clock widget
        ClockWidget {
            id: clockWidget
            x: 100
            y: 100
            visible: widgetRegistry.isWidgetActive("clock")
        }

        // Weather widget
        WeatherWidget {
            id: weatherWidget
            x: parent.width - width - 100
            y: 100
            visible: widgetRegistry.isWidgetActive("weather")
        }

        // Spotify widget
        SpotifyWidget {
            id: spotifyWidget
            x: 100
            y: parent.height - height - 100
            visible: widgetRegistry.isWidgetActive("spotify")
        }
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
