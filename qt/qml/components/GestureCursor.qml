import QtQuick 2.15
import QtQuick.Effects
import "../styles"

Item {
    id: root
    width: Theme.cursorSize
    height: Theme.cursorSize

    property string cursorState: "idle"  // idle, point, click

    // ========================================================================
    // Cursor Visual
    // ========================================================================

    Rectangle {
        id: cursorCircle
        anchors.centerIn: parent
        width: parent.width
        height: parent.height
        radius: width / 2

        color: {
            switch (root.cursorState) {
                case "click": return Theme.accent
                case "point": return Theme.primary
                default: return Theme.alpha(Theme.primary, 0.6)
            }
        }

        border.color: Theme.glassBorder
        border.width: 2

        // Pulse animation on click
        scale: root.cursorState === "click" ? 1.3 : 1.0

        Behavior on scale {
            SpringAnimation {
                spring: 3
                damping: 0.3
            }
        }

        Behavior on color {
            ColorAnimation {
                duration: Theme.animationFast
            }
        }

        // Inner dot
        Rectangle {
            anchors.centerIn: parent
            width: parent.width * 0.3
            height: parent.height * 0.3
            radius: width / 2
            color: Theme.textPrimary
            opacity: 0.8
        }

        // Glow effect
        layer.enabled: true
        layer.effect: MultiEffect {
            shadowEnabled: true
            shadowColor: cursorCircle.color
            shadowBlur: 0.8
            shadowScale: 1.2
        }
    }

    // ========================================================================
    // Ripple effect on click
    // ========================================================================

    Repeater {
        model: root.cursorState === "click" ? 1 : 0

        Rectangle {
            anchors.centerIn: parent
            width: Theme.cursorSize
            height: Theme.cursorSize
            radius: width / 2
            color: "transparent"
            border.color: Theme.accent
            border.width: 2
            opacity: 0

            SequentialAnimation on opacity {
                running: true
                NumberAnimation { to: 1; duration: 100 }
                NumberAnimation { to: 0; duration: 400 }
            }

            NumberAnimation on width {
                running: true
                to: Theme.cursorSize * 2
                duration: 500
            }

            NumberAnimation on height {
                running: true
                to: Theme.cursorSize * 2
                duration: 500
            }
        }
    }

    // ========================================================================
    // Trail effect
    // ========================================================================

    Canvas {
        id: trailCanvas
        anchors.fill: parent
        opacity: 0.3

        property var points: []
        property int maxPoints: 10

        function addPoint(x, y) {
            points.push({x: x, y: y})
            if (points.length > maxPoints) {
                points.shift()
            }
            requestPaint()
        }

        onPaint: {
            var ctx = getContext("2d")
            ctx.clearRect(0, 0, width, height)

            if (points.length < 2) return

            ctx.strokeStyle = Theme.primary
            ctx.lineWidth = 3
            ctx.lineCap = "round"
            ctx.lineJoin = "round"

            ctx.beginPath()
            ctx.moveTo(points[0].x, points[0].y)

            for (var i = 1; i < points.length; i++) {
                var opacity = i / points.length
                ctx.globalAlpha = opacity
                ctx.lineTo(points[i].x, points[i].y)
            }

            ctx.stroke()
        }

        Timer {
            interval: 50
            running: true
            repeat: true
            onTriggered: {
                trailCanvas.addPoint(
                    cursorCircle.x + cursorCircle.width / 2,
                    cursorCircle.y + cursorCircle.height / 2
                )
            }
        }
    }
}
