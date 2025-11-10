#include "SpotifyProvider.h"
#include <QDebug>

SpotifyProvider::SpotifyProvider(RestClient *restClient, QObject *parent)
    : QObject(parent)
    , m_restClient(restClient)
{
    m_updateTimer = new QTimer(this);
    connect(m_updateTimer, &QTimer::timeout, this, &SpotifyProvider::fetchCurrentPlayback);

    m_progressTimer = new QTimer(this);
    connect(m_progressTimer, &QTimer::timeout, this, &SpotifyProvider::updateProgress);
    m_progressTimer->start(PROGRESS_UPDATE_MS);
}

void SpotifyProvider::setAccessToken(const QString &token)
{
    m_accessToken = token;
    m_authenticated = !token.isEmpty();

    emit authenticationChanged();

    if (m_authenticated) {
        qInfo() << "Spotify authenticated";
        fetchCurrentPlayback();
        m_updateTimer->start(UPDATE_INTERVAL_MS);
    } else {
        m_updateTimer->stop();
        qInfo() << "Spotify authentication cleared";
    }
}

void SpotifyProvider::fetchCurrentPlayback()
{
    if (!m_authenticated) {
        setError("Not authenticated");
        return;
    }

    QString url = m_apiUrl + "/me/player/currently-playing";

    QVariantMap headers;
    headers["Authorization"] = "Bearer " + m_accessToken;

    m_restClient->get(url, headers,
                      [this](const QVariantMap &data, const QString &error) {
        onPlaybackDataReceived(data, error);
    });
}

void SpotifyProvider::play()
{
    if (!m_authenticated) return;

    QString url = m_apiUrl + "/me/player/play";

    QVariantMap headers;
    headers["Authorization"] = "Bearer " + m_accessToken;

    m_restClient->put(url, QVariantMap(), headers,
                      [](const QVariantMap &response, const QString &error) {
        if (!error.isEmpty()) {
            qWarning() << "Spotify play error:" << error;
            qWarning() << "Response data:" << response;
        } else {
            qDebug() << "Spotify play command sent successfully";
        }
    });

    qDebug() << "Spotify: play command initiated";
}

void SpotifyProvider::pause()
{
    if (!m_authenticated) return;

    QString url = m_apiUrl + "/me/player/pause";

    QVariantMap headers;
    headers["Authorization"] = "Bearer " + m_accessToken;

    m_restClient->put(url, QVariantMap(), headers,
                      [](const QVariantMap &, const QString &error) {
        if (!error.isEmpty()) {
            qWarning() << "Spotify pause error:" << error;
        }
    });

    qDebug() << "Spotify: pause";
}

void SpotifyProvider::next()
{
    if (!m_authenticated) return;

    QString url = m_apiUrl + "/me/player/next";

    QVariantMap headers;
    headers["Authorization"] = "Bearer " + m_accessToken;

    m_restClient->post(url, QVariantMap(), headers,
                       [](const QVariantMap &, const QString &error) {
        if (!error.isEmpty()) {
            qWarning() << "Spotify next error:" << error;
        }
    });

    qDebug() << "Spotify: next track";
}

void SpotifyProvider::previous()
{
    if (!m_authenticated) return;

    QString url = m_apiUrl + "/me/player/previous";

    QVariantMap headers;
    headers["Authorization"] = "Bearer " + m_accessToken;

    m_restClient->post(url, QVariantMap(), headers,
                       [](const QVariantMap &, const QString &error) {
        if (!error.isEmpty()) {
            qWarning() << "Spotify previous error:" << error;
        }
    });

    qDebug() << "Spotify: previous track";
}

void SpotifyProvider::setVolume(int volume)
{
    if (!m_authenticated) return;

    int clampedVolume = qBound(0, volume, 100);
    QString url = QString("%1/me/player/volume?volume_percent=%2")
                      .arg(m_apiUrl)
                      .arg(clampedVolume);

    QVariantMap headers;
    headers["Authorization"] = "Bearer " + m_accessToken;

    m_restClient->put(url, QVariantMap(), headers,
                      [](const QVariantMap &, const QString &error) {
        if (!error.isEmpty()) {
            qWarning() << "Spotify volume error:" << error;
        }
    });

    qDebug() << "Spotify: volume set to" << clampedVolume;
}

void SpotifyProvider::onPlaybackDataReceived(const QVariantMap &data, const QString &error)
{
    if (!error.isEmpty()) {
        setError(error);

        // Token might be expired
        if (error.contains("401")) {
            m_authenticated = false;
            emit authenticationChanged();
        }
        return;
    }

    parsePlaybackData(data);
}

void SpotifyProvider::updateProgress()
{
    if (m_playing && m_duration > 0) {
        m_progress += PROGRESS_UPDATE_MS;

        if (m_progress >= m_duration) {
            m_progress = m_duration;
            // Track ended, fetch new data
            fetchCurrentPlayback();
        }

        emit progressChanged();
    }
}

void SpotifyProvider::parsePlaybackData(const QVariantMap &data)
{
    if (data.isEmpty()) {
        // No active playback
        m_playing = false;
        emit playbackStateChanged();
        return;
    }

    // Parse playback state
    if (data.contains("is_playing")) {
        bool newPlaying = data["is_playing"].toBool();
        if (m_playing != newPlaying) {
            m_playing = newPlaying;
            emit playbackStateChanged();
        }
    }

    // Parse progress
    if (data.contains("progress_ms")) {
        m_progress = data["progress_ms"].toInt();
        emit progressChanged();
    }

    // Parse track information
    if (data.contains("item")) {
        QVariantMap item = data["item"].toMap();

        QString newTrackName = item["name"].toString();
        int newDuration = item["duration_ms"].toInt();

        bool hasTrackChanged = (m_trackName != newTrackName);

        m_trackName = newTrackName;
        m_duration = newDuration;

        // Parse artists
        if (item.contains("artists")) {
            QVariantList artists = item["artists"].toList();
            if (!artists.isEmpty()) {
                QStringList artistNames;
                for (const QVariant &artist : artists) {
                    artistNames << artist.toMap()["name"].toString();
                }
                m_artistName = artistNames.join(", ");
            }
        }

        // Parse album
        if (item.contains("album")) {
            QVariantMap album = item["album"].toMap();
            m_albumName = album["name"].toString();

            // Parse album art
            if (album.contains("images")) {
                QVariantList images = album["images"].toList();
                if (!images.isEmpty()) {
                    // Use the first (largest) image
                    m_albumArtUrl = images.first().toMap()["url"].toString();
                }
            }
        }

        if (hasTrackChanged) {
            emit trackChanged();
            qInfo() << "Now playing:" << m_trackName << "by" << m_artistName;
        }
    }

    setError(QString());
}

void SpotifyProvider::setError(const QString &error)
{
    if (m_error != error) {
        m_error = error;
        emit errorChanged();
    }
}
