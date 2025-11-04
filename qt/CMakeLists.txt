cmake_minimum_required(VERSION 3.16)

project(lumiscape VERSION 0.1 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_AUTORCC ON)

find_package(Qt6 REQUIRED COMPONENTS Quick)

qt_standard_project_setup(REQUIRES 6.8)

qt_add_executable(applumiscape
    main.cpp
)

qt_add_qml_module(applumiscape
    URI lumiscape
    VERSION 1.0
    QML_FILES
        qml/screens/Main.qml
        qml/screens/LoadingScreen.qml
        qml/screens/MenuScreen.qml
        RESOURCES myresources.qrc
)

# Qt for iOS sets MACOSX_BUNDLE_GUI_IDENTIFIER automatically since Qt 6.1.
# If you are developing for iOS or macOS you should consider setting an
# explicit, fixed bundle identifier manually though.
set_target_properties(applumiscape PROPERTIES
#    MACOSX_BUNDLE_GUI_IDENTIFIER com.example.applumiscape
    MACOSX_BUNDLE_BUNDLE_VERSION ${PROJECT_VERSION}
    MACOSX_BUNDLE_SHORT_VERSION_STRING ${PROJECT_VERSION_MAJOR}.${PROJECT_VERSION_MINOR}
    MACOSX_BUNDLE TRUE
    WIN32_EXECUTABLE TRUE
)

target_link_libraries(applumiscape
    PRIVATE Qt6::Quick
)

include(GNUInstallDirs)
install(TARGETS applumiscape
    BUNDLE DESTINATION .
    LIBRARY DESTINATION ${CMAKE_INSTALL_LIBDIR}
    RUNTIME DESTINATION ${CMAKE_INSTALL_BINDIR}
)
