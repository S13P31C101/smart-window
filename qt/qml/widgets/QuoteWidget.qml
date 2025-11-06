import QtQuick 2.15
import "../components"
import "../styles"

GlassCard {
    id: root

    width: 400
    height: 200

    property var quotes: [
        { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
        { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
        { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
        { text: "Life is 10% what happens to you and 90% how you react to it.", author: "Charles R. Swindoll" },
        { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" }
    ]

    property int currentIndex: 0

    Column {
        anchors.fill: parent
        anchors.margins: Theme.paddingM
        spacing: Theme.spacingL

        Text {
            text: "💭"
            font.pixelSize: Theme.fontSizeH3
            opacity: 0.5
        }

        Text {
            width: parent.width
            text: "\"" + quotes[currentIndex].text + "\""
            font.pixelSize: Theme.fontSizeBody
            font.italic: true
            color: Theme.textPrimary
            wrapMode: Text.Wrap
        }

        Text {
            width: parent.width
            text: "— " + quotes[currentIndex].author
            font.pixelSize: Theme.fontSizeCaption
            color: Theme.textSecondary
            horizontalAlignment: Text.AlignRight
        }
    }

    // Change quote every 30 seconds
    Timer {
        interval: 30000
        running: true
        repeat: true
        onTriggered: {
            currentIndex = (currentIndex + 1) % quotes.length
        }
    }

    // Click to change quote
    MouseArea {
        anchors.fill: parent
        onClicked: {
            currentIndex = (currentIndex + 1) % quotes.length
        }
    }
}
