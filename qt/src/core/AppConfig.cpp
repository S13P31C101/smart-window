#include "AppConfig.h"
#include <QFile>
#include <QJsonDocument>
#include <QJsonObject>
#include <QDebug>
#include <QCoreApplication>

AppConfig::AppConfig(QObject *parent)
    : QObject(parent)
{
    loadDefaults();
}

bool AppConfig::load(const QString &path)
{
    QFile file(path);
    if (!file.open(QIODevice::ReadOnly | QIODevice::Text)) {
        qWarning() << "Failed to open config file:" << path;
        return false;
    }

    QByteArray data = file.readAll();
    file.close();

    QJsonParseError parseError;
    QJsonDocument doc = QJsonDocument::fromJson(data, &parseError);

    if (parseError.error != QJsonParseError::NoError) {
        qWarning() << "JSON parse error:" << parseError.errorString();
        return false;
    }

    if (!doc.isObject()) {
        qWarning() << "Config file is not a JSON object";
        return false;
    }

    parseJson(doc.object());
    emit configChanged();

    qInfo() << "Configuration loaded successfully from" << path;
    return true;
}

bool AppConfig::save(const QString &path)
{
    QJsonObject json;

    // Display settings
    json["screenWidth"] = m_screenWidth;
    json["screenHeight"] = m_screenHeight;
    json["theme"] = m_theme;
    json["gestureEnabled"] = m_gestureEnabled;

    // MQTT settings
    QJsonObject mqtt;
    mqtt["host"] = m_mqttHost;
    mqtt["port"] = m_mqttPort;
    mqtt["username"] = m_mqttUsername;
    mqtt["password"] = m_mqttPassword;
    json["mqtt"] = mqtt;

    // API settings
    QJsonObject apis;

    QJsonObject weather;
    weather["apiKey"] = m_weatherApiKey;
    weather["apiUrl"] = m_weatherApiUrl;
    apis["weather"] = weather;

    QJsonObject spotify;
    spotify["clientId"] = m_spotifyClientId;
    spotify["clientSecret"] = m_spotifyClientSecret;
    spotify["redirectUri"] = m_spotifyRedirectUri;
    apis["spotify"] = spotify;

    json["apis"] = apis;

    // Write to file
    QFile file(path);
    if (!file.open(QIODevice::WriteOnly | QIODevice::Text)) {
        qWarning() << "Failed to write config file:" << path;
        return false;
    }

    QJsonDocument doc(json);
    file.write(doc.toJson(QJsonDocument::Indented));
    file.close();

    qInfo() << "Configuration saved to" << path;
    return true;
}

void AppConfig::resetToDefaults()
{
    loadDefaults();
    emit configChanged();
}

void AppConfig::setGestureEnabled(bool enabled)
{
    if (m_gestureEnabled != enabled) {
        m_gestureEnabled = enabled;
        emit gestureEnabledChanged();
    }
}

void AppConfig::setCurrentMediaUrl(const QString &url)
{
    if (m_currentMediaUrl != url) {
        m_currentMediaUrl = url;
        emit currentMediaUrlChanged();
        qInfo() << "Media URL updated:" << url;
    }
}

void AppConfig::setCurrentYoutubeUrl(const QString &url)
{
    if (m_currentYoutubeUrl != url) {
        m_currentYoutubeUrl = url;
        emit currentYoutubeUrlChanged();
        qInfo() << "YouTube URL updated:" << url;
    }
}

void AppConfig::setWidgetClock(bool enabled)
{
    if (m_widgetClock != enabled) {
        m_widgetClock = enabled;
        emit widgetClockChanged();
        qInfo() << "Widget Clock:" << (enabled ? "enabled" : "disabled");
    }
}

void AppConfig::setWidgetWeather(bool enabled)
{
    if (m_widgetWeather != enabled) {
        m_widgetWeather = enabled;
        emit widgetWeatherChanged();
        qInfo() << "Widget Weather:" << (enabled ? "enabled" : "disabled");
    }
}

void AppConfig::setWidgetQuotes(bool enabled)
{
    if (m_widgetQuotes != enabled) {
        m_widgetQuotes = enabled;
        emit widgetQuotesChanged();
        qInfo() << "Widget Quotes:" << (enabled ? "enabled" : "disabled");
    }
}

void AppConfig::setWidgetMusic(bool enabled)
{
    if (m_widgetMusic != enabled) {
        m_widgetMusic = enabled;
        emit widgetMusicChanged();
        qInfo() << "Widget Music:" << (enabled ? "enabled" : "disabled");
    }
}

QString AppConfig::applicationDirPath() const
{
    return QCoreApplication::applicationDirPath();
}

void AppConfig::loadDefaults()
{
    m_screenWidth = 1920;
    m_screenHeight = 1080;
    m_theme = "dark";
    m_gestureEnabled = true;

    m_mqttHost = "localhost";
    m_mqttPort = 1883;
    m_mqttUsername.clear();
    m_mqttPassword.clear();

    m_weatherApiKey.clear();
    m_weatherApiUrl = "https://api.openweathermap.org/data/2.5";

    m_spotifyClientId.clear();
    m_spotifyClientSecret.clear();
    m_spotifyRedirectUri = "http://localhost:8888/callback";
}

void AppConfig::parseJson(const QJsonObject &json)
{
    // Display settings
    if (json.contains("screenWidth")) {
        m_screenWidth = json["screenWidth"].toInt();
    }
    if (json.contains("screenHeight")) {
        m_screenHeight = json["screenHeight"].toInt();
    }
    if (json.contains("theme")) {
        m_theme = json["theme"].toString();
    }
    if (json.contains("gestureEnabled")) {
        m_gestureEnabled = json["gestureEnabled"].toBool();
    }

    // Device settings
    if (json.contains("deviceUniqueId")) {
        m_deviceUniqueId = json["deviceUniqueId"].toString();
    }

    // MQTT settings
    if (json.contains("mqtt")) {
        QJsonObject mqtt = json["mqtt"].toObject();
        if (mqtt.contains("host")) m_mqttHost = mqtt["host"].toString();
        if (mqtt.contains("port")) m_mqttPort = mqtt["port"].toInt();
        if (mqtt.contains("useTls")) m_mqttUseTls = mqtt["useTls"].toBool();
        if (mqtt.contains("username")) m_mqttUsername = mqtt["username"].toString();
        if (mqtt.contains("password")) m_mqttPassword = mqtt["password"].toString();
    }

    // API settings
    if (json.contains("apis")) {
        QJsonObject apis = json["apis"].toObject();

        // Weather API
        if (apis.contains("weather")) {
            QJsonObject weather = apis["weather"].toObject();
            if (weather.contains("apiKey")) m_weatherApiKey = weather["apiKey"].toString();
            if (weather.contains("apiUrl")) m_weatherApiUrl = weather["apiUrl"].toString();
        }

        // Spotify API
        if (apis.contains("spotify")) {
            QJsonObject spotify = apis["spotify"].toObject();
            if (spotify.contains("clientId")) m_spotifyClientId = spotify["clientId"].toString();
            if (spotify.contains("clientSecret")) m_spotifyClientSecret = spotify["clientSecret"].toString();
            if (spotify.contains("redirectUri")) m_spotifyRedirectUri = spotify["redirectUri"].toString();
        }
    }

    // Background Music settings
    if (json.contains("backgroundMusic")) {
        QJsonObject bgMusic = json["backgroundMusic"].toObject();

        // Glass mode background music
        if (bgMusic.contains("glass")) {
            m_glassModeBackgroundMusic = bgMusic["glass"].toString();
        }

        // Auto mode background music (per location)
        if (bgMusic.contains("auto")) {
            QJsonObject autoMusic = bgMusic["auto"].toObject();
            m_autoModeBackgroundMusic.clear();

            for (auto it = autoMusic.begin(); it != autoMusic.end(); ++it) {
                m_autoModeBackgroundMusic[it.key()] = it.value().toString();
            }
        }
    }
}
