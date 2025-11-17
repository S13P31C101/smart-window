import QtQuick 2.15
import QtQuick.Controls 2.15
import QtMultimedia
import "../components"
import "../widgets"
import "../styles"

Item {
    id: root

    // 장소 목록 정의 (표시명: 파일명)
    readonly property var locations: [
        {display: "mapleworld", file: "maple"},
        {display: "paris", file: "paris"},
        {display: "uyuni", file: "uyuni"},
        {display: "island", file: "island"}
    ]

    // 현재 선택된 장소
    property var currentLocation: null

    // 현재 시간대
    property string currentTimeOfDay: ""

    // 비디오 모드 토글
    property bool isVideoMode: false

    // Background music URL based on current location
    property string currentBackgroundMusicUrl: ""

    // 초기화: 랜덤 장소 선택
    Component.onCompleted: {
        selectRandomLocation()
        updateTimeOfDay()
        startTimeUpdateTimer()
    }

    // 랜덤 장소 선택 함수
    function selectRandomLocation() {
        var randomIndex = Math.floor(Math.random() * locations.length)
        currentLocation = locations[randomIndex]
        console.log("🌍 Selected location:", currentLocation.display)

        // 비디오 모드가 활성화되어 있고 해당 장소에 비디오가 없으면 이미지 모드로 전환
        if (isVideoMode && !hasLocationVideo(currentLocation)) {
            console.log("⚠️ No video for", currentLocation.display, "- switching to image mode")
            isVideoMode = false
        }

        backgroundImage.source = getSceneImage()
        updateBackgroundMusic()
    }

    // Update background music based on current location
    function updateBackgroundMusic() {
        if (!currentLocation) {
            currentBackgroundMusicUrl = ""
            return
        }

        var musicMap = appConfig.autoModeBackgroundMusic
        var locationKey = currentLocation.display

        if (musicMap && musicMap[locationKey]) {
            currentBackgroundMusicUrl = musicMap[locationKey]
            console.log("🎵 Background music for", locationKey, ":", currentBackgroundMusicUrl)
        } else {
            currentBackgroundMusicUrl = ""
            console.log("⚠️ No background music configured for", locationKey)
        }
    }

    // 다른 장소로 변경
    function changeLocation() {
        var availableLocations = locations.filter(function(loc) {
            return loc.display !== currentLocation.display
        })

        if (availableLocations.length > 0) {
            var randomIndex = Math.floor(Math.random() * availableLocations.length)
            currentLocation = availableLocations[randomIndex]
            console.log("🔄 Changed location to:", currentLocation.display)

            // 비디오 모드가 활성화되어 있고 해당 장소에 비디오가 없으면 이미지 모드로 전환
            if (isVideoMode && !hasLocationVideo(currentLocation)) {
                console.log("⚠️ No video for", currentLocation.display, "- switching to image mode")
                isVideoMode = false
            }

            // 배경 이미지 업데이트
            backgroundImage.source = getSceneImage()

            // 비디오 모드인 경우 비디오도 업데이트
            if (isVideoMode) {
                backgroundVideo.source = getSceneVideo()
            }

            // Update background music
            updateBackgroundMusic()
        }
    }

    // 현재 시간에 맞는 시간대 계산
    function updateTimeOfDay() {
        var now = new Date()
        var hours = now.getHours()
        var minutes = now.getMinutes()
        var totalMinutes = hours * 60 + minutes

        // 시간대 구분
        // 새벽: 04:30 ~ 06:00 (270분 ~ 360분)
        // 아침: 06:00 ~ 10:00 (360분 ~ 600분)
        // 낮: 10:00 ~ 17:00 (600분 ~ 1020분)
        // 저녁: 17:00 ~ 20:00 (1020분 ~ 1200분)
        // 밤: 20:00 ~ 04:30 (1200분 ~ 270분)

        var newTimeOfDay = ""

        if (totalMinutes >= 270 && totalMinutes < 360) {
            newTimeOfDay = "dawn"
        } else if (totalMinutes >= 360 && totalMinutes < 600) {
            newTimeOfDay = "morning"
        } else if (totalMinutes >= 600 && totalMinutes < 1020) {
            newTimeOfDay = "daytime"
        } else if (totalMinutes >= 1020 && totalMinutes < 1200) {
            newTimeOfDay = "evening"
        } else {
            newTimeOfDay = "night"
        }

        if (newTimeOfDay !== currentTimeOfDay) {
            currentTimeOfDay = newTimeOfDay
            console.log("⏰ Time of day changed to:", currentTimeOfDay)
            backgroundImage.source = getSceneImage()

            if (isVideoMode) {
                backgroundVideo.source = getSceneVideo()
            }
        }
    }

    // 1분마다 시간 업데이트
    function startTimeUpdateTimer() {
        timeUpdateTimer.start()
    }

    Timer {
        id: timeUpdateTimer
        interval: 60000 // 1분
        running: false
        repeat: true
        onTriggered: updateTimeOfDay()
    }

    // 장소별 시간대 이미지 경로 생성
    function getSceneImage() {
        if (!currentLocation || !currentTimeOfDay) {
            return "qrc:/assets/images/scenes/default.png"
        }

        // 파일명 사용 (file 속성)
        var fileName = currentLocation.file
        var folderName = currentLocation.display

        var imagePath = "qrc:/assets/images/scenes/" + folderName + "/" + currentTimeOfDay + "_" + fileName + ".png"

        console.log("🖼️ Loading image:", imagePath)

        return imagePath
    }

    // 장소별 비디오 존재 여부 확인
    function hasLocationVideo(location) {
        // 현재는 default.mp4만 있으므로 모든 장소에 대해 false 반환
        // 추후 장소별 비디오가 추가되면 이 함수 수정
        return false
    }

    // 비디오 경로 생성
    function getSceneVideo() {
        // 현재는 default 비디오만 사용
        var videoPath = "file://" + appConfig.applicationDirPath + "/assets/videos/scenes/default.mp4"
        console.log("🎥 Loading video:", videoPath)
        return videoPath
    }

    // ========== 배경 이미지 ==========
    Image {
        id: backgroundImage
        anchors.fill: parent
        source: getSceneImage()
        fillMode: Image.PreserveAspectCrop
        visible: !isVideoMode
        cache: false

        // 부드러운 전환 효과
        Behavior on source {
            SequentialAnimation {
                NumberAnimation { target: backgroundImage; property: "opacity"; to: 0; duration: 500 }
                PropertyAction { target: backgroundImage; property: "source" }
                NumberAnimation { target: backgroundImage; property: "opacity"; to: 1; duration: 500 }
            }
        }

        onStatusChanged: {
            if (status === Image.Error) {
                console.error("❌ Failed to load image:", source)
                // Fallback to default
                source = "qrc:/assets/images/scenes/default.png"
            } else if (status === Image.Ready) {
                console.log("✅ Image loaded successfully")
            }
        }
    }

    // ========== 배경 비디오 ==========
    Video {
        id: backgroundVideo
        anchors.fill: parent
        source: getSceneVideo()
        fillMode: VideoOutput.PreserveAspectCrop
        visible: isVideoMode
        autoPlay: true
        loops: MediaPlayer.Infinite
        muted: true
        playbackRate: 0.2

        opacity: visible ? 1.0 : 0.0
        Behavior on opacity {
            NumberAnimation { duration: 500 }
        }

        onErrorOccurred: function(error, errorString) {
            console.error("❌ Video error:", error, "-", errorString)
            isVideoMode = false
        }
    }

    // ========== 오버레이 그라디언트 (위젯 가독성 향상) ==========
    Rectangle {
        anchors.fill: parent
        gradient: Gradient {
            GradientStop { position: 0.0; color: "transparent" }
            GradientStop { position: 1.0; color: Theme.backgroundDark }
        }
        opacity: 0.4
    }

    // ========== 중앙 상단 위젯 영역 ==========
    Column {
        anchors.horizontalCenter: parent.horizontalCenter
        anchors.top: parent.top
        anchors.topMargin: parent.height * 0.12
        spacing: root.height * 0.035

        ClockWidget {
            anchors.horizontalCenter: parent.horizontalCenter
        }

        WeatherWidget {
            anchors.horizontalCenter: parent.horizontalCenter
        }

        QuoteWidget {
            anchors.horizontalCenter: parent.horizontalCenter
        }
    }

    // ========== 하단 YouTube Background Music ==========
    YouTubePlayer {
        id: youtubePlayer
        youtubeUrl: root.currentBackgroundMusicUrl

        anchors.horizontalCenter: parent.horizontalCenter
        anchors.bottom: changeViewButton.top
        anchors.bottomMargin: parent.height * 0.03
        visible: root.currentBackgroundMusicUrl !== ""

        width: Math.min(parent.width * 0.45, 500)  // Compact size
        height: 160

        onPlayerReady: {
            console.log("Background music player ready in Auto Mode")
        }
    }

    // ========== Change View 버튼 (중앙 하단) ==========
    GestureControlledUI {
        id: changeViewButton
        anchors.horizontalCenter: parent.horizontalCenter
        anchors.bottom: parent.bottom
        anchors.bottomMargin: parent.height * 0.03

        MinimalButton {
            text: "🔄 Change View"
            implicitWidth: root.width * 0.16
            implicitHeight: root.height * 0.055
            buttonRadius: 28
            onClicked: {
                changeLocation()
            }
        }
    }

    // ========== Back 버튼 (좌측 중앙) ==========
    GestureControlledUI {
        anchors.left: root.left
        anchors.verticalCenter: root.verticalCenter
        anchors.margins: root.width * 0.03

        MinimalButton {
            text: "← Menu"
            implicitWidth: root.width * 0.12
            implicitHeight: root.height * 0.055
            buttonRadius: 28
            onClicked: router.navigateTo("menu")
        }
    }

    // ========== Image/Video 토글 버튼 (우측 중앙) ==========
    GestureControlledUI {
        anchors.right: root.right
        anchors.verticalCenter: root.verticalCenter
        anchors.margins: root.width * 0.03

        MinimalButton {
            id: mediaToggleButton
            text: isVideoMode ? "📷 Image" : "🎥 Video"
            implicitWidth: root.width * 0.14
            implicitHeight: root.height * 0.055
            buttonRadius: 28

            // 해당 장소에 비디오가 없으면 버튼 비활성화
            enabled: hasLocationVideo(currentLocation) || !isVideoMode
            opacity: enabled ? 1.0 : 0.5

            onClicked: {
                if (hasLocationVideo(currentLocation) || isVideoMode) {
                    isVideoMode = !isVideoMode
                    console.log(isVideoMode ? "🎥 Switched to video mode" : "📷 Switched to image mode")
                } else {
                    console.log("⚠️ No video available for location:", currentLocation)
                }
            }
        }
    }

    // ========== 비디오 로딩 인디케이터 ==========
    Rectangle {
        anchors.centerIn: parent
        width: 60
        height: 60
        radius: 30
        color: Theme.backgroundDark
        opacity: 0.8
        visible: isVideoMode && backgroundVideo.playbackState !== MediaPlayer.PlayingState

        BusyIndicator {
            anchors.centerIn: parent
            running: parent.visible
        }
    }

    // ========== 현재 장소 및 시간대 표시 (디버그용) ==========
    Rectangle {
        anchors.top: parent.top
        anchors.right: parent.right
        anchors.margins: 10
        width: debugText.width + 20
        height: debugText.height + 10
        color: "#000000"
        radius: 8
        visible: true  // 디버그 활성화

        Text {
            id: debugText
            anchors.centerIn: parent
            text: (currentLocation ? currentLocation.display : "none") + " / " + currentTimeOfDay
            color: "#ffffff"
            font.pixelSize: 14
        }
    }
}
