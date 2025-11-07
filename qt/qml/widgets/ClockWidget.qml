import QtQuick 2.15
import QtQuick.Effects
import "../components"
import "../styles"

GlassCard {
    id: root

    width: 320
    height: 200

    Column {
        anchors.fill: parent
        spacing: 12

        // 헤더 - 시간대 정보
        Row {
            spacing: 10

            Rectangle {
                width: 36
                height: 36
                radius: 10
                color: Theme.alpha("#ffffff", 0.10)
                border.color: Theme.alpha("#ffffff", 0.20)
                border.width: 1

                Text {
                    anchors.centerIn: parent
                    text: getPeriodIcon()
                    font.pixelSize: 18
                }
            }

            Column {
                anchors.verticalCenter: parent.verticalCenter
                spacing: 1

                Text {
                    text: clockProvider.period
                    font.pixelSize: 15
                    font.weight: Theme.fontWeightMedium
                    color: Theme.alpha("#ffffff", 0.90)
                }

                Text {
                    text: "Active"
                    font.pixelSize: 11
                    color: Theme.alpha("#ffffff", 0.60)
                }
            }
        }

        // 메인 시계 (분 단위까지만)
        Column {
            anchors.horizontalCenter: parent.horizontalCenter
            spacing: 4

            Text {
                id: timeDisplay
                anchors.horizontalCenter: parent.horizontalCenter
                text: Qt.formatTime(new Date(), "HH:mm")
                font.pixelSize: 72
                font.weight: Font.ExtraLight
                color: Theme.alpha("#ffffff", 0.95)
                font.letterSpacing: -2

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

            Text {
                anchors.horizontalCenter: parent.horizontalCenter
                text: clockProvider.dayOfWeek + " · " + clockProvider.dateString
                font.pixelSize: 13
                color: Theme.alpha("#ffffff", 0.70)
            }
        }
    }

    // 시간대별 아이콘 반환
    function getPeriodIcon() {
        const period = clockProvider.period.toLowerCase()
        if (period.includes("morning")) return "🌅"
        if (period.includes("afternoon")) return "☀️"
        if (period.includes("evening")) return "🌆"
        if (period.includes("night")) return "🌙"
        return "⏰"
    }
}
