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

        // City
        Text {
            anchors.horizontalCenter: parent.horizontalCenter
            text: weatherProvider.city
            font.pixelSize: Theme.fontSizeH4
            font.weight: Theme.fontWeightMedium
            color: Theme.textPrimary
        }

        // Temperature
        Text {
            anchors.horizontalCenter: parent.horizontalCenter
            text: weatherProvider.temperature
            font.pixelSize: Theme.fontSizeH1
            font.weight: Theme.fontWeightBold
            color: Theme.textPrimary
        }

        // Condition
        Row {
            anchors.horizontalCenter: parent.horizontalCenter
            spacing: Theme.spacingS

            Text {
                text: getWeatherIcon(weatherProvider.condition)
                font.pixelSize: Theme.fontSizeH4
            }

            Text {
                text: weatherProvider.condition
                font.pixelSize: Theme.fontSizeBody
                color: Theme.textSecondary
            }
        }

        // Additional info
        Row {
            anchors.horizontalCenter: parent.horizontalCenter
            spacing: Theme.spacingL

            Text {
                text: "💧 " + weatherProvider.humidity + "%"
                font.pixelSize: Theme.fontSizeCaption
                color: Theme.textSecondary
            }

            Text {
                text: "💨 " + weatherProvider.windSpeed.toFixed(1) + " m/s"
                font.pixelSize: Theme.fontSizeCaption
                color: Theme.textSecondary
            }
        }

        // Loading indicator
        Text {
            anchors.horizontalCenter: parent.horizontalCenter
            text: "Loading..."
            font.pixelSize: Theme.fontSizeCaption
            color: Theme.textTertiary
            visible: weatherProvider.loading
        }

        // Error message
        Text {
            anchors.horizontalCenter: parent.horizontalCenter
            text: weatherProvider.error
            font.pixelSize: Theme.fontSizeCaption
            color: Theme.error
            visible: weatherProvider.error !== ""
        }
    }

    function getWeatherIcon(condition) {
        switch (condition.toLowerCase()) {
            case "clear": return "☀️"
            case "clouds": return "☁️"
            case "rain": return "🌧️"
            case "snow": return "❄️"
            case "thunderstorm": return "⛈️"
            default: return "🌤️"
        }
    }
}
