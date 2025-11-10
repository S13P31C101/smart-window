import QtQuick 2.15
import QtQuick.Window 2.15
import QtQuick.Effects
import "../components"
import "../styles"

Item {
    id: root

    width: Window.window ? Window.window.width * 0.926 : 1000
    height: Window.window ? Window.window.height * 0.026 : 50

    property var quotes: [
        { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
        { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
        { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
        { text: "Life is 10% what happens to you and 90% how you react to it.", author: "Charles R. Swindoll" },
        { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" }
    ]

    property int currentIndex: 0

    Row {
        anchors.centerIn: parent
        spacing: Window.window ? Window.window.width * 0.014 : 15

        // 명언 아이콘
        Text {
            text: "💭"
            font.pixelSize: Window.window ? Window.window.width * 0.022 : 24
            anchors.verticalCenter: parent.verticalCenter
        }

        // 왼쪽 따옴표
        Text {
            text: "\u201C"
            font.pixelSize: Window.window ? Window.window.width * 0.026 : 28
            font.weight: Font.Bold
            color: Theme.alpha("#ffffff", 0.4)
            font.family: "serif"
            anchors.verticalCenter: parent.verticalCenter
        }

        // 명언 텍스트
        Text {
            id: quoteText
            text: quotes[currentIndex].text
            font.pixelSize: Window.window ? Window.window.width * 0.0167 : 18
            font.weight: Font.Medium
            font.italic: true
            color: Theme.alpha("#ffffff", 0.85)
            anchors.verticalCenter: parent.verticalCenter
            elide: Text.ElideRight
            maximumLineCount: 1

            // 명언 변경 시 페이드 애니메이션
            Behavior on text {
                SequentialAnimation {
                    NumberAnimation {
                        target: quoteText
                        property: "opacity"
                        to: 0
                        duration: 200
                    }
                    PropertyAction { target: quoteText; property: "text" }
                    NumberAnimation {
                        target: quoteText
                        property: "opacity"
                        to: 1
                        duration: 300
                    }
                }
            }
        }

        // 오른쪽 따옴표
        Text {
            text: "\u201D"
            font.pixelSize: Window.window ? Window.window.width * 0.026 : 28
            font.weight: Font.Bold
            color: Theme.alpha("#ffffff", 0.4)
            font.family: "serif"
            anchors.verticalCenter: parent.verticalCenter
        }

        // 구분선
        Rectangle {
            width: 2
            height: Window.window ? Window.window.height * 0.0156 : 30
            color: Theme.alpha("#ffffff", 0.3)
            anchors.verticalCenter: parent.verticalCenter
        }

        // 작가명
        Text {
            text: quotes[currentIndex].author
            font.pixelSize: Window.window ? Window.window.width * 0.015 : 16
            font.weight: Font.Medium
            color: Theme.alpha("#ffffff", 0.6)
            anchors.verticalCenter: parent.verticalCenter
        }
    }

    // 클릭 영역 (다음 명언)
    MouseArea {
        anchors.fill: parent
        cursorShape: Qt.PointingHandCursor
        onClicked: {
            currentIndex = (currentIndex + 1) % quotes.length
        }

        // 호버 효과
        hoverEnabled: true
        onEntered: parent.opacity = 0.8
        onExited: parent.opacity = 1.0
    }

    Behavior on opacity {
        NumberAnimation { duration: 200; easing.type: Easing.OutCubic }
    }

    // 자동 변경 타이머 (30초)
    Timer {
        interval: 30000
        running: true
        repeat: true
        onTriggered: {
            currentIndex = (currentIndex + 1) % quotes.length
        }
    }
}
