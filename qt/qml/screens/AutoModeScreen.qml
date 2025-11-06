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

    // Recommended content
    Column {
        anchors.centerIn: parent
        spacing: Theme.spacingXl

        Text {
            anchors.horizontalCenter: parent.horizontalCenter
            text: "✨"
            font.pixelSize: 80
        }

        Text {
            anchors.horizontalCenter: parent.horizontalCenter
            text: "Good " + currentPeriod
            font.pixelSize: Theme.fontSizeH2
            font.weight: Theme.fontWeightBold
            color: Theme.textPrimary
        }

        Text {
            anchors.horizontalCenter: parent.horizontalCenter
            text: "Auto-recommended based on time and weather"
            font.pixelSize: Theme.fontSizeBody
            color: Theme.textSecondary
        }

        // Widgets grid
        Grid {
            anchors.horizontalCenter: parent.horizontalCenter
            columns: 2
            spacing: Theme.spacingL

            ClockWidget {}
            WeatherWidget {}
            SpotifyWidget { visible: spotifyProvider.authenticated }
            QuoteWidget {}
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
