// qml/screens/LoadingScreen.qml
import QtQuick
import QtQuick.Controls
import QtQuick.Effects

Item {
    id: root
    width: 1080; height: 1920
    signal complete()
    property int durationMs: 4000

    // === 배경 그라디언트 ===
    Rectangle {
        id: bg
        anchors.fill: parent
        gradient: Gradient {
            GradientStop { position: 0.0; color: "#0f172a" }
            GradientStop { position: 0.6; color: "#1e293b" }
            GradientStop { position: 1.0; color: "#0f172a" }
        }
        opacity: 0.0
        NumberAnimation on opacity { from: 0; to: 1; duration: 800; running: true }
    }

    // === 로고 ===
    Item {
        id: logoWrap
        anchors.horizontalCenter: parent.horizontalCenter
        anchors.verticalCenter: parent.verticalCenter
        anchors.verticalCenterOffset: -180

        Text {
            id: brand
            text: "Lumiscape"
            color: "#cfefff"
            font.pixelSize: 120
            font.weight: Font.DemiBold
            opacity: 0.0
            scale: 0.9
            horizontalAlignment: Text.AlignHCenter
            anchors.horizontalCenter: parent.horizontalCenter

            Behavior on opacity { NumberAnimation { duration: 1200; easing.type: Easing.OutQuad } }
            Behavior on scale   { NumberAnimation { duration: 1200; easing.type: Easing.OutQuad } }
            Component.onCompleted: { opacity = 1.0; scale = 1.0 }
        }

        // 안전한 MultiEffect 적용
        MultiEffect {
            anchors.fill: brand
            source: brand
            blurEnabled: true
            blur: 0.25
            shadowEnabled: true
            shadowOpacity: 0.4
            shadowBlur: 0.6
            brightness: 0.03
        }
    }

    // === 로딩 스피너 (이중 링) ===
    Item {
        id: spinner
        width: 80; height: 80
        anchors.horizontalCenter: parent.horizontalCenter
        anchors.top: logoWrap.bottom
        anchors.topMargin: 200
        opacity: 0.0
        NumberAnimation on opacity { from: 0; to: 1; duration: 500; running: true; }

        // 바깥 고리
        Rectangle {
            id: outerRing
            anchors.fill: parent
            radius: width/2
            color: "transparent"
            border.width: 4
            border.color: "#55aeeeff"
            transform: Rotation { id: outerRot; origin.x: width/2; origin.y: height/2; angle: 0 }
        }
        NumberAnimation {
            target: outerRot
            property: "angle"
            from: 0; to: 360
            duration: 1500
            loops: Animation.Infinite
            easing.type: Easing.Linear
        }

        // 안쪽 고리(Canvas)
        Canvas {
            id: innerRing
            anchors.centerIn: parent
            width: parent.width - 12
            height: parent.height - 12
            transform: Rotation { id: innerRot; origin.x: width/2; origin.y: height/2; angle: 0 }

            onPaint: {
                const ctx = getContext("2d")
                const w = width; const h = height
                const r = Math.min(w, h)/2 - 2
                ctx.reset()
                ctx.translate(w/2, h/2)
                ctx.lineWidth = 4
                ctx.lineCap = "round"

                ctx.beginPath()
                ctx.strokeStyle = "#22d3ee" // cyan
                ctx.arc(0, 0, r, -Math.PI/2, 0) // 12→3시
                ctx.stroke()

                ctx.beginPath()
                ctx.strokeStyle = "#60a5fa" // blue
                ctx.arc(0, 0, r, 0, Math.PI/4) // 3시→약 45°
                ctx.stroke()
            }
        }
        NumberAnimation {
            target: innerRot
            property: "angle"
            from: 0; to: 360
            duration: 1500
            loops: Animation.Infinite
            easing.type: Easing.Linear
        }

        // 중앙 글로우 점
        Rectangle {
            id: coreDot
            width: 8; height: 8; radius: 4
            color: "#22d3ee"
            anchors.centerIn: parent
            opacity: 0.8
            scale: 1.0

            SequentialAnimation on scale {
                loops: Animation.Infinite
                NumberAnimation { to: 1.5; duration: 750; easing.type: Easing.InOutQuad }
                NumberAnimation { to: 1.0; duration: 750; easing.type: Easing.InOutQuad }
            }
            SequentialAnimation on opacity {
                loops: Animation.Infinite
                NumberAnimation { to: 1.0; duration: 750; easing.type: Easing.InOutQuad }
                NumberAnimation { to: 0.5; duration: 750; easing.type: Easing.InOutQuad }
            }
        }
        MultiEffect {
            anchors.fill: coreDot
            source: coreDot
            blurEnabled: true
            blur: 0.35
            brightness: 0.08
            shadowEnabled: true
            shadowOpacity: 0.7
            shadowBlur: 0.9
        }

        // innerRing에 드롭섀도
        MultiEffect {
            anchors.fill: innerRing
            source: innerRing
            shadowEnabled: true
            shadowOpacity: 0.35
        }
    }

    // === INITIALIZING 텍스트 ===
    Text {
        id: bootText
        text: "INITIALIZING"
        color: "#a5f3fc"
        anchors.horizontalCenter: parent.horizontalCenter
        anchors.top: spinner.bottom
        anchors.topMargin: 48
        font.pixelSize: 18
        font.letterSpacing: 4
        opacity: 0.0

        SequentialAnimation {
            running: true
            NumberAnimation { target: bootText; property: "opacity"; from: 0; to: 1; duration: 500; easing.type: Easing.OutQuad }
            SequentialAnimation {
                loops: Animation.Infinite
                NumberAnimation { target: bootText; property: "opacity"; from: 0.0; to: 1.0; duration: 1000; easing.type: Easing.InOutQuad }
                NumberAnimation { target: bootText; property: "opacity"; from: 1.0; to: 0.0; duration: 1000; easing.type: Easing.InOutQuad }
            }
        }
    }

    // === 종료 트랜지션 & 완료 콜백 ===
    Timer {
        interval: durationMs; running: true; repeat: false
        onTriggered: exitAnim.start()
    }
    SequentialAnimation {
        id: exitAnim
        PropertyAnimation { target: root; property: "opacity"; from: 1.0; to: 0.0; duration: 450; easing.type: Easing.InOutQuad }
        ScriptAction { script: root.complete() }
    }
}
