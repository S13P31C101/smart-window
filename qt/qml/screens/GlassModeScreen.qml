import QtQuick 2.15
import QtQuick.Controls 2.15
import QtQuick.Effects
import "../components"
import "../widgets"
import "../styles"

Item {
    id: root

    // 위젯 표시 상태
    property bool showClock: true
    property bool showWeather: true
    property bool showSpotify: false
    property bool showQuote: false

    // Transparent glass effect background
    Rectangle {
        anchors.fill: parent
        color: Theme.alpha(Theme.glassBackground, 0.05)
    }

    // ====== 상단 위젯 영역 ======
    Row {
        id: topWidgets
        anchors.horizontalCenter: parent.horizontalCenter
        anchors.top: parent.top
        anchors.topMargin: root.height * 0.08
        spacing: root.width * 0.03

        // 시계 위젯
        ClockWidget {
            visible: showClock
            scale: 0.75
            opacity: 0.95
        }

        // 날씨 위젯
        WeatherWidget {
            visible: showWeather
            scale: 0.75
            opacity: 0.95
        }
    }

    // ====== 하단 위젯 영역 ======
    Row {
        id: bottomWidgets
        anchors.horizontalCenter: parent.horizontalCenter
        anchors.bottom: parent.bottom
        anchors.bottomMargin: root.height * 0.08
        spacing: root.width * 0.03

        // Spotify 위젯
        SpotifyWidget {
            visible: showSpotify
            scale: 0.75
            opacity: 0.95
        }

        // 명언 위젯
        QuoteWidget {
            visible: showQuote
            scale: 0.75
            opacity: 0.95
        }
    }

    // ====== 위젯 토글 버튼 (우측 상단) ======
    Column {
        anchors.right: parent.right
        anchors.top: parent.top
        anchors.margins: root.width * 0.02
        spacing: root.height * 0.01

        // 토글 버튼 스타일
        component ToggleButton: Rectangle {
            width: root.width * 0.045
            height: root.width * 0.045
            radius: width / 2
            color: Theme.alpha(Theme.glassBackgroundMid, isActive ? 0.4 : 0.15)
            border.color: Theme.alpha(Theme.textPrimary, isActive ? 0.6 : 0.2)
            border.width: 1

            property bool isActive: false
            property string icon: ""
            signal clicked()

            layer.enabled: true
            layer.effect: MultiEffect {
                shadowEnabled: true
                shadowOpacity: 0.3
                shadowBlur: 0.4
                shadowColor: "#000000"
            }

            Text {
                anchors.centerIn: parent
                text: icon
                font.pixelSize: parent.width * 0.5
                opacity: parent.isActive ? 1.0 : 0.5
            }

            MouseArea {
                anchors.fill: parent
                hoverEnabled: true
                cursorShape: Qt.PointingHandCursor
                onClicked: parent.clicked()
                onEntered: parent.scale = 1.1
                onExited: parent.scale = 1.0
            }

            Behavior on scale {
                NumberAnimation { duration: 150; easing.type: Easing.OutCubic }
            }
            Behavior on color {
                ColorAnimation { duration: 200 }
            }
        }

        // 시계 토글
        ToggleButton {
            icon: "🕐"
            isActive: showClock
            onClicked: showClock = !showClock
        }

        // 날씨 토글
        ToggleButton {
            icon: "🌤️"
            isActive: showWeather
            onClicked: showWeather = !showWeather
        }

        // Spotify 토글
        ToggleButton {
            icon: "🎵"
            isActive: showSpotify
            onClicked: showSpotify = !showSpotify
        }

        // 명언 토글
        ToggleButton {
            icon: "💭"
            isActive: showQuote
            onClicked: showQuote = !showQuote
        }
    }

    // ====== Back 버튼 (좌측 상단) ======
    Button {
        anchors.top: parent.top
        anchors.left: parent.left
        anchors.margins: root.width * 0.02
        text: "← Menu"

        background: Rectangle {
            implicitWidth: root.width * 0.1
            implicitHeight: root.height * 0.035
            radius: Theme.radiusM
            color: Theme.alpha(Theme.glassBackgroundMid, 0.2)
            border.color: Theme.alpha(Theme.textPrimary, 0.2)
            border.width: 1

            layer.enabled: true
            layer.effect: MultiEffect {
                shadowEnabled: true
                shadowOpacity: 0.3
                shadowBlur: 0.4
                shadowColor: "#000000"
            }
        }

        contentItem: Text {
            text: parent.text
            color: Theme.textPrimary
            font.pixelSize: root.width * 0.015
            font.weight: Theme.fontWeightMedium
            horizontalAlignment: Text.AlignHCenter
            verticalAlignment: Text.AlignVCenter
        }

        onClicked: router.navigateTo("menu")

        MouseArea {
            anchors.fill: parent
            hoverEnabled: true
            cursorShape: Qt.PointingHandCursor
            onClicked: parent.clicked()
            onEntered: parent.scale = 1.05
            onExited: parent.scale = 1.0
        }

        Behavior on scale {
            NumberAnimation { duration: 150; easing.type: Easing.OutCubic }
        }
    }

    // ====== 힌트 텍스트 (중앙 하단) ======
    Text {
        anchors.horizontalCenter: parent.horizontalCenter
        anchors.bottom: parent.bottom
        anchors.bottomMargin: root.height * 0.02
        text: "Use toggle buttons to show/hide widgets"
        color: Theme.alpha(Theme.textTertiary, 0.6)
        font.pixelSize: root.width * 0.012
        font.weight: Theme.fontWeightRegular
        visible: !showSpotify && !showQuote
    }
}
