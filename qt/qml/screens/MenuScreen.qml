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
        // 초기 상태만 설정 (애니메이션 속성은 건드리지 않음)
        hoveredIndex = -1
    }

    Component.onDestruction: {
        console.log("MenuScreen unloaded")
    }

    // 화면이 보일 때만 애니메이션 실행
    visible: true

    // ====== 배경 ======
    Rectangle {
        anchors.fill: parent
        gradient: Gradient {
            GradientStop { position: 0.0; color: "#cbd5e1" } // slate-300
            GradientStop { position: 0.5; color: "#e2e8f0" } // slate-200
            GradientStop { position: 1.0; color: "#cbd5e1" } // slate-300
        }
    }

    // 앰비언트 글로우 1 (반응형) - 밝은 배경용
    Rectangle {
        id: glowA
        property real glowSize: Math.min(root.width, root.height) * 0.35
        width: glowSize; height: glowSize; radius: width/2
        anchors.left: parent.left
        anchors.leftMargin: parent.width * 0.25 - width/2
        anchors.top: parent.top
        anchors.topMargin: parent.height * 0.25 - height/2
        color: "#a78bfa"   // purple-400
        opacity: 0.15
        layer.enabled: true
        layer.effect: MultiEffect {
            blurEnabled: true
            blur: 0.9
        }
        SequentialAnimation on scale {
            loops: Animation.Infinite
            NumberAnimation { to: 1.2; duration: 4000; easing.type: Easing.InOutQuad }
            NumberAnimation { to: 1.0; duration: 4000; easing.type: Easing.InOutQuad }
        }
        SequentialAnimation on opacity {
            loops: Animation.Infinite
            NumberAnimation { to: 0.25; duration: 4000; easing.type: Easing.InOutQuad }
            NumberAnimation { to: 0.15; duration: 4000; easing.type: Easing.InOutQuad }
        }
    }

    // 앰비언트 글로우 2 (반응형) - 밝은 배경용
    Rectangle {
        id: glowB
        property real glowSize: Math.min(root.width, root.height) * 0.35
        width: glowSize; height: glowSize; radius: width/2
        anchors.right: parent.right
        anchors.rightMargin: parent.width * 0.25 - width/2
        anchors.bottom: parent.bottom
        anchors.bottomMargin: parent.height * 0.25 - height/2
        color: "#7dd3fc"   // sky-300
        opacity: 0.15
        layer.enabled: true
        layer.effect: MultiEffect {
            blurEnabled: true
            blur: 0.95
        }
        SequentialAnimation on scale {
            loops: Animation.Infinite
            NumberAnimation { to: 1.15; duration: 5000; easing.type: Easing.InOutQuad }
            NumberAnimation { to: 1.0; duration: 5000; easing.type: Easing.InOutQuad }
        }
        SequentialAnimation on opacity {
            loops: Animation.Infinite
            NumberAnimation { to: 0.25; duration: 5000; easing.type: Easing.InOutQuad }
            NumberAnimation { to: 0.15; duration: 5000; easing.type: Easing.InOutQuad }
        }
    }

    // ====== 타이틀 (반응형) ======
    Column {
        anchors.horizontalCenter: parent.horizontalCenter
        anchors.top: parent.top
        anchors.topMargin: root.height * 0.063
        spacing: root.height * 0.004
        Text {
            text: "Choose Your Mode"
            color: "#1e293b"   // slate-800
            font.pixelSize: Math.min(root.width, root.height) * 0.059
            font.weight: Font.DemiBold
            horizontalAlignment: Text.AlignHCenter
            anchors.horizontalCenter: parent.horizontalCenter
        }
        Text {
            text: "Select with a tap or gesture"
            color: "#64748b"   // slate-500
            font.pixelSize: Math.min(root.width, root.height) * 0.0185
            horizontalAlignment: Text.AlignHCenter
            anchors.horizontalCenter: parent.horizontalCenter
        }
    }

    // ====== 그리드 메뉴 ======
    // 모드 정의
    readonly property var modes: [
        { id: "custom",  label: "Custom Mode",  icon: "🎨", gradientA: "#a78bfa", gradientB: "#7dd3fc", textColor: "#1e293b" }, // purple→blue
        { id: "auto",    label: "Auto Mode",    icon: "💡", gradientA: "#3b82f6", gradientB: "#60a5fa", textColor: "#1e3a8a" }, // blue-600→blue-400
        { id: "privacy", label: "Privacy Mode", icon: "🔒", gradientA: "#fcd34d", gradientB: "#fbbf24", textColor: "#78350f" }, // yellow-300→yellow-400
        { id: "glass",   label: "Glass Mode",   icon: "🌫️", gradientA: "#fb923c", gradientB: "#fbbf24", textColor: "#78350f" }  // orange→yellow
    ]

    // 커서 좌표 (정규화 → 픽셀)
    property real cursorX: (typeof gestureBridge !== 'undefined' && gestureBridge.cursorX !== undefined)
                           ? gestureBridge.cursorX * width : width * 0.5
    property real cursorY: (typeof gestureBridge !== 'undefined' && gestureBridge.cursorY !== undefined)
                           ? gestureBridge.cursorY * height : height * 0.5

    // 현재 hover 중인 인덱스 (-1: 없음)
    property int hoveredIndex: -1

    // 그리드 컨테이너 (흰색 둥근 배경)
    Rectangle {
        id: gridContainer
        width: Math.min(root.width * 0.85, root.height * 0.5)
        height: width
        anchors.centerIn: parent
        anchors.verticalCenterOffset: root.height * 0.05
        radius: 32
        color: "#f8fafc" // 밝은 회색-흰색
        border.color: "#e2e8f0"
        border.width: 2

        layer.enabled: true
        layer.effect: MultiEffect {
            shadowEnabled: true
            shadowOpacity: 0.15
            shadowBlur: 1.0
            shadowColor: "#000000"
        }

        // 2x2 그리드
        Grid {
            id: grid
            columns: 2
            rows: 2
            spacing: gridContainer.width * 0.04
            anchors.centerIn: parent
            anchors.margins: gridContainer.width * 0.06

            Repeater {
                model: modes.length
                delegate: Rectangle {
                    id: card
                    property int idx: index
                    property var m: modes[idx]
                    width: (gridContainer.width - grid.spacing - gridContainer.width * 0.12) / 2
                    height: width
                    radius: 20

                    gradient: Gradient {
                        GradientStop { position: 0.0; color: m.gradientA }
                        GradientStop { position: 1.0; color: m.gradientB }
                    }

                    // 투명도 적용
                    opacity: 0.75

                    // hover 시 스케일업
                    scale: hoveredIndex === idx ? 1.05 : 1.0
                    Behavior on scale { NumberAnimation { duration: 180; easing.type: Easing.OutCubic } }

                    layer.enabled: true
                    layer.effect: MultiEffect {
                        shadowEnabled: true
                        shadowOpacity: hoveredIndex === idx ? 0.3 : 0.15
                        shadowBlur: 0.8
                        shadowColor: "#000000"
                    }

                    // 카드 내용
                    Column {
                        anchors.centerIn: parent
                        spacing: card.height * 0.08

                        // 아이콘
                        Text {
                            text: m.icon
                            font.pixelSize: card.height * 0.3
                            horizontalAlignment: Text.AlignHCenter
                            anchors.horizontalCenter: parent.horizontalCenter
                        }

                        // 라벨 (단순 텍스트)
                        Text {
                            text: m.label
                            color: m.textColor
                            font.pixelSize: card.height * 0.1
                            font.weight: Font.DemiBold
                            horizontalAlignment: Text.AlignHCenter
                            anchors.horizontalCenter: parent.horizontalCenter
                        }
                    }

                    // 마우스 클릭 (개발 편의)
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
    }

    // ====== 커서 (mediapipe 제스처 포인터, 반응형) ======
    Rectangle {
        id: cursor
        property real cursorSize: Math.min(root.width, root.height) * 0.02
        width: cursorSize; height: cursorSize; radius: cursorSize/2
        x: cursorX - width/2
        y: cursorY - height/2
        color: "#3b82f6" // 파란색
        opacity: 0.9
        visible: typeof gestureBridge !== 'undefined' && gestureBridge.handDetected
        layer.enabled: true
        layer.effect: MultiEffect {
            shadowEnabled: true
            shadowOpacity: 0.6
            shadowBlur: 0.5
            shadowColor: "#1e40af"
        }
        Behavior on scale { NumberAnimation { duration: 100 } }
        scale: hoveredIndex >= 0 ? 1.3 : 1.0
    }

    // ====== hover 판정 타이머 ======
    Timer {
        interval: 60; running: true; repeat: true
        onTriggered: {
            // 그리드 컨테이너가 준비되지 않았으면 스킵
            if (!gridContainer || gridContainer.width === 0) return

            let best = -1
            let bestDist = 1e9

            // 카드 크기와 그리드 계산
            const cardWidth = (gridContainer.width - grid.spacing - gridContainer.width * 0.12) / 2
            const cardHeight = cardWidth
            const containerX = gridContainer.x
            const containerY = gridContainer.y
            const padding = gridContainer.width * 0.06

            for (let i = 0; i < modes.length; ++i) {
                const row = Math.floor(i / 2)
                const col = i % 2

                // 각 카드의 중심 위치 계산
                const cx = containerX + padding + col * (cardWidth + grid.spacing) + cardWidth / 2
                const cy = containerY + padding + row * (cardHeight + grid.spacing) + cardHeight / 2

                const dx = cursorX - cx
                const dy = cursorY - cy
                const d = Math.hypot(dx, dy)

                if (d < bestDist) {
                    bestDist = d
                    best = i
                }
            }

            // hover 임계값: 카드 크기의 절반 정도
            const hoverThreshold = cardWidth * 0.6
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

    // ====== 제어 버튼 (모드 선택 밑) ======
    Row {
        id: controlButtons
        spacing: root.width * 0.02
        anchors.horizontalCenter: parent.horizontalCenter
        anchors.top: gridContainer.bottom
        anchors.topMargin: root.height * 0.04

        // Power OFF 버튼
        Rectangle {
            width: root.width * 0.22
            height: root.height * 0.045
            radius: 12
            color: "#ef4444" // red
            border.color: "#dc2626"
            border.width: 2

            layer.enabled: true
            layer.effect: MultiEffect {
                shadowEnabled: true
                shadowOpacity: 0.2
                shadowBlur: 0.5
                shadowColor: "#000000"
            }

            Row {
                anchors.centerIn: parent
                spacing: 8

                Text {
                    text: "⏻"
                    color: "white"
                    font.pixelSize: parent.parent.height * 0.45
                    anchors.verticalCenter: parent.verticalCenter
                }

                Text {
                    text: "Power OFF"
                    color: "white"
                    font.pixelSize: parent.parent.height * 0.35
                    font.weight: Font.Bold
                    anchors.verticalCenter: parent.verticalCenter
                }
            }

            MouseArea {
                anchors.fill: parent
                cursorShape: Qt.PointingHandCursor
                onClicked: {
                    var topic = "/devices/" + appConfig.deviceUniqueId + "/command/power"
                    var payload = { "status": false }
                    mqttClient.publishJson(topic, payload, 1)
                    console.log("📤 Power OFF →", topic, payload)
                }
            }

            scale: controlMa1.pressed ? 0.95 : (controlMa1.containsMouse ? 1.05 : 1.0)
            Behavior on scale { NumberAnimation { duration: 150; easing.type: Easing.OutCubic } }

            MouseArea {
                id: controlMa1
                anchors.fill: parent
                hoverEnabled: true
                onClicked: parent.children[2].clicked()
            }
        }

        // Open Window 버튼
        Rectangle {
            width: root.width * 0.22
            height: root.height * 0.045
            radius: 12
            color: "#3b82f6" // blue
            border.color: "#2563eb"
            border.width: 2

            layer.enabled: true
            layer.effect: MultiEffect {
                shadowEnabled: true
                shadowOpacity: 0.2
                shadowBlur: 0.5
                shadowColor: "#000000"
            }

            Row {
                anchors.centerIn: parent
                spacing: 8

                Text {
                    text: "🪟"
                    color: "white"
                    font.pixelSize: parent.parent.height * 0.45
                    anchors.verticalCenter: parent.verticalCenter
                }

                Text {
                    text: "Open"
                    color: "white"
                    font.pixelSize: parent.parent.height * 0.35
                    font.weight: Font.Bold
                    anchors.verticalCenter: parent.verticalCenter
                }
            }

            MouseArea {
                anchors.fill: parent
                cursorShape: Qt.PointingHandCursor
                onClicked: {
                    var topic = "/devices/" + appConfig.deviceUniqueId + "/command/open"
                    var payload = { "status": true }
                    mqttClient.publishJson(topic, payload, 1)
                    console.log("📤 Open Window →", topic, payload)
                }
            }

            scale: controlMa2.pressed ? 0.95 : (controlMa2.containsMouse ? 1.05 : 1.0)
            Behavior on scale { NumberAnimation { duration: 150; easing.type: Easing.OutCubic } }

            MouseArea {
                id: controlMa2
                anchors.fill: parent
                hoverEnabled: true
                onClicked: parent.children[2].clicked()
            }
        }

        // Close Window 버튼
        Rectangle {
            width: root.width * 0.22
            height: root.height * 0.045
            radius: 12
            color: "#f59e0b" // amber
            border.color: "#d97706"
            border.width: 2

            layer.enabled: true
            layer.effect: MultiEffect {
                shadowEnabled: true
                shadowOpacity: 0.2
                shadowBlur: 0.5
                shadowColor: "#000000"
            }

            Row {
                anchors.centerIn: parent
                spacing: 8

                Text {
                    text: "🪟"
                    color: "white"
                    font.pixelSize: parent.parent.height * 0.45
                    anchors.verticalCenter: parent.verticalCenter
                }

                Text {
                    text: "Close"
                    color: "white"
                    font.pixelSize: parent.parent.height * 0.35
                    font.weight: Font.Bold
                    anchors.verticalCenter: parent.verticalCenter
                }
            }

            MouseArea {
                anchors.fill: parent
                cursorShape: Qt.PointingHandCursor
                onClicked: {
                    var topic = "/devices/" + appConfig.deviceUniqueId + "/command/open"
                    var payload = { "status": false }
                    mqttClient.publishJson(topic, payload, 1)
                    console.log("📤 Close Window →", topic, payload)
                }
            }

            scale: controlMa3.pressed ? 0.95 : (controlMa3.containsMouse ? 1.05 : 1.0)
            Behavior on scale { NumberAnimation { duration: 150; easing.type: Easing.OutCubic } }

            MouseArea {
                id: controlMa3
                anchors.fill: parent
                hoverEnabled: true
                onClicked: parent.children[2].clicked()
            }
        }
    }

    // ====== 하단 힌트 (반응형) ======
    Row {
        id: hintRow
        spacing: root.width * 0.0074
        anchors.horizontalCenter: parent.horizontalCenter
        anchors.bottom: parent.bottom
        anchors.bottomMargin: root.height * 0.0125
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
            font.pixelSize: Math.min(root.width, root.height) * 0.0185
            property real baseY: 0

            SequentialAnimation on y {
                id: emojiAnim
                loops: Animation.Infinite
                running: false
                NumberAnimation { to: hintEmoji.baseY - root.height * 0.0026; duration: 1000; easing.type: Easing.InOutQuad }
                NumberAnimation { to: hintEmoji.baseY; duration: 1000; easing.type: Easing.InOutQuad }
            }
        }
        Text {
            text: "Hover to preview • Fist to select"
            color: "#64748b"
            font.pixelSize: Math.min(root.width, root.height) * 0.0148
        }
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
