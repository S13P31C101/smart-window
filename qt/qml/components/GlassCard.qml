import QtQuick 2.15
import QtQuick.Effects
import "../styles"

Item {
    id: root

    property alias content: contentItem.children

    // Default size
    implicitWidth: 300
    implicitHeight: 200

    // ========================================================================
    // Glass background (backdrop blur effect)
    // ========================================================================

    Rectangle {
        id: glassBackground
        anchors.fill: parent
        radius: 24
        color: Theme.alpha("#ffffff", 0.10)
        border.color: Theme.alpha("#ffffff", 0.20)
        border.width: 1

        // Backdrop blur
        layer.enabled: true
        layer.effect: MultiEffect {
            blurEnabled: true
            blur: 1.0
            blurMax: 64

            shadowEnabled: true
            shadowColor: Theme.alpha("#000000", 0.15)
            shadowBlur: 0.8
            shadowVerticalOffset: 10
            shadowHorizontalOffset: 0
        }
    }

    // ========================================================================
    // Content container (no blur, sharp rendering)
    // ========================================================================

    Item {
        id: contentItem
        anchors.fill: parent
        anchors.margins: 24
        z: 10
    }
}
