import QtQuick 2.15
import QtQuick.Controls 2.15
import QtQuick.Controls.Material 2.15
import QtQuick.Window 2.15
import "screens"
import "components"
import "styles"

ApplicationWindow {
    id: root
    visible: true
    width: 1080
    height: 1920
    title: "Lumiscape"

    // Use Material style with dark theme
    Material.theme: Material.Dark

    // ========================================================================
    // Background
    // ========================================================================

    background: Rectangle {
        color: "#020617"  // slate-950
    }

    // ========================================================================
    // Screen Container with Router
    // ========================================================================

    Loader {
        id: screenLoader
        anchors.fill: parent
        asynchronous: false

        // Load screen based on router
        source: {
            switch (router.currentScreen) {
                case "loading": return "screens/LoadingScreen.qml"
                case "menu": return "screens/MenuScreen.qml"
                case "custom": return "screens/CustomModeScreen.qml"
                case "glass": return "screens/GlassModeScreen.qml"
                case "privacy": return "screens/PrivacyModeScreen.qml"
                case "auto": return "screens/AutoModeScreen.qml"
                case "standby": return "screens/StandbyScreen.qml"
                case "alarm": return "screens/AlarmScreen.qml"
                default: return "screens/LoadingScreen.qml"
            }
        }
    }

    // LoadingScreen complete signal 연결
    Connections {
        target: screenLoader.item
        ignoreUnknownSignals: true
        function onComplete() {
            console.log("Loading complete, navigating to menu")
            router.navigateTo("menu")
        }
    }

    // ========================================================================
    // Gesture Cursor Overlay (자동 숨김 기능)
    // ========================================================================

    GestureCursor {
        id: gestureCursor
        z: 1000  // Ensure cursor is always on top

        // Show cursor when hand is detected in the 4 modes (Auto, Privacy, Glass, Custom)
        visible: gestureBridge.handDetected &&
                 appConfig.gestureEnabled &&
                 router.currentScreen !== "menu" &&
                 router.currentScreen !== "loading" &&
                 router.currentScreen !== "standby"

        x: gestureBridge.cursorX * parent.width - width / 2
        y: gestureBridge.cursorY * parent.height - height / 2

        cursorState: {
            if (gestureBridge.isFist) return "click"
            if (gestureBridge.isPointing) return "point"
            return "idle"
        }

        Behavior on x {
            SmoothedAnimation {
                velocity: 1500
            }
        }

        Behavior on y {
            SmoothedAnimation {
                velocity: 1500
            }
        }

        Behavior on opacity {
            NumberAnimation { duration: 300 }
        }
    }

    // ========================================================================
    // Global Keyboard Shortcuts
    // ========================================================================

    Shortcut {
        sequence: "Esc"
        onActivated: {
            if (router.canGoBack) {
                router.goBack()
            }
        }
    }

    Shortcut {
        sequence: "Ctrl+M"
        onActivated: router.navigateTo("menu")
    }

    Shortcut {
        sequence: "F11"
        onActivated: {
            if (root.visibility === Window.FullScreen) {
                root.showNormal()
            } else {
                root.showFullScreen()
            }
        }
    }

    // ========================================================================
    // Status Bar (Debug - Hide in production)
    // ========================================================================

    Rectangle {
        id: statusBar
        anchors.bottom: parent.bottom
        anchors.left: parent.left
        anchors.right: parent.right
        height: 30
        color: Qt.rgba(0.008, 0.024, 0.090, 0.8)  // backgroundDark with 80% opacity
        visible: false  // Set to true for debugging

        Row {
            anchors.fill: parent
            anchors.margins: 8
            spacing: 16

            Text {
                color: "#94a3b8"  // slate-400
                font.pixelSize: 12
                text: "Screen: " + router.currentScreen
            }

            Text {
                color: "#94a3b8"  // slate-400
                font.pixelSize: 12
                text: "Gesture: " + gestureBridge.currentGesture
            }

            Text {
                color: "#94a3b8"  // slate-400
                font.pixelSize: 12
                text: "Hand: " + (gestureBridge.handDetected ? "Detected" : "None")
            }

            Text {
                color: "#94a3b8"  // slate-400
                font.pixelSize: 12
                text: "Time: " + clockProvider.timeString
            }
        }
    }

    // ========================================================================
    // Initialization
    // ========================================================================

    Component.onCompleted: {
        // Initialization complete
    }

    // ========================================================================
    // Connections
    // ========================================================================

    Connections {
        target: router
        function onScreenChanged(screen, params) {
            // Screen navigation handled
        }
    }

    Connections {
        target: gestureBridge
        function onFistDetected() {
            // Handle global fist gesture (e.g., click)
        }
    }
}
