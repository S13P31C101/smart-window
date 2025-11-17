import QtQuick 2.15
import QtQuick.Controls 2.15
import "../components"
import "../widgets"
import "../styles"

Item {
    id: root

    // Current YouTube URL state - synced with AppConfig
    property string currentYoutubeUrl: appConfig.currentYoutubeUrl

    // Watch for changes from AppConfig
    Connections {
        target: appConfig
        function onCurrentYoutubeUrlChanged() {
            root.currentYoutubeUrl = appConfig.currentYoutubeUrl
            console.log("YouTube URL updated from MQTT:", appConfig.currentYoutubeUrl)
        }
    }

    // Background - Image or fallback
    Image {
        id: backgroundImage
        anchors.fill: parent
        source: appConfig.currentMediaUrl || ""
        fillMode: Image.PreserveAspectCrop
        asynchronous: true
        cache: false

        // Show loading indicator
        Rectangle {
            anchors.fill: parent
            color: "#1e293b"
            visible: backgroundImage.status === Image.Loading

            Text {
                anchors.centerIn: parent
                text: "Loading media..."
                color: "white"
                font.pixelSize: 24
            }
        }

        // Fallback background when no media
        Rectangle {
            anchors.fill: parent
            visible: backgroundImage.status === Image.Null || backgroundImage.source === ""
            gradient: Gradient {
                GradientStop { position: 0.0; color: "#0f172a" }
                GradientStop { position: 0.5; color: "#1e293b" }
                GradientStop { position: 1.0; color: "#0f172a" }
            }
        }

        // Error state
        Rectangle {
            anchors.fill: parent
            color: "#1e293b"
            visible: backgroundImage.status === Image.Error

            Column {
                anchors.centerIn: parent
                spacing: 20

                Text {
                    text: "⚠️ Failed to load media"
                    color: "#ef4444"
                    font.pixelSize: 24
                    anchors.horizontalCenter: parent.horizontalCenter
                }

                Text {
                    text: appConfig.currentMediaUrl
                    color: "#94a3b8"
                    font.pixelSize: 14
                    anchors.horizontalCenter: parent.horizontalCenter
                }
            }
        }

        // Dimming overlay for better widget visibility
        Rectangle {
            anchors.fill: parent
            color: "black"
            opacity: 0.3
            visible: backgroundImage.status === Image.Ready
        }
    }

    // ====== Guide Screen (shown when no media or music is loaded) ======
    Item {
        id: guideScreen
        anchors.fill: parent
        // Hide guide when either media or YouTube URL is provided
        visible: (!appConfig.currentMediaUrl || appConfig.currentMediaUrl === "") &&
                 (!appConfig.currentYoutubeUrl || appConfig.currentYoutubeUrl === "")
        z: 100  // Ensure guide screen is on top when visible

        // Monitor media URL changes
        Connections {
            target: appConfig
            function onCurrentMediaUrlChanged() {
                var hasMedia = appConfig.currentMediaUrl && appConfig.currentMediaUrl !== ""
                console.log("Media URL changed:", appConfig.currentMediaUrl, "-> Guide visible:", !hasMedia && !appConfig.currentYoutubeUrl)
            }
            function onCurrentYoutubeUrlChanged() {
                var hasYoutube = appConfig.currentYoutubeUrl && appConfig.currentYoutubeUrl !== ""
                console.log("YouTube URL changed:", appConfig.currentYoutubeUrl, "-> Guide visible:", !hasYoutube && !appConfig.currentMediaUrl)
            }
        }

        Component.onCompleted: {
            console.log("Guide screen initialized.")
            console.log("  currentMediaUrl:", appConfig.currentMediaUrl)
            console.log("  currentYoutubeUrl:", appConfig.currentYoutubeUrl)
            console.log("  Guide visible:", guideScreen.visible)
        }

        // Semi-transparent overlay for better card visibility
        Rectangle {
            anchors.fill: parent
            color: "#80000000"  // 50% black overlay
        }

        // White card
        Rectangle {
            id: guideCard
            anchors.centerIn: parent
            width: Math.min(parent.width * 0.5, 520)
            height: Math.min(parent.height * 0.55, 580)
            radius: 24
            color: "#FFFFFF"

            // Shadow layer (behind the card)
            Rectangle {
                anchors.centerIn: parent
                anchors.verticalCenterOffset: 8
                width: parent.width
                height: parent.height
                radius: 24
                color: "#30000000"
                z: -1  // Behind the white card
            }

            Column {
                anchors.fill: parent
                anchors.margins: 44
                spacing: 24

                // Spacer for better vertical centering
                Item { width: 1; height: 20 }

                // Icon - Blue smartphone
                Item {
                    width: parent.width
                    height: 100

                    Rectangle {
                        anchors.centerIn: parent
                        width: 80
                        height: 80
                        radius: 18
                        color: "#22d3ee"

                        // Simple smartphone icon representation
                        Rectangle {
                            anchors.centerIn: parent
                            width: 36
                            height: 52
                            radius: 6
                            color: "#FFFFFF"
                            border.color: "#0891b2"
                            border.width: 2

                            // Screen
                            Rectangle {
                                anchors.centerIn: parent
                                anchors.verticalCenterOffset: -2
                                width: 28
                                height: 38
                                radius: 3
                                color: "#06b6d4"
                            }

                            // Home button
                            Rectangle {
                                anchors.horizontalCenter: parent.horizontalCenter
                                anchors.bottom: parent.bottom
                                anchors.bottomMargin: 4
                                width: 10
                                height: 10
                                radius: 5
                                color: "#0891b2"
                            }
                        }
                    }
                }

                // Title
                Text {
                    width: parent.width
                    text: "Welcome to Custom Mode"
                    font.pixelSize: 28
                    font.bold: true
                    color: "#1e293b"
                    horizontalAlignment: Text.AlignHCenter
                }

                // Subtitle
                Text {
                    width: parent.width
                    text: "Personalize and control your display"
                    font.pixelSize: 16
                    color: "#64748b"
                    horizontalAlignment: Text.AlignHCenter
                }

                // Spacer
                Item { width: 1; height: 10 }

                // Bullet points
                Column {
                    width: parent.width
                    spacing: 16

                    // Bullet 1
                    Row {
                        anchors.horizontalCenter: parent.horizontalCenter
                        spacing: 12

                        Rectangle {
                            width: 8
                            height: 8
                            radius: 4
                            color: "#a855f7"
                            anchors.verticalCenter: parent.verticalCenter
                        }

                        Text {
                            text: "Customize widgets and layout"
                            font.pixelSize: 16
                            color: "#475569"
                        }
                    }

                    // Bullet 2
                    Row {
                        anchors.horizontalCenter: parent.horizontalCenter
                        spacing: 12

                        Rectangle {
                            width: 8
                            height: 8
                            radius: 4
                            color: "#ec4899"
                            anchors.verticalCenter: parent.verticalCenter
                        }

                        Text {
                            text: "Change backgrounds and themes"
                            font.pixelSize: 16
                            color: "#475569"
                        }
                    }

                    // Bullet 3
                    Row {
                        anchors.horizontalCenter: parent.horizontalCenter
                        spacing: 12

                        Rectangle {
                            width: 8
                            height: 8
                            radius: 4
                            color: "#06b6d4"
                            anchors.verticalCenter: parent.verticalCenter
                        }

                        Text {
                            text: "Adjust settings in real-time"
                            font.pixelSize: 16
                            color: "#475569"
                        }
                    }
                }

                // Spacer
                Item { width: 1; height: 10 }

                // Bottom instruction
                Text {
                    width: parent.width
                    text: "Download the Lumiscape app to get started."
                    font.pixelSize: 14
                    color: "#94a3b8"
                    horizontalAlignment: Text.AlignHCenter
                }

                // Spacer for better vertical centering
                Item { width: 1; height: 20 }
            }
        }
    }

    // ====== 중앙 상단 위젯 영역 ======
    Column {
        id: topWidgets
        anchors.horizontalCenter: parent.horizontalCenter
        anchors.top: parent.top
        anchors.topMargin: parent.height * 0.12
        spacing: 20
        z: 50  // Above background, below guide screen

        // 시계 위젯
        ClockWidget {
            id: clockWidget
            anchors.horizontalCenter: parent.horizontalCenter
            visible: true
        }

        // 날씨 위젯
        WeatherWidget {
            id: weatherWidget
            anchors.horizontalCenter: parent.horizontalCenter
            visible: true
        }

        // 명언 위젯 (날씨 바로 밑)
        QuoteWidget {
            id: quoteWidget
            anchors.horizontalCenter: parent.horizontalCenter
            visible: widgetRegistry.isWidgetActive("quote")
        }
    }

    // YouTube 입력 영역 제거 - MQTT로만 제어

    // ====== YouTube Player (하단 중앙) ======
    YouTubePlayer {
        id: youtubePlayer
        anchors.horizontalCenter: parent.horizontalCenter
        anchors.bottom: parent.bottom
        anchors.bottomMargin: parent.height * 0.05
        width: Math.min(parent.width * 0.45, 500)  // Compact size
        height: 160
        youtubeUrl: root.currentYoutubeUrl
        visible: root.currentYoutubeUrl !== ""
        z: 60  // Above all other widgets to prevent being covered by background
    }

    // Spotify removed - using YouTube player for music
    // CustomModeScreen uses MQTT-controlled YouTube player only

    // Back button - Gesture controlled and vertically centered
    GestureControlledUI {
        anchors.left: parent.left
        anchors.verticalCenter: parent.verticalCenter
        anchors.margins: root.width * 0.03
        z: 150  // Above everything for gesture control

        MinimalButton {
            text: "← Menu"
            implicitWidth: root.width * 0.12
            implicitHeight: root.height * 0.055
            buttonRadius: 28
            onClicked: router.navigateTo("menu")
        }
    }
}
