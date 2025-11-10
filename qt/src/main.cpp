#include <QGuiApplication>
#include <QQmlApplicationEngine>
#include <QQmlContext>
#include <QQuickStyle>
#include <QIcon>

#include "core/AppConfig.h"
#include "core/Router.h"
#include "core/GestureBridge.h"
#include "core/MediaPipeClient.h"
#include "core/MqttClient.h"
#include "core/RestClient.h"
#include "core/SensorBus.h"
#include "widgets/WidgetRegistry.h"
#include "widgets/ClockProvider.h"
#include "widgets/WeatherProvider.h"
#include "widgets/SpotifyProvider.h"
#include "integrations/SpotifyAuthHelper.h"

int main(int argc, char *argv[])
{
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

    // MQTT client for IoT communication
    MqttClient mqttClient;
    mqttClient.connectToHost(
        config.mqttHost(),
        config.mqttPort(),
        config.mqttUsername(),
        config.mqttPassword()
    );

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
    auto spotifyProvider = new SpotifyProvider(&restClient, &app);
    auto spotifyAuthHelper = new SpotifyAuthHelper(&restClient, &app);

    // Initialize WeatherProvider with API key and default city
    weatherProvider->setApiKey(config.weatherApiKey());
    weatherProvider->setCity("Seoul");
    qInfo() << "WeatherProvider initialized with API key";

    // Initialize SpotifyAuthHelper with config
    spotifyAuthHelper->initAuth(
        config.spotifyClientId(),
        config.spotifyRedirectUri(),
        "user-read-playback-state user-modify-playback-state user-read-currently-playing"
    );

    // Connect SpotifyAuthHelper to SpotifyProvider
    QObject::connect(spotifyAuthHelper, &SpotifyAuthHelper::accessTokenReceived,
                     spotifyProvider, [spotifyProvider](const QString &token, int expiresIn) {
        Q_UNUSED(expiresIn)
        spotifyProvider->setAccessToken(token);
        qInfo() << "Spotify access token set";
    });

    // Try to restore authentication from saved tokens
    spotifyAuthHelper->restoreAuthentication();

    widgetRegistry.registerWidget("clock", clockProvider);
    widgetRegistry.registerWidget("weather", weatherProvider);
    widgetRegistry.registerWidget("spotify", spotifyProvider);

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

    // Individual widget providers for direct access
    engine.rootContext()->setContextProperty("clockProvider", clockProvider);
    engine.rootContext()->setContextProperty("weatherProvider", weatherProvider);
    engine.rootContext()->setContextProperty("spotifyProvider", spotifyProvider);
    engine.rootContext()->setContextProperty("spotifyAuthHelper", spotifyAuthHelper);

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

    // Navigate to loading screen
    router.navigateTo("loading");

    // ========================================================================
    // Event Loop
    // ========================================================================

    return app.exec();
}
