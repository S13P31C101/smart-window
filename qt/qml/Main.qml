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
        color: Theme.backgroundDark
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
        // 메뉴 화면에서는 숨김 (MenuScreen이 자체 커서 사용)
        // 다른 화면에서는 3초 후 자동 숨김
        visible: gestureBridge.handDetected &&
                 appConfig.gestureEnabled &&
                 router.currentScreen !== "menu" &&
                 router.currentScreen !== "loading" &&
                 cursorAutoHideTimer.showCursor

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

    // 커서 자동 숨김 타이머
    Timer {
        id: cursorAutoHideTimer
        interval: 3000  // 3초
        repeat: false
        property bool showCursor: true

        onTriggered: {
            showCursor = false
        }
    }

    // 커서 움직임 감지 (다시 표시)
    Connections {
        target: gestureBridge
        function onCursorPositionChanged() {
            if (router.currentScreen !== "menu" && router.currentScreen !== "loading") {
                cursorAutoHideTimer.showCursor = true
                cursorAutoHideTimer.restart()
            }
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
        color: Theme.alpha(Theme.backgroundDark, 0.8)
        visible: false  // Set to true for debugging

        Row {
            anchors.fill: parent
            anchors.margins: Theme.spacingS
            spacing: Theme.spacingM

            Text {
                color: Theme.textSecondary
                font.pixelSize: Theme.fontSizeSmall
                text: "Screen: " + router.currentScreen
            }

            Text {
                color: Theme.textSecondary
                font.pixelSize: Theme.fontSizeSmall
                text: "Gesture: " + gestureBridge.currentGesture
            }

            Text {
                color: Theme.textSecondary
                font.pixelSize: Theme.fontSizeSmall
                text: "Hand: " + (gestureBridge.handDetected ? "Detected" : "None")
            }

            Text {
                color: Theme.textSecondary
                font.pixelSize: Theme.fontSizeSmall
                text: "Time: " + clockProvider.timeString
            }
        }
    }

    // ========================================================================
    // Initialization
    // ========================================================================

    Component.onCompleted: {
        console.log("Lumiscape initialized")
        console.log("Screen:", width + "x" + height)
    }

    // ========================================================================
    // Connections
    // ========================================================================

    Connections {
        target: router
        function onScreenChanged(screen, params) {
            console.log("Screen changed to:", screen)
        }
    }

    Connections {
        target: gestureBridge
        function onFistDetected() {
            console.log("Fist gesture detected")
            // Handle global fist gesture (e.g., click)
        }
    }
}
