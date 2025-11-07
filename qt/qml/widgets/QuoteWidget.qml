import QtQuick 2.15
import QtQuick.Effects
import "../components"
import "../styles"

GlassCard {
    id: root

    width: 420
    height: 200

    property var quotes: [
        { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
        { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
        { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
        { text: "Life is 10% what happens to you and 90% how you react to it.", author: "Charles R. Swindoll" },
        { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" }
    ]

    property int currentIndex: 0

    // 배경 그라디언트
    Rectangle {
        anchors.fill: parent
        radius: parent.radius
        gradient: Gradient {
            GradientStop { position: 0.0; color: Theme.alpha("#8b5cf6", 0.1) }
            GradientStop { position: 1.0; color: Theme.alpha("#ec4899", 0.05) }
        }
        opacity: 0.5
    }

    Column {
        anchors.fill: parent
        anchors.margins: Theme.paddingM
        spacing: Theme.spacingL

        // 헤더: 아이콘 + 인디케이터
        Row {
            width: parent.width
            spacing: Theme.spacingM

            // 명언 아이콘
            Rectangle {
                width: 40
                height: 40
                radius: 20
                color: Theme.alpha(Theme.primary, 0.15)
                border.color: Theme.alpha(Theme.primary, 0.25)
                border.width: 1

                Text {
                    anchors.centerIn: parent
                    text: "💭"
                    font.pixelSize: 22
                }
            }

            Item { width: parent.width - 120 }

            // 명언 번호 인디케이터
            Text {
                anchors.verticalCenter: parent.verticalCenter
                text: (currentIndex + 1) + " / " + quotes.length
                font.pixelSize: Theme.fontSizeSmall
                font.weight: Theme.fontWeightMedium
                color: Theme.textTertiary
                opacity: 0.7
            }
        }

        // 명언 텍스트
        Item {
            width: parent.width
            height: 80

            // 왼쪽 따옴표
            Text {
                anchors.left: parent.left
                anchors.top: parent.top
                text: "\u201C"
                font.pixelSize: 48
                font.weight: Theme.fontWeightBold
                color: Theme.alpha(Theme.primary, 0.2)
                font.family: "serif"
            }

            Text {
                id: quoteText
                anchors.centerIn: parent
                width: parent.width - 40
                text: quotes[currentIndex].text
                font.pixelSize: Theme.fontSizeBody
                font.weight: Theme.fontWeightRegular
                font.italic: true
                color: Theme.textPrimary
                wrapMode: Text.Wrap
                horizontalAlignment: Text.AlignHCenter
                lineHeight: 1.4

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
                anchors.right: parent.right
                anchors.bottom: parent.bottom
                text: "\u201D"
                font.pixelSize: 48
                font.weight: Theme.fontWeightBold
                color: Theme.alpha(Theme.primary, 0.2)
                font.family: "serif"
            }
        }

        // 작가명
        Row {
            anchors.right: parent.right
            spacing: Theme.spacingS

            Rectangle {
                width: 3
                height: 20
                radius: 1.5
                color: Theme.primary
                opacity: 0.6
                anchors.verticalCenter: parent.verticalCenter
            }

            Text {
                text: quotes[currentIndex].author
                font.pixelSize: Theme.fontSizeCaption
                font.weight: Theme.fontWeightMedium
                color: Theme.textSecondary
                anchors.verticalCenter: parent.verticalCenter
            }
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
        onEntered: root.scale = 1.02
        onExited: root.scale = 1.0
    }

    Behavior on scale {
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

    // 우측 하단 인디케이터 (클릭 가능 표시)
    Text {
        anchors.right: parent.right
        anchors.bottom: parent.bottom
        anchors.margins: 12
        text: "👆"
        font.pixelSize: 14
        opacity: 0.4

        SequentialAnimation on opacity {
            loops: Animation.Infinite
            NumberAnimation { to: 0.7; duration: 1500 }
            NumberAnimation { to: 0.3; duration: 1500 }
        }
    }
}
