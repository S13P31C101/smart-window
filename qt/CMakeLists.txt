cmake_minimum_required(VERSION 3.21)

project(Lumiscape
    VERSION 1.0.0
    DESCRIPTION "Smart Glass UI System with Gesture Control"
    LANGUAGES CXX
)

# ============================================================================
# Build Configuration
# ============================================================================
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

set(CMAKE_AUTOMOC ON)
set(CMAKE_AUTORCC ON)
set(CMAKE_AUTOUIC ON)

# Optimize for embedded systems
if(CMAKE_BUILD_TYPE STREQUAL "Release")
    set(CMAKE_CXX_FLAGS_RELEASE "${CMAKE_CXX_FLAGS_RELEASE} -O3 -DNDEBUG")
endif()

# ============================================================================
# Qt Dependencies
# ============================================================================
# Recommended: Qt 6.5.3 LTS for embedded systems
find_package(Qt6 6.5 REQUIRED COMPONENTS
    Core
    Quick
    QuickControls2
    Qml
    Network
    Mqtt
    Multimedia
    Svg
)

qt_standard_project_setup(REQUIRES 6.5)

# ============================================================================
# Source Files
# ============================================================================
set(PROJECT_SOURCES
    src/main.cpp

    # Core
    src/core/AppConfig.h
    src/core/AppConfig.cpp
    src/core/Router.h
    src/core/Router.cpp
    src/core/GestureBridge.h
    src/core/GestureBridge.cpp
    src/core/MediaPipeClient.h
    src/core/MediaPipeClient.cpp
    src/core/MqttClient.h
    src/core/MqttClient.cpp
    src/core/RestClient.h
    src/core/RestClient.cpp
    src/core/SensorBus.h
    src/core/SensorBus.cpp

    # Widgets
    src/widgets/WidgetRegistry.h
    src/widgets/WidgetRegistry.cpp
    src/widgets/ClockProvider.h
    src/widgets/ClockProvider.cpp
    src/widgets/WeatherProvider.h
    src/widgets/WeatherProvider.cpp
    src/widgets/SpotifyProvider.h
    src/widgets/SpotifyProvider.cpp

    # Integrations
    src/integrations/SpotifyAuthHelper.h
    src/integrations/SpotifyAuthHelper.cpp
)

# ============================================================================
# QML Files
# ============================================================================
set(PROJECT_QML_FILES
    # Main
    qml/Main.qml

    # Screens
    qml/screens/LoadingScreen.qml
    qml/screens/MenuScreen.qml
    qml/screens/CustomModeScreen.qml
    qml/screens/GlassModeScreen.qml
    qml/screens/PrivacyModeScreen.qml
    qml/screens/AutoModeScreen.qml

    # Components
    qml/components/GestureCursor.qml
    qml/components/RadialMenu.qml
    qml/components/AmbientGlow.qml
    qml/components/GlassCard.qml

    # Widgets
    qml/widgets/ClockWidget.qml
    qml/widgets/WeatherWidget.qml
    qml/widgets/SpotifyWidget.qml
    qml/widgets/QuoteWidget.qml

    # Styles
    qml/styles/Theme.qml
    qml/styles/Effects.qml
)

# ============================================================================
# Resources
# ============================================================================
set(PROJECT_RESOURCES
    resources/lumiscape.qrc
)

# ============================================================================
# Executable
# ============================================================================
qt_add_executable(Lumiscape
    ${PROJECT_SOURCES}
)

# QML Module
qt_add_qml_module(Lumiscape
    URI com.lumiscape.ui
    VERSION 1.0
    QML_FILES ${PROJECT_QML_FILES}
    RESOURCES ${PROJECT_RESOURCES}
    RESOURCE_PREFIX /
)

# ============================================================================
# Include Directories
# ============================================================================
target_include_directories(Lumiscape PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}/src
    ${CMAKE_CURRENT_SOURCE_DIR}/src/core
    ${CMAKE_CURRENT_SOURCE_DIR}/src/widgets
    ${CMAKE_CURRENT_SOURCE_DIR}/src/integrations
)

# ============================================================================
# Linking
# ============================================================================
target_link_libraries(Lumiscape PRIVATE
    Qt6::Core
    Qt6::Quick
    Qt6::QuickControls2
    Qt6::Qml
    Qt6::Network
    Qt6::Mqtt
    Qt6::Multimedia
    Qt6::Svg
)

# ============================================================================
# Deployment
# ============================================================================
set_target_properties(Lumiscape PROPERTIES
    MACOSX_BUNDLE_GUI_IDENTIFIER com.lumiscape.app
    MACOSX_BUNDLE_BUNDLE_VERSION ${PROJECT_VERSION}
    MACOSX_BUNDLE_SHORT_VERSION_STRING ${PROJECT_VERSION_MAJOR}.${PROJECT_VERSION_MINOR}
    MACOSX_BUNDLE TRUE
    WIN32_EXECUTABLE TRUE
)

# Copy Python scripts to build directory
add_custom_command(TARGET Lumiscape POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_directory
        ${CMAKE_SOURCE_DIR}/python
        $<TARGET_FILE_DIR:Lumiscape>/python
    COMMENT "Copying Python MediaPipe module to build directory"
)

# Copy assets to build directory
add_custom_command(TARGET Lumiscape POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_directory
        ${CMAKE_SOURCE_DIR}/assets
        $<TARGET_FILE_DIR:Lumiscape>/assets
    COMMENT "Copying assets to build directory"
)

# ============================================================================
# Installation
# ============================================================================
include(GNUInstallDirs)

install(TARGETS Lumiscape
    BUNDLE DESTINATION .
    LIBRARY DESTINATION ${CMAKE_INSTALL_LIBDIR}
    RUNTIME DESTINATION ${CMAKE_INSTALL_BINDIR}
)

install(DIRECTORY python/
    DESTINATION ${CMAKE_INSTALL_BINDIR}/python
    FILES_MATCHING PATTERN "*.py"
)

install(DIRECTORY assets/
    DESTINATION ${CMAKE_INSTALL_DATADIR}/lumiscape/assets
)

# ============================================================================
# Development Helpers
# ============================================================================
option(LUMISCAPE_BUILD_TESTS "Build unit tests" OFF)
option(LUMISCAPE_ENABLE_LOGGING "Enable detailed logging" ON)

if(LUMISCAPE_ENABLE_LOGGING)
    target_compile_definitions(Lumiscape PRIVATE LUMISCAPE_LOGGING_ENABLED)
endif()

# Print configuration summary
message(STATUS "")
message(STATUS "Lumiscape Configuration Summary")
message(STATUS "================================")
message(STATUS "Version: ${PROJECT_VERSION}")
message(STATUS "Build Type: ${CMAKE_BUILD_TYPE}")
message(STATUS "Qt Version: ${Qt6_VERSION}")
message(STATUS "C++ Standard: ${CMAKE_CXX_STANDARD}")
message(STATUS "Logging: ${LUMISCAPE_ENABLE_LOGGING}")
message(STATUS "")
