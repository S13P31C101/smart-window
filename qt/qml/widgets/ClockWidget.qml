import QtQuick 2.15
import QtQuick.Window 2.15
import QtQuick.Effects
import "../components"
import "../styles"

Item {
    id: root

    width: Window.window ? Window.window.width * 0.55 : 600
    height: Window.window ? Window.window.height * 0.0625 : 120

    Column {
        anchors.centerIn: parent
        spacing: Window.window ? Window.window.height * 0.004 : 8

        // 메인 시계 (분 단위까지만)
        Text {
            id: timeDisplay
            anchors.horizontalCenter: parent.horizontalCenter
            text: Qt.formatTime(new Date(), "HH:mm")
            font.pixelSize: Window.window ? Window.window.width * 0.089 : 96
            font.weight: Font.Bold
            color: Theme.alpha("#ffffff", 1.0)
            font.letterSpacing: Window.window ? -Window.window.width * 0.003 : -3

            Timer {
                interval: 1000
                running: true
                repeat: true
                onTriggered: {
                    timeDisplay.text = Qt.formatTime(new Date(), "HH:mm")
                }
            }

            Behavior on text {
                SequentialAnimation {
                    NumberAnimation {
                        target: timeDisplay
                        property: "opacity"
                        to: 0.7
                        duration: 150
                    }
                    NumberAnimation {
                        target: timeDisplay
                        property: "opacity"
                        to: 1.0
                        duration: 150
                    }
                }
            }
        }

        // 날짜 정보
        Text {
            anchors.horizontalCenter: parent.horizontalCenter
            text: clockProvider.dayOfWeek + " · " + clockProvider.dateString
            font.pixelSize: Window.window ? Window.window.width * 0.015 : 16
            font.weight: Theme.fontWeightMedium
            color: Theme.alpha("#ffffff", 0.80)
        }
    }
}
