import QtQuick 2.15
import QtQuick.Controls 2.15
import QtQuick.Effects
import "../styles"

Button {
    id: control

    // Custom properties
    property color buttonColor: "#40FFFFFF"  // 25% opacity white
    property color borderColor: "#40000000"  // 25% opacity black (subtle border)
    property color hoverColor: "#59FFFFFF"   // 35% opacity white
    property color textColor: "#000000"
    property real buttonRadius: 20
    property bool enableShadow: true

    // Gesture interaction properties
    property bool gestureHovered: false
    property bool gestureEnabled: true

    implicitWidth: 100
    implicitHeight: 40

    background: Rectangle {
        radius: control.buttonRadius
        color: (control.hovered || control.gestureHovered) ? control.hoverColor : control.buttonColor
        border.color: control.borderColor
        border.width: 1.5

        layer.enabled: control.enableShadow
        layer.effect: MultiEffect {
            shadowEnabled: true
            shadowOpacity: 0.15
            shadowBlur: 0.4
            shadowColor: "#000000"
        }

        Behavior on color {
            ColorAnimation { duration: 200 }
        }
    }

    contentItem: Text {
        text: control.text
        color: control.textColor
        font.pixelSize: Math.min(22, Math.max(14, control.height * 0.35))  // Responsive: 35% of button height, min 14px, max 22px
        font.weight: Font.Bold
        horizontalAlignment: Text.AlignHCenter
        verticalAlignment: Text.AlignVCenter
    }

    // Hover cursor
    MouseArea {
        anchors.fill: parent
        cursorShape: Qt.PointingHandCursor
        onPressed: mouse.accepted = false
    }

    // Scale animation on hover (mouse or gesture)
    scale: (control.hovered || control.gestureHovered) ? 1.05 : 1.0
    Behavior on scale {
        NumberAnimation { duration: 200; easing.type: Easing.OutCubic }
    }

    // ====== Gesture Interaction ======

    // Timer to check gesture cursor position
    Timer {
        id: gestureCheckTimer
        interval: 50  // Check every 50ms for smooth interaction
        running: control.gestureEnabled &&
                 typeof gestureBridge !== 'undefined' &&
                 gestureBridge.handDetected
        repeat: true

        onTriggered: {
            if (!gestureBridge || !gestureBridge.handDetected) {
                control.gestureHovered = false
                return
            }

            // Get cursor position in screen coordinates (normalized 0-1)
            var cursorX = gestureBridge.cursorX
            var cursorY = gestureBridge.cursorY

            // Get window/screen size
            var windowItem = control.Window.window
            if (!windowItem) {
                return
            }

            var screenWidth = windowItem.width
            var screenHeight = windowItem.height

            // Convert cursor position to screen pixels
            var cursorScreenX = cursorX * screenWidth
            var cursorScreenY = cursorY * screenHeight

            // Get button's global position and bounds
            var buttonPos = control.mapToItem(null, 0, 0)
            var buttonLeft = buttonPos.x
            var buttonTop = buttonPos.y
            var buttonRight = buttonLeft + control.width
            var buttonBottom = buttonTop + control.height

            // Check if cursor is within button bounds
            var isInside = (cursorScreenX >= buttonLeft &&
                          cursorScreenX <= buttonRight &&
                          cursorScreenY >= buttonTop &&
                          cursorScreenY <= buttonBottom)

            control.gestureHovered = isInside
        }
    }

    // Listen for gesture click (fist)
    Connections {
        target: typeof gestureBridge !== 'undefined' ? gestureBridge : null
        enabled: control.gestureEnabled

        function onFistDetected() {
            if (control.gestureHovered && control.enabled) {
                console.log("Gesture click on button:", control.text)
                control.clicked()
            }
        }
    }
}
