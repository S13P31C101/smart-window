#pragma once

#include <QObject>
#include <QString>
#include <QTimer>
#include "core/RestClient.h"

/**
 * @brief Spotify music widget data provider
 *
 * Integrates with Spotify API to provide current playback information.
 * Requires OAuth authentication.
 */
class SpotifyProvider : public QObject
{
    Q_OBJECT
    Q_PROPERTY(bool authenticated READ authenticated NOTIFY authenticationChanged)
    Q_PROPERTY(bool playing READ playing NOTIFY playbackStateChanged)
    Q_PROPERTY(QString trackName READ trackName NOTIFY trackChanged)
    Q_PROPERTY(QString artistName READ artistName NOTIFY trackChanged)
    Q_PROPERTY(QString albumName READ albumName NOTIFY trackChanged)
    Q_PROPERTY(QString albumArtUrl READ albumArtUrl NOTIFY trackChanged)
    Q_PROPERTY(int progress READ progress NOTIFY progressChanged)
    Q_PROPERTY(int duration READ duration NOTIFY trackChanged)
    Q_PROPERTY(QString error READ error NOTIFY errorChanged)

public:
    explicit SpotifyProvider(RestClient *restClient, QObject *parent = nullptr);
    ~SpotifyProvider() = default;

    // Getters
    bool authenticated() const { return m_authenticated; }
    bool playing() const { return m_playing; }
    QString trackName() const { return m_trackName; }
    QString artistName() const { return m_artistName; }
    QString albumName() const { return m_albumName; }
    QString albumArtUrl() const { return m_albumArtUrl; }
    int progress() const { return m_progress; }
    int duration() const { return m_duration; }
    QString error() const { return m_error; }

    /**
     * @brief Set access token for Spotify API
     */
    Q_INVOKABLE void setAccessToken(const QString &token);

    /**
     * @brief Fetch current playback state
     */
    Q_INVOKABLE void fetchCurrentPlayback();

    /**
     * @brief Control playback
     */
    Q_INVOKABLE void play();
    Q_INVOKABLE void pause();
    Q_INVOKABLE void next();
    Q_INVOKABLE void previous();

    /**
     * @brief Set volume (0-100)
     */
    Q_INVOKABLE void setVolume(int volume);

signals:
    void authenticationChanged();
    void playbackStateChanged();
    void trackChanged();
    void progressChanged();
    void errorChanged();

private slots:
    void onPlaybackDataReceived(const QVariantMap &data, const QString &error);
    void updateProgress();

private:
    void parsePlaybackData(const QVariantMap &data);
    void setError(const QString &error);

    RestClient *m_restClient{nullptr};
    QTimer *m_updateTimer{nullptr};
    QTimer *m_progressTimer{nullptr};

    bool m_authenticated{false};
    bool m_playing{false};
    QString m_trackName;
    QString m_artistName;
    QString m_albumName;
    QString m_albumArtUrl;
    int m_progress{0};  // milliseconds
    int m_duration{0};  // milliseconds
    QString m_error;

    QString m_accessToken;
    QString m_apiUrl{"https://api.spotify.com/v1"};

    static constexpr int UPDATE_INTERVAL_MS = 5000;  // 5 seconds
    static constexpr int PROGRESS_UPDATE_MS = 1000;  // 1 second
};
