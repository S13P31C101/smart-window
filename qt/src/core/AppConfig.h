#pragma once

#include <QObject>
#include <QString>
#include <QJsonObject>
#include <QSize>
#include <QVariantMap>

/**
 * @brief Application configuration manager
 *
 * Loads and manages application settings from JSON config files.
 * Provides access to system parameters, API endpoints, and UI settings.
 */
class AppConfig : public QObject
{
    Q_OBJECT
    Q_PROPERTY(int screenWidth READ screenWidth NOTIFY configChanged)
    Q_PROPERTY(int screenHeight READ screenHeight NOTIFY configChanged)
    Q_PROPERTY(QString theme READ theme NOTIFY configChanged)
    Q_PROPERTY(bool gestureEnabled READ gestureEnabled WRITE setGestureEnabled NOTIFY gestureEnabledChanged)
    Q_PROPERTY(QString deviceUniqueId READ deviceUniqueId NOTIFY configChanged)
    Q_PROPERTY(QString mqttHost READ mqttHost NOTIFY configChanged)
    Q_PROPERTY(int mqttPort READ mqttPort NOTIFY configChanged)
    Q_PROPERTY(bool mqttUseTls READ mqttUseTls NOTIFY configChanged)
    Q_PROPERTY(QString weatherApiKey READ weatherApiKey NOTIFY configChanged)
    Q_PROPERTY(QString spotifyClientId READ spotifyClientId NOTIFY configChanged)
    Q_PROPERTY(QString applicationDirPath READ applicationDirPath CONSTANT)
    Q_PROPERTY(QString currentMediaUrl READ currentMediaUrl WRITE setCurrentMediaUrl NOTIFY currentMediaUrlChanged)
    Q_PROPERTY(QString currentYoutubeUrl READ currentYoutubeUrl WRITE setCurrentYoutubeUrl NOTIFY currentYoutubeUrlChanged)
    Q_PROPERTY(QString glassModeBackgroundMusic READ glassModeBackgroundMusic NOTIFY configChanged)
    Q_PROPERTY(QVariantMap autoModeBackgroundMusic READ autoModeBackgroundMusic NOTIFY configChanged)

public:
    explicit AppConfig(QObject *parent = nullptr);
    ~AppConfig() = default;

    /**
     * @brief Load configuration from JSON file
     * @param path Path to config file
     * @return true if successful, false otherwise
     */
    Q_INVOKABLE bool load(const QString &path);

    /**
     * @brief Save current configuration to file
     * @param path Path to save location
     * @return true if successful, false otherwise
     */
    Q_INVOKABLE bool save(const QString &path);

    /**
     * @brief Reset to default configuration
     */
    Q_INVOKABLE void resetToDefaults();

    // Getters
    int screenWidth() const { return m_screenWidth; }
    int screenHeight() const { return m_screenHeight; }
    QString theme() const { return m_theme; }
    bool gestureEnabled() const { return m_gestureEnabled; }

    QString deviceUniqueId() const { return m_deviceUniqueId; }
    QString mqttHost() const { return m_mqttHost; }
    int mqttPort() const { return m_mqttPort; }
    bool mqttUseTls() const { return m_mqttUseTls; }
    QString mqttUsername() const { return m_mqttUsername; }
    QString mqttPassword() const { return m_mqttPassword; }

    QString weatherApiKey() const { return m_weatherApiKey; }
    QString weatherApiUrl() const { return m_weatherApiUrl; }

    QString spotifyClientId() const { return m_spotifyClientId; }
    QString spotifyClientSecret() const { return m_spotifyClientSecret; }
    QString spotifyRedirectUri() const { return m_spotifyRedirectUri; }

    QString applicationDirPath() const;

    QString currentMediaUrl() const { return m_currentMediaUrl; }
    QString currentYoutubeUrl() const { return m_currentYoutubeUrl; }

    QString glassModeBackgroundMusic() const { return m_glassModeBackgroundMusic; }
    QVariantMap autoModeBackgroundMusic() const { return m_autoModeBackgroundMusic; }

    // Setters
    void setGestureEnabled(bool enabled);
    void setCurrentMediaUrl(const QString &url);
    void setCurrentYoutubeUrl(const QString &url);

signals:
    void configChanged();
    void gestureEnabledChanged();
    void currentMediaUrlChanged();
    void currentYoutubeUrlChanged();
    void loadingProgress(int percentage, const QString &message);

private:
    void loadDefaults();
    void parseJson(const QJsonObject &json);

    // Display settings
    int m_screenWidth{1920};
    int m_screenHeight{1080};
    QString m_theme{"dark"};
    bool m_gestureEnabled{true};

    // Device settings
    QString m_deviceUniqueId{"lumiscape_default"};

    // MQTT settings
    QString m_mqttHost{"localhost"};
    int m_mqttPort{1883};
    bool m_mqttUseTls{false};
    QString m_mqttUsername;
    QString m_mqttPassword;

    // Weather API settings
    QString m_weatherApiKey;
    QString m_weatherApiUrl{"https://api.openweathermap.org/data/2.5"};

    // Spotify API settings
    QString m_spotifyClientId;
    QString m_spotifyClientSecret;
    QString m_spotifyRedirectUri{"http://localhost:8888/callback"};

    // System paths
    QString m_assetsPath{"assets"};
    QString m_pythonScriptPath{"python/mediapipe_gesture_service.py"};

    // Media
    QString m_currentMediaUrl;
    QString m_currentYoutubeUrl;

    // Background Music
    QString m_glassModeBackgroundMusic;
    QVariantMap m_autoModeBackgroundMusic;
};
