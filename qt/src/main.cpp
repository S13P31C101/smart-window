#include <QGuiApplication>
#include <QQmlApplicationEngine>
#include <QQmlContext>
#include <QQuickStyle>
#include <QIcon>
#include <QTimer>
// #include <QtWebEngineQuick/QtWebEngineQuick> -> Don't use at rasp

#include "core/AppConfig.h"
#include "core/Router.h"
#include "core/GestureBridge.h"
#include "core/MediaPipeClient.h"
#include "core/MqttClient.h"
#include "core/RestClient.h"
#include "core/SensorBus.h"
#include "core/AlarmManager.h"
#include "widgets/WidgetRegistry.h"
#include "widgets/ClockProvider.h"
#include "widgets/WeatherProvider.h"
// Spotify removed - using YouTube for background music
// #include "widgets/SpotifyProvider.h"
// #include "widgets/SpotifyWebBridge.h"
// #include "integrations/SpotifyAuthHelper.h"
#include "widgets/YouTubeProvider.h"
#include "widgets/SensorManager.h"
#include "hardware/PDLCController.h"
#include "hardware/WindowController.h"

int main(int argc, char *argv[])
{
    // ========================================================================
    // WebEngine Initialization (must be called before QGuiApplication)
    // ========================================================================
    // QtWebEngineQuick::initialize(); -> Don't use at rasp

    // ========================================================================
    // Application Setup
    // ========================================================================
    QGuiApplication app(argc, argv);

    app.setOrganizationName("Lumiscape");
    app.setOrganizationDomain("lumiscape.com");
    app.setApplicationName("Lumiscape Smart Glass");
    app.setApplicationVersion("1.0.0");

    // Set Material style for modern UI
    QQuickStyle::setStyle("Material");

    // ========================================================================
    // Core System Initialization
    // ========================================================================

    // Configuration loader
    AppConfig config;
    if (!config.load("assets/presets/config.json")) {
        qWarning() << "Failed to load config, using defaults";
    }

    // Router for screen navigation
    Router router;

    // Gesture control bridge
    GestureBridge gestureBridge;

    // MediaPipe client for gesture recognition
    MediaPipeClient mediaPipeClient;
    QObject::connect(&mediaPipeClient, &MediaPipeClient::gestureDataReceived,
                     &gestureBridge, &GestureBridge::updateGesture);

    // ========================================================================
    // Hardware Control Setup
    // ========================================================================

    // PDLC controller for smart glass transparency
    auto pdlcController = new PDLCController(&app);
    qInfo() << "PDLC Controller created, ready status:" << pdlcController->isReady();

    // Window controller for automatic window opener/closer
    auto windowController = new WindowController(&app);
    qInfo() << "Window Controller created, connected status:" << windowController->isConnected();

    // MQTT client for IoT communication
    MqttClient mqttClient;
    mqttClient.connectToHost(
        config.mqttHost(),
        config.mqttPort(),
        config.mqttUsername(),
        config.mqttPassword(),
        config.mqttUseTls()
    );

    // Configure Router to publish mode status via MQTT
    router.setMqttClient(&mqttClient, config.deviceUniqueId());

    // ========================================================================
    // YouTube Provider Setup (needed for MQTT music commands)
    // ========================================================================

    auto youtubeProvider = new YouTubeProvider(&app);

    // ========================================================================
    // Alarm Manager Setup
    // ========================================================================

    auto alarmManager = new AlarmManager(&app);
    alarmManager->initialize("alarms.json");

    // Connect alarm manager MQTT publish requests to MQTT client
    QObject::connect(alarmManager, &AlarmManager::publishMqttRequest,
                     &mqttClient, [&mqttClient](const QString &topic, const QString &payload) {
        mqttClient.publish(topic, payload, 1);
    });

    // When alarm is triggered, navigate to alarm screen
    QObject::connect(alarmManager, &AlarmManager::alarmTriggered,
                     &router, [&router](const QVariantMap &alarm) {
        Q_UNUSED(alarm)
        qInfo() << "Navigating to alarm screen...";
        router.navigateTo("alarm");
    });

    // Handle alarm list messages (JSON array) - for messageReceived signal
    QObject::connect(&mqttClient, &MqttClient::messageReceived,
                     [alarmManager](const QString &topic, const QString &message) {
        // Check if this is an alarm command topic
        if (topic.contains("/command/alarm")) {
            qInfo() << "Received raw alarm message on topic:" << topic;

            // Try to parse as JSON array (alarm list)
            QJsonDocument doc = QJsonDocument::fromJson(message.toUtf8());
            if (doc.isArray()) {
                qInfo() << "Processing alarm list (array format)";
                QJsonArray array = doc.array();
                QVariantList alarmList;

                for (const QJsonValue &val : array) {
                    if (val.isObject()) {
                        alarmList.append(val.toObject().toVariantMap());
                    }
                }

                alarmManager->handleAlarmList(alarmList);
            }
            // If not an array, it will be handled by jsonMessageReceived
        }
    });

    // Simple MQTT message handler for testing
    QObject::connect(&mqttClient, &MqttClient::jsonMessageReceived,
                     [&config, &router, &mediaPipeClient, pdlcController, windowController, alarmManager, youtubeProvider](const QString &topic, const QVariantMap &data) {
        qInfo() << "========================================";
        qInfo() << "MQTT Message Received!";
        qInfo() << "Topic:" << topic;
        qInfo() << "Data:" << data;
        qInfo() << "========================================";

        // Parse topic to extract command
        QStringList parts = topic.split("/");
        if (parts.size() >= 5 && parts[3] == "command") {
            QString command = parts[4];
            qInfo() << "Command type:" << command;

            if (command == "power") {
                bool status = data["status"].toBool();
                qInfo() << ">>> Power command received! Status:" << (status ? "ON" : "OFF");

                if (status) {
                    // ===== Power ON: Smart Standby → Active =====
                    qInfo() << "========================================";
                    qInfo() << "POWERING ON - Exiting Smart Standby";
                    qInfo() << "========================================";

                    // Re-enable auto-restart and resume gesture recognition
                    mediaPipeClient.setAutoRestart(true);
                    mediaPipeClient.start();
                    qInfo() << "  ✓ Gesture recognition: STARTED (auto-restart enabled)";

                    // Navigate to menu (or could restore previous mode)
                    router.navigateTo("menu");
                    qInfo() << "  ✓ Navigated to: Menu";

                    // PDLC stays opaque (will be controlled by mode selection)
                    pdlcController->setOpaque();
                    qInfo() << "  ✓ PDLC: Opaque (default)";

                    qInfo() << "========================================";
                    qInfo() << "System Status: ACTIVE";
                    qInfo() << "  - Display: ON";
                    qInfo() << "  - Gesture: ON";
                    qInfo() << "  - Sensors: ON (continuous)";
                    qInfo() << "  - MQTT: ON (continuous)";
                    qInfo() << "  - Window Control: ON (full)";
                    qInfo() << "========================================";

                } else {
                    // ===== Power OFF: Active → Smart Standby =====
                    qInfo() << "========================================";
                    qInfo() << "POWERING OFF - Entering Smart Standby";
                    qInfo() << "========================================";

                    // Disable auto-restart and stop gesture recognition (save power)
                    mediaPipeClient.setAutoRestart(false);
                    mediaPipeClient.stop();
                    qInfo() << "  ✓ Gesture recognition: STOPPED (auto-restart disabled)";

                    // Navigate to standby screen
                    router.navigateTo("standby");
                    qInfo() << "  ✓ Navigated to: Standby Screen";

                    // Set PDLC to opaque for privacy
                    pdlcController->setOpaque();
                    qInfo() << "  ✓ PDLC: Opaque (privacy)";

                    qInfo() << "========================================";
                    qInfo() << "System Status: SMART STANDBY";
                    qInfo() << "  - Display: OFF (minimal UI)";
                    qInfo() << "  - Gesture: OFF (power save)";
                    qInfo() << "  - Sensors: ON (monitoring)";
                    qInfo() << "  - MQTT: ON (listening)";
                    qInfo() << "  - Window Control: ON (manual only)";
                    qInfo() << "========================================";
                }
            }
            else if (command == "open") {
                bool status = data["status"].toBool();
                qInfo() << ">>> Open command received! Status:" << (status ? "OPEN" : "CLOSED");

                // Control window via Bluetooth
                if (status) {
                    windowController->openWindow();
                    qInfo() << "  → Opening window (100%)";
                } else {
                    windowController->closeWindow();
                    qInfo() << "  → Closing window (0%)";
                }
            }
            else if (command == "mode") {
                QString mode = data["status"].toString();
                qInfo() << ">>> Mode command received! Mode:" << mode;

                // ========================================
                // Mode Mapping & PDLC Control
                // ========================================
                // Backend modes → Lumiscape screens + PDLC control
                // AUTO_MODE   → auto     (PDLC: Opaque)
                // DARK_MODE   → privacy  (PDLC: Opaque) [temporary mapping]
                // SLEEP_MODE  → glass    (PDLC: Transparent) [temporary mapping]
                // CUSTOM_MODE → custom   (PDLC: Opaque)
                // ========================================

                if (mode == "AUTO_MODE") {
                    // Auto Mode: PDLC OFF (Opaque)
                    pdlcController->setOpaque();
                    router.navigateTo("auto");
                    qInfo() << "  → Auto Mode: PDLC Opaque, navigating to 'auto' screen";
                }
                else if (mode == "PRIVACY_MODE") {
                    // Privacy Mode: PDLC OFF (Opaque)
                    // Temporary mapping: DARK_MODE → Privacy
                    pdlcController->setOpaque();
                    router.navigateTo("privacy");
                    qInfo() << "  → Privacy Mode: PDLC Opaque, navigating to 'privacy' screen";
                }
                else if (mode == "GLASS_MODE") {
                    // Glass Mode: PDLC ON (Transparent)
                    // Temporary mapping: SLEEP_MODE → Glass
                    pdlcController->setTransparent();
                    router.navigateTo("glass");
                    qInfo() << "  → Glass Mode: PDLC Transparent, navigating to 'glass' screen";
                }
                else if (mode == "CUSTOM_MODE") {
                    // Custom Mode: PDLC OFF (Opaque)
                    pdlcController->setOpaque();
                    router.navigateTo("custom");
                    qInfo() << "  → Custom Mode: PDLC Opaque, navigating to 'custom' screen";
                }
                else if (mode == "MENU_MODE"){
                    pdlcController->setOpaque();
                    router.navigateTo("menu");
                    qInfo() << "  → Menu Screen: PDLC Opaque, navigating to 'menu' screen";
                }
                else {
                    qWarning() << "  → Unknown mode:" << mode;
                }
            }
            else if (command == "media") {
                qInfo() << ">>> Media command received!";
                qInfo() << "    Media ID:" << data["mediaId"].toLongLong();
                QString mediaUrl = data["mediaUrl"].toString();
                qInfo() << "    Media URL:" << mediaUrl;

                // Update current media URL in config
                config.setCurrentMediaUrl(mediaUrl);

                // Auto navigate to custom mode to show the media
                router.navigateTo("custom");
            }
            else if (command == "music") {
                qInfo() << ">>> Music command received!";
                qInfo() << "    Raw data:" << data;

                // Validate and parse music URL
                if (!data.contains("musicUrl")) {
                    qWarning() << "    ERROR: Missing 'musicUrl' field in music command";
                    qWarning() << "    Available fields:" << data.keys();
                    return;
                }

                QString musicUrl = data["musicUrl"].toString().trimmed();

                // Handle empty or null URL - pause Custom Mode music only
                if (musicUrl.isEmpty() || musicUrl == "null") {
                    qInfo() << "    Empty or null music URL - pausing Custom Mode music";

                    // Pause only if Custom Mode's music is currently playing
                    QString currentCustomUrl = config.customModeYoutubeUrl();
                    if (!currentCustomUrl.isEmpty() &&
                        youtubeProvider->currentUrl() == currentCustomUrl &&
                        youtubeProvider->isPlaying()) {
                        youtubeProvider->pause();
                        qInfo() << "    ⏸ Custom Mode music paused";
                    }

                    // Keep the widget visible but with paused state
                    // Don't clear the URL so widget remains visible

                    qInfo() << "    ✓ Music command processed (pause)";
                    return;
                }

                qInfo() << "    Raw Music URL:" << musicUrl;

                // Sanitize URL: remove quotes, playlist parameters, etc.
                // Remove leading/trailing quotes
                if (musicUrl.startsWith("\"")) musicUrl.remove(0, 1);
                if (musicUrl.endsWith("\"")) musicUrl.chop(1);
                if (musicUrl.startsWith("'")) musicUrl.remove(0, 1);
                if (musicUrl.endsWith("'")) musicUrl.chop(1);

                // Remove escaped quotes
                musicUrl.replace("\\\"", "");
                musicUrl.replace("\\'", "");

                // Remove playlist parameters
                if (musicUrl.contains("&list=")) {
                    musicUrl = musicUrl.left(musicUrl.indexOf("&list="));
                }
                if (musicUrl.contains("&start_radio=")) {
                    musicUrl = musicUrl.left(musicUrl.indexOf("&start_radio="));
                }
                if (musicUrl.contains("?list=")) {
                    musicUrl = musicUrl.left(musicUrl.indexOf("?list="));
                }

                // Final trim
                musicUrl = musicUrl.trimmed();

                qInfo() << "    Music ID:" << data.value("musicId", "N/A");
                qInfo() << "    Sanitized Music URL:" << musicUrl;

                // Update Custom Mode YouTube URL in config
                config.setCustomModeYoutubeUrl(musicUrl);

                // Enable music widget if not already enabled
                if (!config.widgetMusic()) {
                    config.setWidgetMusic(true);
                    qInfo() << "    Music widget auto-enabled";
                }

                // Auto navigate to custom mode to play the music
                router.navigateTo("custom");
                qInfo() << "    ✓ Music command processed successfully";
            }
            else if (command == "alarm") {
                qInfo() << ">>> Alarm command received!";

                // Check if this is a single alarm object or an array
                if (data.contains("action")) {
                    // Single alarm with action (UPSERT or DELETE)
                    QString action = data["action"].toString();
                    QVariantMap alarmData = data["alarm"].toMap();

                    qInfo() << "    Action:" << action;
                    qInfo() << "    Alarm ID:" << alarmData["alarmId"].toLongLong();

                    if (action == "UPSERT") {
                        alarmManager->handleAlarmUpsert(alarmData);
                    } else if (action == "DELETE") {
                        alarmManager->handleAlarmDelete(alarmData);
                    }
                } else {
                    // Direct alarm list (array in root level)
                    // This happens when backend sends alarm list directly
                    qWarning() << "Received alarm data without action field";
                }
            }
            else if (command == "widgets") {
                qInfo() << ">>> Widgets command received!";

                // Update widget visibility settings from payload
                if (data.contains("widgetClock")) {
                    config.setWidgetClock(data["widgetClock"].toBool());
                    qInfo() << "    Clock Widget:" << data["widgetClock"].toBool();
                }
                if (data.contains("widgetWeather")) {
                    config.setWidgetWeather(data["widgetWeather"].toBool());
                    qInfo() << "    Weather Widget:" << data["widgetWeather"].toBool();
                }
                if (data.contains("widgetQuotes")) {
                    config.setWidgetQuotes(data["widgetQuotes"].toBool());
                    qInfo() << "    Quotes Widget:" << data["widgetQuotes"].toBool();
                }
                if (data.contains("widgetMusic")) {
                    config.setWidgetMusic(data["widgetMusic"].toBool());
                    qInfo() << "    Music Widget:" << data["widgetMusic"].toBool();
                }

                qInfo() << "  → Widget settings updated successfully";
                router.navigateTo("custom");
            }
        }
    });

    // Connection status handler
    QObject::connect(&mqttClient, &MqttClient::connectionStateChanged,
                     [&config](bool connected) {
        if (connected) {
            qInfo() << "✓ MQTT Connected successfully!";
        } else {
            qWarning() << "✗ MQTT Disconnected";
        }
    });

    // Error handler
    QObject::connect(&mqttClient, &MqttClient::errorOccurred,
                     [](const QString &error) {
        qCritical() << "MQTT Error:" << error;
    });

    // REST client for external APIs
    RestClient restClient;

    // Sensor event bus
    SensorBus sensorBus;

    // ========================================================================
    // Widget System Setup
    // ========================================================================

    WidgetRegistry widgetRegistry;

    // Register widget providers
    auto clockProvider = new ClockProvider(&app);
    auto weatherProvider = new WeatherProvider(&restClient, &app);
    // Spotify removed - using YouTube for background music
    // auto spotifyProvider = new SpotifyProvider(&restClient, &app);
    // auto spotifyWebBridge = new SpotifyWebBridge(&app);
    // auto spotifyAuthHelper = new SpotifyAuthHelper(&restClient, &app);
    // YouTubeProvider already created earlier (line 99) for MQTT music commands

    // Initialize WeatherProvider with API key and default city
    weatherProvider->setApiKey(config.weatherApiKey());
    weatherProvider->setCity("Seoul");
    qInfo() << "WeatherProvider initialized with API key";

    // Spotify removed - using YouTube for background music
    /*
    // Initialize SpotifyAuthHelper with config
    spotifyAuthHelper->initAuth(
        config.spotifyClientId(),
        config.spotifyRedirectUri(),
        "streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state user-read-currently-playing"
    );

    // Connect SpotifyAuthHelper to SpotifyProvider and SpotifyWebBridge
    QObject::connect(spotifyAuthHelper, &SpotifyAuthHelper::accessTokenReceived,
                     spotifyProvider, [spotifyProvider, spotifyWebBridge](const QString &token, int expiresIn) {
        Q_UNUSED(expiresIn)
        spotifyProvider->setAccessToken(token);
        spotifyWebBridge->setAccessToken(token);
        qInfo() << "Spotify access token set for provider and web bridge";
    });

    // Try to restore authentication from saved tokens
    spotifyAuthHelper->restoreAuthentication();
    */

    widgetRegistry.registerWidget("clock", clockProvider);
    widgetRegistry.registerWidget("weather", weatherProvider);
    // Spotify removed - using YouTube for background music
    // widgetRegistry.registerWidget("spotify", spotifyProvider);
    widgetRegistry.registerWidget("youtube", youtubeProvider);

    // Sensor manager for environmental monitoring
    auto sensorManager = new SensorManager(&app);
    widgetRegistry.registerWidget("sensor", sensorManager);

    // Publish sensor data to MQTT when values change
    auto publishSensorData = [&mqttClient, &config, sensorManager]() {
        if (!mqttClient.isConnected()) {
            return;
        }

        QString deviceId = config.deviceUniqueId();
        QString sensorTopic = QString("/devices/%1/status/sensor").arg(deviceId);

        QVariantMap sensorData;
        sensorData["co2"] = sensorManager->co2();
        sensorData["pm25"] = sensorManager->pm25();
        sensorData["pm10"] = sensorManager->pm10();
        sensorData["temperature"] = sensorManager->temperature();
        sensorData["humidity"] = sensorManager->humidity();

        mqttClient.publishJson(sensorTopic, sensorData, 1);
        qInfo() << "Published sensor data to" << sensorTopic << ":" << sensorData;
    };

    // Connect sensor signals to MQTT publish
    QObject::connect(sensorManager, &SensorManager::co2Changed, publishSensorData);
    QObject::connect(sensorManager, &SensorManager::pm25Changed, publishSensorData);
    QObject::connect(sensorManager, &SensorManager::pm10Changed, publishSensorData);
    QObject::connect(sensorManager, &SensorManager::temperatureChanged, publishSensorData);
    QObject::connect(sensorManager, &SensorManager::humidityChanged, publishSensorData);

    // ========================================================================
    // QML Engine Setup
    // ========================================================================

    QQmlApplicationEngine engine;

    // Expose C++ objects to QML
    engine.rootContext()->setContextProperty("appConfig", &config);
    engine.rootContext()->setContextProperty("router", &router);
    engine.rootContext()->setContextProperty("gestureBridge", &gestureBridge);
    engine.rootContext()->setContextProperty("mqttClient", &mqttClient);
    engine.rootContext()->setContextProperty("restClient", &restClient);
    engine.rootContext()->setContextProperty("sensorBus", &sensorBus);
    engine.rootContext()->setContextProperty("widgetRegistry", &widgetRegistry);
    engine.rootContext()->setContextProperty("alarmManager", alarmManager);

    // Individual widget providers for direct access
    engine.rootContext()->setContextProperty("clockProvider", clockProvider);
    engine.rootContext()->setContextProperty("weatherProvider", weatherProvider);
    // Spotify removed - using YouTube for background music
    // engine.rootContext()->setContextProperty("spotifyProvider", spotifyProvider);
    // engine.rootContext()->setContextProperty("spotifyWebBridge", spotifyWebBridge);
    // engine.rootContext()->setContextProperty("spotifyAuthHelper", spotifyAuthHelper);
    engine.rootContext()->setContextProperty("youtubeProvider", youtubeProvider);
    engine.rootContext()->setContextProperty("sensorManager", sensorManager);
    engine.rootContext()->setContextProperty("pdlcController", pdlcController);
    engine.rootContext()->setContextProperty("windowController", windowController);

    // Error handling
    QObject::connect(
        &engine,
        &QQmlApplicationEngine::objectCreationFailed,
        &app,
        []() { QCoreApplication::exit(-1); },
        Qt::QueuedConnection
    );

    // Load main QML file
    engine.loadFromModule("com.lumiscape.ui", "Main");

    if (engine.rootObjects().isEmpty()) {
        return -1;
    }

    // ========================================================================
    // Post-initialization
    // ========================================================================

    // Start MediaPipe gesture recognition
    mediaPipeClient.start();

    // Subscribe to backend command topics
    // Topic pattern: /devices/{deviceUniqueId}/command/#
    QString deviceId = config.deviceUniqueId();
    QString commandTopic = QString("/devices/%1/command/#").arg(deviceId);

    // Wait a bit for MQTT connection to establish, then subscribe
    QTimer::singleShot(2000, [&mqttClient, commandTopic, deviceId, alarmManager]() {
        if (mqttClient.isConnected()) {
            mqttClient.subscribe(commandTopic, 1);
            qInfo() << "========================================";
            qInfo() << "Device ID:" << deviceId;
            qInfo() << "Subscribed to backend commands:" << commandTopic;
            qInfo() << "========================================";

            // Request all alarms from backend
            alarmManager->requestAlarmsFromBackend(deviceId);
        } else {
            qWarning() << "MQTT not connected yet, will retry subscription...";
            // The auto-reconnect will handle this
        }
    });

    // Also subscribe when connection is established (for reconnection scenarios)
    QObject::connect(&mqttClient, &MqttClient::connectionStateChanged,
                     [&mqttClient, commandTopic, deviceId, alarmManager](bool connected) {
        if (connected) {
            mqttClient.subscribe(commandTopic, 1);
            qInfo() << "Device" << deviceId << "subscribed to:" << commandTopic;

            // Request all alarms from backend on reconnect
            alarmManager->requestAlarmsFromBackend(deviceId);
        }
    });

    // YouTube control is now handled directly in QML via WebEngine
    // (legacy MQTT topics removed)

    // Navigate to loading screen
    router.navigateTo("loading");

    // ========================================================================
    // Event Loop
    // ========================================================================

    return app.exec();
}
