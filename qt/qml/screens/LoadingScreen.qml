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
            GradientStop { position: 0.0; color: "#cbd5e1" } // slate-300
            GradientStop { position: 0.5; color: "#e2e8f0" } // slate-200
            GradientStop { position: 1.0; color: "#cbd5e1" } // slate-300
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
            color: "#1e293b"  // slate-800
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
            shadowEnabled: true
            shadowOpacity: 0.15
            shadowBlur: 0.6
            shadowColor: "#94a3b8"
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
            border.color: "#a78bfa"  // purple-400

            RotationAnimator on rotation {
                from: 0
                to: 360
                duration: 1500
                loops: Animation.Infinite
                running: true
            }
        }

        // 안쪽 고리(Canvas)
        Item {
            id: innerRingWrapper
            anchors.centerIn: parent
            width: parent.width - 12
            height: parent.height - 12

            Canvas {
                id: innerRing
                anchors.fill: parent

                onPaint: {
                    const ctx = getContext("2d")
                    const w = width; const h = height
                    const r = Math.min(w, h)/2 - 2
                    ctx.reset()
                    ctx.translate(w/2, h/2)
                    ctx.lineWidth = 4
                    ctx.lineCap = "round"

                    ctx.beginPath()
                    ctx.strokeStyle = "#3b82f6" // blue-500
                    ctx.arc(0, 0, r, -Math.PI/2, 0) // 12→3시
                    ctx.stroke()

                    ctx.beginPath()
                    ctx.strokeStyle = "#60a5fa" // blue-400
                    ctx.arc(0, 0, r, 0, Math.PI/4) // 3시→약 45°
                    ctx.stroke()
                }
            }

            // innerRing에 드롭섀도
            MultiEffect {
                anchors.fill: innerRing
                source: innerRing
                shadowEnabled: true
                shadowOpacity: 0.35
            }

            RotationAnimator on rotation {
                from: 0
                to: 360
                duration: 1500
                loops: Animation.Infinite
                running: true
            }
        }

        // 중앙 글로우 점
        Rectangle {
            id: coreDot
            width: 8; height: 8; radius: 4
            color: "#3b82f6"  // blue-500
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
            shadowEnabled: true
            shadowOpacity: 0.5
            shadowBlur: 0.9
            shadowColor: "#1e40af"
        }
    }

    // === INITIALIZING 텍스트 ===
    Text {
        id: bootText
        text: "INITIALIZING"
        color: "#64748b"  // slate-500
        anchors.horizontalCenter: parent.horizontalCenter
        anchors.top: spinner.bottom
        anchors.topMargin: 48
        font.pixelSize: 18
        font.letterSpacing: 4
        font.weight: Font.Medium
        opacity: 0.0

        SequentialAnimation {
            running: true
            NumberAnimation { target: bootText; property: "opacity"; from: 0; to: 1; duration: 500; easing.type: Easing.OutQuad }
            SequentialAnimation {
                loops: Animation.Infinite
                NumberAnimation { target: bootText; property: "opacity"; from: 0.4; to: 1.0; duration: 1000; easing.type: Easing.InOutQuad }
                NumberAnimation { target: bootText; property: "opacity"; from: 1.0; to: 0.4; duration: 1000; easing.type: Easing.InOutQuad }
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
