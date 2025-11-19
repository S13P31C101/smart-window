pragma Singleton
import QtQuick 2.15
import Qt5Compat.GraphicalEffects

QtObject {
    id: effects

    // ========================================================================
    // Glass Morphism Effect
    // ========================================================================

    function createGlassEffect(target, blurRadius, borderOpacity) {
        // Blur background
        var blur = Qt.createQmlObject('
            import QtQuick 2.15
            import Qt5Compat.GraphicalEffects
            FastBlur {
                anchors.fill: parent
                source: parent
                radius: ' + (blurRadius || 40) + '
            }
        ', target, "glassBlur")

        return blur
    }

    // ========================================================================
    // Glow Effect
    // ========================================================================

    component GlowEffect: Glow {
        samples: 20
        radius: 8
        color: Theme.primary
        spread: 0.3
    }

    // ========================================================================
    // Drop Shadow Effect
    // ========================================================================

    component DropShadowEffect: DropShadow {
        samples: 20
        radius: Theme.shadowRadius
        horizontalOffset: 0
        verticalOffset: Theme.shadowOffsetY
        color: Theme.alpha(Theme.backgroundDark, Theme.shadowOpacity)
    }

    // ========================================================================
    // Inner Shadow (Neumorphism)
    // ========================================================================

    component InnerShadow: Item {
        property alias color: shadow.color
        property alias radius: shadow.radius
        property alias samples: shadow.samples

        layer.enabled: true
        layer.effect: InnerShadow {
            id: shadow
            samples: 16
            radius: 8
            horizontalOffset: 2
            verticalOffset: 2
            color: "#20000000"
        }
    }
}
