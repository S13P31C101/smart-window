// qml/screens/MenuScreen.qml
import QtQuick
import QtQuick.Controls
import QtQuick.Effects

Item {
    id: root
    width: 1080; height: 1920

    // 초기화 및 정리
    Component.onCompleted: {
        console.log("MenuScreen loaded")
        // 초기 상태 설정
        hoveredIndex = -1
        // 글로우 애니메이션 재시작 (scale과 opacity 초기화)
        glowA.scale = 1.0
        glowA.opacity = 0.12
        glowB.scale = 1.0
        glowB.opacity = 0.10
        // 중심 장식 초기화
        centerDeco.scale = 1.0
    }

    Component.onDestruction: {
        console.log("MenuScreen unloaded")
    }

    // ====== 배경 ======
    Rectangle {
        anchors.fill: parent
        gradient: Gradient {
            GradientStop { position: 0.0; color: "#020617" } // slate-950
            GradientStop { position: 0.6; color: "#0b1220" } // slate-900
            GradientStop { position: 1.0; color: "#020617" } // slate-950
        }
    }

    // 앰비언트 글로우 1
    Rectangle {
        id: glowA
        width: 380; height: 380; radius: width/2
        anchors.left: parent.left; anchors.leftMargin: parent.width * 0.25 - width/2
        anchors.top: parent.top; anchors.topMargin: parent.height * 0.25 - height/2
        color: "#1acff3"   // cyan-500/10 비슷
        opacity: 0.12
        MultiEffect { anchors.fill: glowA; source: glowA; blurEnabled: true; blur: 0.9 }
        SequentialAnimation on scale {
            loops: Animation.Infinite
            NumberAnimation { to: 1.2; duration: 4000; easing.type: Easing.InOutQuad }
            NumberAnimation { to: 1.0; duration: 4000; easing.type: Easing.InOutQuad }
        }
        SequentialAnimation on opacity {
            loops: Animation.Infinite
            NumberAnimation { to: 0.5; duration: 4000; easing.type: Easing.InOutQuad }
            NumberAnimation { to: 0.12; duration: 4000; easing.type: Easing.InOutQuad }
        }
    }

    // 앰비언트 글로우 2
    Rectangle {
        id: glowB
        width: 380; height: 380; radius: width/2
        anchors.right: parent.right; anchors.rightMargin: parent.width * 0.25 - width/2
        anchors.bottom: parent.bottom; anchors.bottomMargin: parent.height * 0.25 - height/2
        color: "#3b82f6"   // blue-500/10 비슷
        opacity: 0.10
        MultiEffect { anchors.fill: glowB; source: glowB; blurEnabled: true; blur: 0.95 }
        SequentialAnimation on scale {
            loops: Animation.Infinite
            NumberAnimation { to: 1.15; duration: 5000; easing.type: Easing.InOutQuad }
            NumberAnimation { to: 1.0; duration: 5000; easing.type: Easing.InOutQuad }
        }
        SequentialAnimation on opacity {
            loops: Animation.Infinite
            NumberAnimation { to: 0.45; duration: 5000; easing.type: Easing.InOutQuad }
            NumberAnimation { to: 0.10; duration: 5000; easing.type: Easing.InOutQuad }
        }
    }

    // ====== 타이틀 ======
    Column {
        anchors.horizontalCenter: parent.horizontalCenter
        anchors.top: parent.top; anchors.topMargin: 120
        spacing: 8
        Text {
            text: "Choose Your Mode"
            color: "#e2e8f0"   // slate-200~300
            font.pixelSize: 64
            font.weight: Font.DemiBold
            horizontalAlignment: Text.AlignHCenter
            anchors.horizontalCenter: parent.horizontalCenter
        }
        Text {
            text: "Select with a tap or gesture"
            color: "#64748b"   // slate-500
            font.pixelSize: 20
            horizontalAlignment: Text.AlignHCenter
            anchors.horizontalCenter: parent.horizontalCenter
        }
    }

    // ====== 라디얼 메뉴 ======
    // 모드 정의
    readonly property var modes: [
        { id: "custom",  label: "Custom",          icon: "🎨", gradientA: "#8b5cf6", gradientB: "#ec4899" }, // purple→pink
        { id: "glass",   label: "Glass",           icon: "🌫️", gradientA: "#06b6d4", gradientB: "#3b82f6" }, // cyan→blue
        { id: "privacy", label: "Privacy",         icon: "🔒", gradientA: "#334155", gradientB: "#475569" }, // slate
        { id: "auto",    label: "Auto Recommend",  icon: "☀️", gradientA: "#f59e0b", gradientB: "#f97316" }  // amber→orange
    ]

    // 커서 좌표 (정규화 → 픽셀)
    property real cursorX: (typeof gestureBridge !== 'undefined' && gestureBridge.cursorX !== undefined)
                           ? gestureBridge.cursorX * width : width * 0.5
    property real cursorY: (typeof gestureBridge !== 'undefined' && gestureBridge.cursorY !== undefined)
                           ? gestureBridge.cursorY * height : height * 0.5

    // 현재 hover 중인 인덱스 (-1: 없음)
    property int hoveredIndex: -1

    // 버튼 원의 중심과 반경
    property real circleSize: 600
    property real radius: 240
    property real centerX: width/2
    property real centerY: height/2 + 80

    // hover 판정 임계거리(px)
    property real hoverThreshold: 140

    // 중심 장식
    Rectangle {
        id: centerDeco
        width: 96; height: 96; radius: 48
        anchors.centerIn: parent
        anchors.verticalCenterOffset: 80
        color: "#1ad1ff22" // cyan-500/20
        border.color: "#ffffff18"; border.width: 1
        MultiEffect { anchors.fill: centerDeco; source: centerDeco; blurEnabled: true; blur: 0.35 }
        SequentialAnimation on scale {
            loops: Animation.Infinite
            NumberAnimation { to: 1.05; duration: 2000; easing.type: Easing.InOutQuad }
            NumberAnimation { to: 1.0;  duration: 2000; easing.type: Easing.InOutQuad }
        }
        Rectangle {
            width: 48; height: 48; radius: 24
            anchors.centerIn: parent
            color: "#66d1ff33"
            MultiEffect { anchors.fill: parent; source: parent; blurEnabled: true; blur: 0.25 }
        }
    }

    // 4개 버튼 배치
    Repeater {
        model: modes.length
        delegate: Item {
            width: 176; height: 176
            property int idx: index
            property var m: modes[idx]
            property real angleDeg: (idx * 90) - 45   // 상단 우측부터 시계방향
            property real angle: angleDeg * Math.PI / 180
            x: centerX + radius * Math.cos(angle) - width/2
            y: centerY + radius * Math.sin(angle) - height/2

            // 카드 본체
            Rectangle {
                id: card
                anchors.fill: parent
                radius: 24
                border.color: "#ffffff18"; border.width: 1
                gradient: Gradient {
                    GradientStop { position: 0.0; color: m.gradientA + "33" } // xx/20 비슷
                    GradientStop { position: 1.0; color: m.gradientB + "33" }
                }
                // hover 시 스케일업/그로우
                scale: hoveredIndex === idx ? 1.1 : 1.0
                Behavior on scale { NumberAnimation { duration: 180; easing.type: Easing.OutCubic } }

                // 글로우
                MultiEffect {
                    anchors.fill: card
                    source: card
                    blurEnabled: true; blur: hoveredIndex === idx ? 0.35 : 0.2
                    shadowEnabled: true; shadowOpacity: hoveredIndex === idx ? 0.45 : 0.25
                }

                // 내용
                Column {
                    anchors.centerIn: parent
                    spacing: 8
                    Text {
                        text: m.icon
                        font.pixelSize: 56
                        horizontalAlignment: Text.AlignHCenter
                        anchors.horizontalCenter: parent.horizontalCenter
                    }
                    Text {
                        text: m.label
                        color: "white"
                        font.pixelSize: 20
                        font.weight: Font.Medium
                        horizontalAlignment: Text.AlignHCenter
                        anchors.horizontalCenter: parent.horizontalCenter
                    }
                    // 설명: hover 시만 노출
                    Text {
                        text: m.id === "custom"  ? "Personalize your display" :
                              m.id === "glass"   ? "Transparent ambient view" :
                              m.id === "privacy" ? "Focus & concentration" :
                                                   "Smart mood detection"
                        color: "#ffffff80"
                        font.pixelSize: 12
                        opacity: hoveredIndex === idx ? 1.0 : 0.0
                        Behavior on opacity { NumberAnimation { duration: 180 } }
                        horizontalAlignment: Text.AlignHCenter
                        anchors.horizontalCenter: parent.horizontalCenter
                    }
                }

                // 마우스 클릭(개발 편의)
                MouseArea {
                    anchors.fill: parent
                    hoverEnabled: true
                    onEntered: hoveredIndex = idx
                    onExited: if (hoveredIndex === idx) hoveredIndex = -1
                    onClicked: router.navigateTo(m.id)
                }
            }
        }
    }

    // ====== 커서 (mediapipe 제스처 포인터) ======
    Rectangle {
        id: cursor
        width: 32; height: 32; radius: 16
        x: cursorX - width/2
        y: cursorY - height/2
        color: "white"; opacity: 0.9
        visible: typeof gestureBridge !== 'undefined' && gestureBridge.handDetected
        MultiEffect { anchors.fill: cursor; source: cursor; blurEnabled: true; blur: 0.25; shadowEnabled: true; shadowOpacity: 0.4 }
        Behavior on scale { NumberAnimation { duration: 100 } }
        scale: hoveredIndex >= 0 ? 1.15 : 1.0
    }

    // ====== hover 판정 타이머 ======
    Timer {
        interval: 60; running: true; repeat: true
        onTriggered: {
            let best = -1
            let bestDist = 1e9
            for (let i=0; i<modes.length; ++i) {
                const angleDeg = (i * 90) - 45
                const angle = angleDeg * Math.PI / 180
                const cx = centerX + radius * Math.cos(angle)
                const cy = centerY + radius * Math.sin(angle)
                const dx = cursorX - cx
                const dy = cursorY - cy
                const d = Math.hypot(dx, dy)
                if (d < bestDist) { bestDist = d; best = i }
            }
            hoveredIndex = (bestDist < hoverThreshold) ? best : -1
        }
    }

    // ====== 제스처 이벤트: 주먹=클릭 → 선택 ======
    Connections {
        target: typeof gestureBridge !== 'undefined' ? gestureBridge : null
        function onFistDetected() {
            if (hoveredIndex >= 0) {
                const id = modes[hoveredIndex].id
                router.navigateTo(id)
            }
        }
    }

    // ====== 하단 힌트 ======
    Row {
        id: hintRow
        spacing: 8
        anchors.horizontalCenter: parent.horizontalCenter
        anchors.bottom: parent.bottom; anchors.bottomMargin: 24
        opacity: 0.0

        NumberAnimation on opacity {
            id: hintFadeIn
            from: 0; to: 1
            duration: 1000
            running: false
        }

        Text {
            id: hintEmoji
            text: "☝️"
            font.pixelSize: 20
            property real baseY: 0

            SequentialAnimation on y {
                id: emojiAnim
                loops: Animation.Infinite
                running: false
                NumberAnimation { to: hintEmoji.baseY - 5; duration: 1000; easing.type: Easing.InOutQuad }
                NumberAnimation { to: hintEmoji.baseY; duration: 1000; easing.type: Easing.InOutQuad }
            }
        }
        Text { text: "Hover to preview • Fist to select"; color: "#64748b"; font.pixelSize: 16 }
    }

    // 화면 로드 시 애니메이션 시작
    Timer {
        id: initTimer
        interval: 100
        running: true
        repeat: false
        onTriggered: {
            hintFadeIn.start()
            emojiAnim.start()
        }
    }
}
