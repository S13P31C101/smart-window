import QtQuick 2.15
import QtQuick.Effects
import "../styles"

Item {
    id: root

    property color glowColor: Theme.primary
    property real intensity: 0.5

    // ========================================================================
    // Glow circles
    // ========================================================================

    Repeater {
        model: 3

        Rectangle {
            id: glowCircle
            anchors.centerIn: parent
            width: root.width * (0.4 + index * 0.2)
            height: width
            radius: width / 2
            color: "transparent"

            border.color: Theme.alpha(root.glowColor, 0.1 * root.intensity)
            border.width: 40

            opacity: 0.5

            // Pulsing animation
            SequentialAnimation on scale {
                loops: Animation.Infinite
                running: true

                NumberAnimation {
                    from: 1.0
                    to: 1.2
                    duration: 3000 + index * 500
                    easing.type: Easing.InOutQuad
                }
                NumberAnimation {
                    from: 1.2
                    to: 1.0
                    duration: 3000 + index * 500
                    easing.type: Easing.InOutQuad
                }
            }

            // Rotation animation
            RotationAnimation on rotation {
                from: 0
                to: 360
                duration: 20000 + index * 5000
                loops: Animation.Infinite
                running: true
            }

            // Blur effect
            layer.enabled: true
            layer.effect: MultiEffect {
                blurEnabled: true
                blur: 1.0
                blurMax: 64
            }
        }
    }
}
