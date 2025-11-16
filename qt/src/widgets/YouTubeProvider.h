#ifndef YOUTUBEPROVIDER_H
#define YOUTUBEPROVIDER_H

#include <QObject>
#include <QProcess>
#include <QMediaPlayer>
#include <QAudioOutput>
#include <QString>
#include <QJsonObject>
#include <QTimer>

/**
 * @brief YouTube audio playback provider
 *
 * Manages YouTube audio playback using yt-dlp for stream extraction
 * and QMediaPlayer for playback. Supports YouTube Premium cookies for
 * high-quality audio streams.
 */
class YouTubeProvider : public QObject
{
    Q_OBJECT

    // Playback state
    Q_PROPERTY(QString currentTitle READ currentTitle NOTIFY currentTitleChanged)
    Q_PROPERTY(QString currentUrl READ currentUrl NOTIFY currentUrlChanged)
    Q_PROPERTY(QString currentThumbnail READ currentThumbnail NOTIFY currentThumbnailChanged)
    Q_PROPERTY(QString currentUploader READ currentUploader NOTIFY currentUploaderChanged)
    Q_PROPERTY(qint64 duration READ duration NOTIFY durationChanged)
    Q_PROPERTY(qint64 position READ position NOTIFY positionChanged)
    Q_PROPERTY(bool isPlaying READ isPlaying NOTIFY isPlayingChanged)
    Q_PROPERTY(bool isLoading READ isLoading NOTIFY isLoadingChanged)
    Q_PROPERTY(float volume READ volume WRITE setVolume NOTIFY volumeChanged)
    Q_PROPERTY(QString errorMessage READ errorMessage NOTIFY errorOccurred)

public:
    explicit YouTubeProvider(QObject *parent = nullptr);
    ~YouTubeProvider();

    // Property getters
    QString currentTitle() const { return m_currentTitle; }
    QString currentUrl() const { return m_currentUrl; }
    QString currentThumbnail() const { return m_currentThumbnail; }
    QString currentUploader() const { return m_currentUploader; }
    qint64 duration() const { return m_duration; }
    qint64 position() const;
    bool isPlaying() const;
    bool isLoading() const { return m_isLoading; }
    float volume() const;
    QString errorMessage() const { return m_errorMessage; }

    void setVolume(float volume);

public slots:
    /**
     * @brief Load and play YouTube video by URL or video ID
     * @param url YouTube URL (https://youtube.com/watch?v=...) or video ID
     */
    void playYouTubeUrl(const QString &url);

    /**
     * @brief Play/resume playback
     */
    void play();

    /**
     * @brief Pause playback
     */
    void pause();

    /**
     * @brief Stop playback and clear current track
     */
    void stop();

    /**
     * @brief Seek to position
     * @param position Position in milliseconds
     */
    void seek(qint64 position);

    /**
     * @brief Set cookies file path for YouTube Premium support
     * @param path Path to cookies.txt file (Netscape format)
     */
    void setCookiesPath(const QString &path);

signals:
    void currentTitleChanged();
    void currentUrlChanged();
    void currentThumbnailChanged();
    void currentUploaderChanged();
    void durationChanged();
    void positionChanged();
    void isPlayingChanged();
    void isLoadingChanged();
    void volumeChanged();
    void errorOccurred(const QString &error);
    void streamReady();

private slots:
    void onYtdlpProcessReadyRead();
    void onYtdlpProcessError(QProcess::ProcessError error);
    void onMediaPlayerError(QMediaPlayer::Error error, const QString &errorString);
    void onMediaPlayerStateChanged(QMediaPlayer::PlaybackState state);
    void onMediaPlayerDurationChanged(qint64 duration);
    void onMediaPlayerPositionChanged(qint64 position);

private:
    void startYtdlpProcess();
    void sendCommandToYtdlp(const QJsonObject &command);
    void processYtdlpResponse(const QJsonObject &response);
    void loadStreamUrl(const QString &streamUrl);

    // Python process for yt-dlp
    QProcess *m_ytdlpProcess;
    QString m_cookiesPath;
    bool m_processReady;

    // Media player
    QMediaPlayer *m_mediaPlayer;
    QAudioOutput *m_audioOutput;

    // Current track info
    QString m_currentTitle;
    QString m_currentUrl;
    QString m_currentThumbnail;
    QString m_currentUploader;
    qint64 m_duration;
    bool m_isLoading;
    QString m_errorMessage;

    // Pending URL to load after stream URL is received
    QString m_pendingUrl;
};

#endif // YOUTUBEPROVIDER_H
