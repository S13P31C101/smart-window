import QtQuick 2.15
import QtQuick.Effects

/**
 * GestureControlledUI - A wrapper component that shows/hides UI based on gesture detection
 *
 * This component automatically shows its children when hand gestures are detected
 * and hides them when no gestures are detected, perfect for touch-free interfaces.
 *
 * Features:
 * - Automatic show/hide based on gestureBridge.handDetected
 * - Smooth fade in/out animations
 * - Configurable fade duration
 * - Optional glow effect for better visibility
 *
 * Usage:
 *   GestureControlledUI {
 *       MinimalButton {
 *           text: "← Menu"
 *           onClicked: router.navigateTo("menu")
 *       }
 *   }
 */
Item {
    id: root

    // Make children the default property
    default property alias contents: container.data

    // Custom properties
    property int fadeDuration: 300  // Duration of fade in/out animation in ms
    property bool enableGlow: true   // Enable glow effect for better visibility

    // Size to fit children
    width: container.childrenRect.width
    height: container.childrenRect.height

    // Visibility based on gesture detection
    visible: opacity > 0
    opacity: (typeof gestureBridge !== 'undefined' && gestureBridge.handDetected) ? 1.0 : 0.0

    Behavior on opacity {
        NumberAnimation {
            duration: root.fadeDuration
            easing.type: Easing.InOutQuad
        }
    }

    // Container for children
    Item {
        id: container
        anchors.fill: parent

        // Optional glow effect for better visibility
        layer.enabled: root.enableGlow
        layer.effect: MultiEffect {
            shadowEnabled: true
            shadowOpacity: 0.25
            shadowBlur: 0.6
            shadowColor: "#000000"
        }
    }
}
