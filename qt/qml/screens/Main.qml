// qml/Main.qml
import QtQuick
import QtQuick.Controls

ApplicationWindow {
    id: win
    visible: true
    width: 1080
    height: 1920
    title: "Lumiscape Display"

    // Router 객체로 화면 전환
    property string currentScreen: "LoadingScreen"

    // Loader로 화면 전환
    Loader {
        id: screenLoader
        anchors.fill: parent
        sourceComponent: {
            switch (currentScreen) {
            case "LoadingScreen": return loadingComp
            case "MenuScreen": return menuComp
            default: return menuComp
            }
        }
    }

    // Loading 화면 컴포넌트
    Component {
        id: loadingComp
        Loader {
            source: "qrc:/Lumiscape/qml/screens/LoadingScreen.qml"
            onLoaded: {
                item.complete.connect(() => {
                    currentScreen = "MenuScreen"  // 로딩 화면 완료 후 MenuScreen으로 전환
                })
            }
        }
    }

    // Menu 화면 컴포넌트
    Component {
        id: menuComp
        Loader {
            source: "qrc:/Lumiscape/qml/screens/MenuScreen.qml"
        }
    }
}
