import QtQuick 2.15
import QtQuick.Controls 2.15
import "../styles"

Item {
    id: root

    property var menuItems: []
    property real menuRadius: 150

    signal itemClicked(int index, string itemId)

    width: menuRadius * 3
    height: menuRadius * 3

    // ========================================================================
    // Center button
    // ========================================================================

    Rectangle {
        id: centerButton
        anchors.centerIn: parent
        width: 80
        height: 80
        radius: width / 2

        color: Theme.primary
        border.color: Theme.primaryLight
        border.width: 2

        Text {
            anchors.centerIn: parent
            text: "Lumiscape"
            font.pixelSize: Theme.fontSizeSmall
            font.weight: Theme.fontWeightBold
            color: Theme.textPrimary
        }

        MouseArea {
            anchors.fill: parent
            onClicked: {
                console.log("Center button clicked")
            }
        }
    }

    // ========================================================================
    // Radial menu items
    // ========================================================================

    Repeater {
        model: menuItems

        Rectangle {
            id: menuItem

            property real angle: (360 / menuItems.length) * index - 90
            property real radian: angle * Math.PI / 180

            x: parent.width / 2 + Math.cos(radian) * menuRadius - width / 2
            y: parent.height / 2 + Math.sin(radian) * menuRadius - height / 2

            width: 100
            height: 100
            radius: Theme.radiusM

            color: Theme.alpha(Theme.glassBackground, 0.3)
            border.color: Theme.glassBorder
            border.width: 1

            // Content
            Column {
                anchors.centerIn: parent
                spacing: Theme.spacingS

                Text {
                    anchors.horizontalCenter: parent.horizontalCenter
                    text: modelData.icon || "●"
                    font.pixelSize: Theme.fontSizeH4
                    color: Theme.primary
                }

                Text {
                    anchors.horizontalCenter: parent.horizontalCenter
                    text: modelData.label || ""
                    font.pixelSize: Theme.fontSizeCaption
                    color: Theme.textPrimary
                }
            }

            // Interaction
            MouseArea {
                anchors.fill: parent
                hoverEnabled: true

                onEntered: {
                    menuItem.scale = 1.1
                    menuItem.color = Theme.alpha(Theme.primary, 0.3)
                }

                onExited: {
                    menuItem.scale = 1.0
                    menuItem.color = Theme.alpha(Theme.glassBackground, 0.3)
                }

                onClicked: {
                    root.itemClicked(index, modelData.id || "")
                }
            }

            Behavior on scale {
                SpringAnimation {
                    spring: 3
                    damping: 0.4
                }
            }

            Behavior on color {
                ColorAnimation { duration: Theme.animationFast }
            }

            // Initial animation
            opacity: 0
            scale: 0

            Component.onCompleted: {
                var delay = index * 50
                Qt.callLater(function() {
                    fadeIn.start()
                })
            }

            SequentialAnimation {
                id: fadeIn
                PauseAnimation { duration: index * 50 }
                ParallelAnimation {
                    NumberAnimation { target: menuItem; property: "opacity"; to: 1; duration: Theme.animationNormal }
                    NumberAnimation { target: menuItem; property: "scale"; to: 1; duration: Theme.animationNormal; easing.type: Easing.OutBack }
                }
            }
        }
    }
}
