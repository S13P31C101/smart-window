import QtQuick 2.15
import QtQuick.Effects
import "../styles"

Rectangle {
    id: root

    property alias content: contentItem.children
    property real glassOpacity: 0.2

    color: Theme.alpha(Theme.glassBackground, glassOpacity)
    radius: Theme.radiusL
    border.color: Theme.glassBorder
    border.width: Theme.borderWidthThin

    // Default size
    implicitWidth: 300
    implicitHeight: 200

    // ========================================================================
    // Glass effect with blur
    // ========================================================================

    layer.enabled: true
    layer.effect: MultiEffect {
        blurEnabled: true
        blur: 0.5
        blurMax: 32

        shadowEnabled: true
        shadowColor: Theme.alpha(Theme.backgroundDark, 0.3)
        shadowBlur: 0.5
        shadowVerticalOffset: 8
    }

    // ========================================================================
    // Highlight on hover (if interactive)
    // ========================================================================

    Rectangle {
        id: highlight
        anchors.fill: parent
        radius: parent.radius
        color: Theme.alpha(Theme.textPrimary, 0.05)
        opacity: 0

        Behavior on opacity {
            NumberAnimation { duration: Theme.animationFast }
        }
    }

    MouseArea {
        anchors.fill: parent
        hoverEnabled: true
        propagateComposedEvents: true

        onEntered: highlight.opacity = 1
        onExited: highlight.opacity = 0
        onPressed: mouse.accepted = false
    }

    // ========================================================================
    // Content container
    // ========================================================================

    Item {
        id: contentItem
        anchors.fill: parent
        anchors.margins: Theme.paddingM
    }
}
