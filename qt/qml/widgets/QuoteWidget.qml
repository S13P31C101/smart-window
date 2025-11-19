import QtQuick 2.15
import QtQuick.Window 2.15
import QtQuick.Effects
import "../components"
import "../styles"

Item {
    id: root

    width: Window.window ? Window.window.width * 0.8 : 800
    height: Window.window ? Window.window.height * 0.07 : 70

    property var quotes: [
        { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
        { text: "The mind is everything. What you think you become.", author: "Buddha" },
        { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
        { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
        { text: "The best way to predict the future is to create it.", author: "Peter Drucker" },
        { text: "What you do today can improve all your tomorrows.", author: "Ralph Marston" },
        { text: "Strive not to be a success, but rather to be of value.", author: "Albert Einstein" },
        { text: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky" },
        { text: "Our greatest glory is not in never failing, but in rising up every time we fail.", author: "Ralph Waldo Emerson" },
        { text: "The journey of a thousand miles begins with a single step.", author: "Lao Tzu" },
        { text: "Do the best you can until you know better. Then when you know better, do better.", author: "Maya Angelou" },
        { text: "It is never too late to be what you might have been.", author: "George Eliot" },
        { text: "The purpose of our lives is to be happy.", author: "Dalai Lama" },
        { text: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt" },
        { text: "Darkness cannot drive out darkness: only light can do that. Hate cannot drive out hate: only love can do that.", author: "Martin Luther King Jr." },
        { text: "Change your thoughts and you change your world.", author: "Norman Vincent Peale" },
        { text: "If you are working on something exciting that you really care about, you don't have to be pushed. The vision pulls you.", author: "Steve Jobs" },
        { text: "Everything you've ever wanted is on the other side of fear.", author: "George Addair" },
        { text: "The power of imagination makes us infinite.", author: "John Muir" },
        { text: "Happiness is not something readymade. It comes from your own actions.", author: "Dalai Lama" },
        { text: "The two most important days in your life are the day you are born and the day you find out why.", author: "Mark Twain" },
        { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
        { text: "The only true wisdom is in knowing you know nothing.", author: "Socrates" },
        { text: "Where there is a will, there is a way.", author: "Proverb" },
        { text: "Life is 10% what happens to you and 90% how you react to it.", author: "Charles R. Swindoll" },
        { text: "The time is always right to do what is right.", author: "Martin Luther King Jr." },
        { text: "You must do the things you think you cannot do.", author: "Eleanor Roosevelt" },
        { text: "If you can dream it, you can achieve it.", author: "Zig Ziglar" },
        { text: "Be the change that you wish to see in the world.", author: "Mahatma Gandhi" },
        { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
        { text: "Keep your face always toward the sunshine—and shadows will fall behind you.", author: "Walt Whitman" },
        { text: "Either you run the day, or the day runs you.", author: "Jim Rohn" },
        { text: "We may encounter many defeats but we must not be defeated.", author: "Maya Angelou" },
        { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
        { text: "Tough times never last, but tough people do.", author: "Robert H. Schuller" },
        { text: "The only person you are destined to become is the person you decide to be.", author: "Ralph Waldo Emerson" },
        { text: "A man is but the product of his thoughts. What he thinks, he becomes.", author: "Mahatma Gandhi" },
        { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
        { text: "What we achieve inwardly will change outer reality.", author: "Plutarch" },
        { text: "Set your heart on doing good. Do it over and over again, and you will be filled with joy.", author: "Buddha" },
        { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
        { text: "The pain you feel today will be the strength you feel tomorrow.", author: "Anonymous" },
        { text: "Challenges are what make life interesting and overcoming them is what makes life meaningful.", author: "Joshua J. Marine" },
        { text: "Don't count the days, make the days count.", author: "Muhammad Ali" },
        { text: "The best revenge is massive success.", author: "Frank Sinatra" },
        { text: "If you want to lift yourself up, lift up someone else.", author: "Booker T. Washington" },
        { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
        { text: "Look up at the stars and not down at your feet.", author: "Stephen Hawking" },
        { text: "When something is important enough, you do it even if the odds are not in your favor.", author: "Elon Musk" },
        { text: "Go confidently in the direction of your dreams! Live the life you've imagined.", author: "Henry David Thoreau" }
    ]

    property int currentIndex: 0

    // Minimal and elegant design
    Column {
        anchors.centerIn: parent
        spacing: Window.window ? Window.window.height * 0.010 : 10
        width: parent.width * 0.9

        // Decorative line above
        Rectangle {
            width: 60
            height: 1
            color: Theme.alpha("#ffffff", 0.25)
            anchors.horizontalCenter: parent.horizontalCenter
        }

        // Quote text - centered and elegant
        Text {
            id: quoteText
            text: '"' + quotes[currentIndex].text + '"'
            font.pixelSize: Window.window ? Window.window.width * 0.019 : 20
            font.weight: Font.Light
            font.letterSpacing: 0.5
            color: Theme.alpha("#ffffff", 0.9)
            width: parent.width
            horizontalAlignment: Text.AlignHCenter
            wrapMode: Text.WordWrap
            maximumLineCount: 2
            elide: Text.ElideRight
            lineHeight: 1.4

            // Smooth fade animation
            Behavior on opacity {
                NumberAnimation { duration: 400; easing.type: Easing.InOutQuad }
            }
        }

        // Author - small and subtle
        Text {
            id: authorText
            text: "— " + quotes[currentIndex].author
            font.pixelSize: Window.window ? Window.window.width * 0.013 : 14
            font.weight: Font.Normal
            font.italic: true
            color: Theme.alpha("#ffffff", 0.5)
            anchors.horizontalCenter: parent.horizontalCenter

            // Smooth fade animation
            Behavior on opacity {
                NumberAnimation { duration: 400; easing.type: Easing.InOutQuad }
            }
        }

        // Decorative line below
        Rectangle {
            width: 60
            height: 1
            color: Theme.alpha("#ffffff", 0.25)
            anchors.horizontalCenter: parent.horizontalCenter
        }
    }

    // Click area to change quote
    MouseArea {
        anchors.fill: parent
        cursorShape: Qt.PointingHandCursor
        onClicked: {
            changeQuote()
        }

        // Subtle hover effect
        hoverEnabled: true
        onEntered: parent.opacity = 0.85
        onExited: parent.opacity = 1.0
    }

    Behavior on opacity {
        NumberAnimation { duration: 300; easing.type: Easing.OutCubic }
    }

    // Smooth quote change function
    function changeQuote() {
        // Fade out
        quoteText.opacity = 0
        authorText.opacity = 0

        // Change quote after fade out
        fadeTimer.start()
    }

    Timer {
        id: fadeTimer
        interval: 400
        onTriggered: {
            currentIndex = (currentIndex + 1) % quotes.length
            // Fade in
            quoteText.opacity = 1
            authorText.opacity = 1
        }
    }

    // Auto-change timer (45 seconds)
    Timer {
        interval: 45000
        running: true
        repeat: true
        onTriggered: {
            changeQuote()
        }
    }
}
