#include "YouTubeProvider.h"
#include <QJsonDocument>
#include <QJsonObject>
#include <QStandardPaths>
#include <QDir>
#include <QFile>
#include <QDebug>

YouTubeProvider::YouTubeProvider(QObject *parent)
    : QObject(parent)
    , m_ytdlpProcess(new QProcess(this))
    , m_processReady(false)
    , m_mediaPlayer(new QMediaPlayer(this))
    , m_audioOutput(new QAudioOutput(this))
    , m_duration(0)
    , m_isLoading(false)
{
    // Setup media player
    m_mediaPlayer->setAudioOutput(m_audioOutput);
    m_audioOutput->setVolume(0.7f);

    // Connect media player signals
    connect(m_mediaPlayer, &QMediaPlayer::errorOccurred,
            this, &YouTubeProvider::onMediaPlayerError);
    connect(m_mediaPlayer, &QMediaPlayer::playbackStateChanged,
            this, &YouTubeProvider::onMediaPlayerStateChanged);
    connect(m_mediaPlayer, &QMediaPlayer::durationChanged,
            this, &YouTubeProvider::onMediaPlayerDurationChanged);
    connect(m_mediaPlayer, &QMediaPlayer::positionChanged,
            this, &YouTubeProvider::onMediaPlayerPositionChanged);

    // Connect yt-dlp process signals
    connect(m_ytdlpProcess, &QProcess::readyReadStandardOutput,
            this, &YouTubeProvider::onYtdlpProcessReadyRead);
    connect(m_ytdlpProcess, &QProcess::errorOccurred,
            this, &YouTubeProvider::onYtdlpProcessError);

    // Start yt-dlp service
    startYtdlpProcess();
}

YouTubeProvider::~YouTubeProvider()
{
    if (m_ytdlpProcess && m_ytdlpProcess->state() == QProcess::Running) {
        m_ytdlpProcess->terminate();
        m_ytdlpProcess->waitForFinished(3000);
    }
}

void YouTubeProvider::startYtdlpProcess()
{
    QString scriptPath = QDir::currentPath() + "/python/youtube_audio_service.py";

    qInfo() << "Starting YouTube service...";
    qInfo() << "Working directory:" << QDir::currentPath();
    qInfo() << "Script path:" << scriptPath;

    // Check if script exists
    if (!QFile::exists(scriptPath)) {
        m_errorMessage = "youtube_audio_service.py not found at: " + scriptPath;
        qWarning() << m_errorMessage;
        emit errorOccurred(m_errorMessage);
        return;
    }

    QStringList args;
    args << "-u";  // Unbuffered mode for immediate I/O
    args << scriptPath;

    // Add cookies path if set
    if (!m_cookiesPath.isEmpty()) {
        args << m_cookiesPath;
    }

    m_ytdlpProcess->setProgram("python3");
    m_ytdlpProcess->setArguments(args);
    // Don't merge channels - keep stderr separate from stdout

    // Connect stderr for debugging (separate from stdout JSON)
    connect(m_ytdlpProcess, &QProcess::readyReadStandardError, this, [this]() {
        QString errorOutput = QString::fromUtf8(m_ytdlpProcess->readAllStandardError());
        if (!errorOutput.isEmpty()) {
            // Output stderr line by line
            QStringList lines = errorOutput.split('\n', Qt::SkipEmptyParts);
            for (const QString &line : lines) {
                qInfo() << "[YouTube service]" << line;
            }
        }
    });

    m_ytdlpProcess->start();

    if (!m_ytdlpProcess->waitForStarted(5000)) {
        QString error = m_ytdlpProcess->errorString();
        m_errorMessage = "Failed to start YouTube service: " + error;
        qWarning() << m_errorMessage;
        emit errorOccurred(m_errorMessage);
        return;
    }

    qInfo() << "YouTube audio service started successfully";
    qInfo() << "Process PID:" << m_ytdlpProcess->processId();

    // Process is running, but wait for ping response before marking as ready
    // Temporarily set to true to allow ping command
    m_processReady = true;

    // Send ping to verify connection
    QJsonObject ping;
    ping["command"] = "ping";
    sendCommandToYtdlp(ping);

    qInfo() << "Waiting for ping response from YouTube service...";
}

void YouTubeProvider::sendCommandToYtdlp(const QJsonObject &command)
{
    if (!m_processReady) {
        qWarning() << "yt-dlp process not ready (m_processReady = false)";
        return;
    }

    if (m_ytdlpProcess->state() != QProcess::Running) {
        qWarning() << "yt-dlp process not running, state:" << m_ytdlpProcess->state();
        return;
    }

    QJsonDocument doc(command);
    QString jsonStr = doc.toJson(QJsonDocument::Compact) + "\n";

    qInfo() << "Sending to YouTube service:" << jsonStr.trimmed();

    qint64 bytesWritten = m_ytdlpProcess->write(jsonStr.toUtf8());

    if (bytesWritten == -1) {
        qWarning() << "Failed to write to YouTube service process";
    } else {
        qInfo() << "Wrote" << bytesWritten << "bytes to YouTube service";
        m_ytdlpProcess->waitForBytesWritten(1000);
    }
}

void YouTubeProvider::onYtdlpProcessReadyRead()
{
    while (m_ytdlpProcess->canReadLine()) {
        QByteArray line = m_ytdlpProcess->readLine().trimmed();
        qInfo() << "YouTube service response:" << QString::fromUtf8(line);

        QJsonDocument doc = QJsonDocument::fromJson(line);

        if (!doc.isNull() && doc.isObject()) {
            processYtdlpResponse(doc.object());
        } else {
            qWarning() << "Invalid JSON response from YouTube service:" << QString::fromUtf8(line);
        }
    }
}

void YouTubeProvider::processYtdlpResponse(const QJsonObject &response)
{
    if (response.contains("pong")) {
        qInfo() << "YouTube service connected";
        return;
    }

    bool success = response.value("success").toBool();

    if (!success) {
        m_isLoading = false;
        emit isLoadingChanged();

        m_errorMessage = response.value("error").toString("Unknown error");
        qWarning() << "YouTube service error:" << m_errorMessage;
        emit errorOccurred(m_errorMessage);
        return;
    }

    // Extract stream info
    QString streamUrl = response.value("stream_url").toString();
    m_currentTitle = response.value("title").toString();
    m_currentThumbnail = response.value("thumbnail").toString();
    m_currentUploader = response.value("uploader").toString();
    m_duration = response.value("duration").toInt() * 1000; // Convert to ms

    emit currentTitleChanged();
    emit currentThumbnailChanged();
    emit currentUploaderChanged();
    emit durationChanged();

    qInfo() << "Stream URL received for:" << m_currentTitle;

    // Load and play stream
    loadStreamUrl(streamUrl);
}

void YouTubeProvider::loadStreamUrl(const QString &streamUrl)
{
    if (streamUrl.isEmpty()) {
        m_errorMessage = "Empty stream URL";
        emit errorOccurred(m_errorMessage);
        m_isLoading = false;
        emit isLoadingChanged();
        return;
    }

    m_mediaPlayer->setSource(QUrl(streamUrl));
    m_mediaPlayer->play();

    m_isLoading = false;
    emit isLoadingChanged();
    emit streamReady();
}

void YouTubeProvider::onYtdlpProcessError(QProcess::ProcessError error)
{
    qWarning() << "yt-dlp process error:" << error;
    m_errorMessage = "YouTube service crashed";
    emit errorOccurred(m_errorMessage);

    m_processReady = false;
    m_isLoading = false;
    emit isLoadingChanged();
}

void YouTubeProvider::playYouTubeUrl(const QString &url)
{
    if (url.isEmpty()) {
        qWarning() << "Empty YouTube URL";
        return;
    }

    // Stop current playback before loading new URL
    // This ensures clean transition between different modes
    if (m_mediaPlayer->playbackState() == QMediaPlayer::PlayingState ||
        m_mediaPlayer->playbackState() == QMediaPlayer::PausedState) {
        qInfo() << "Stopping current playback before loading new URL";
        m_mediaPlayer->stop();
    }

    m_currentUrl = url;
    emit currentUrlChanged();

    m_isLoading = true;
    emit isLoadingChanged();

    qInfo() << "Requesting stream for:" << url;

    // Send get_stream command to Python service
    QJsonObject command;
    command["command"] = "get_stream";
    command["url"] = url;
    sendCommandToYtdlp(command);
}

void YouTubeProvider::play()
{
    m_mediaPlayer->play();
}

void YouTubeProvider::pause()
{
    m_mediaPlayer->pause();
}

void YouTubeProvider::stop()
{
    m_mediaPlayer->stop();
    m_currentTitle.clear();
    m_currentUrl.clear();
    m_currentThumbnail.clear();
    m_currentUploader.clear();
    m_duration = 0;

    emit currentTitleChanged();
    emit currentUrlChanged();
    emit currentThumbnailChanged();
    emit currentUploaderChanged();
    emit durationChanged();
}

void YouTubeProvider::seek(qint64 position)
{
    m_mediaPlayer->setPosition(position);
}

void YouTubeProvider::setCookiesPath(const QString &path)
{
    m_cookiesPath = path;

    // Send to running process if already started
    if (m_processReady) {
        QJsonObject command;
        command["command"] = "set_cookies";
        command["path"] = path;
        sendCommandToYtdlp(command);
    }

    qInfo() << "YouTube cookies path set to:" << path;
}

qint64 YouTubeProvider::position() const
{
    return m_mediaPlayer->position();
}

bool YouTubeProvider::isPlaying() const
{
    return m_mediaPlayer->playbackState() == QMediaPlayer::PlayingState;
}

float YouTubeProvider::volume() const
{
    return m_audioOutput->volume();
}

void YouTubeProvider::setVolume(float volume)
{
    if (qFuzzyCompare(m_audioOutput->volume(), volume)) {
        return;
    }

    m_audioOutput->setVolume(qBound(0.0f, volume, 1.0f));
    emit volumeChanged();
}

void YouTubeProvider::onMediaPlayerError(QMediaPlayer::Error error, const QString &errorString)
{
    Q_UNUSED(error)
    m_errorMessage = errorString;
    qWarning() << "Media player error:" << errorString;
    emit errorOccurred(m_errorMessage);

    m_isLoading = false;
    emit isLoadingChanged();
}

void YouTubeProvider::onMediaPlayerStateChanged(QMediaPlayer::PlaybackState state)
{
    Q_UNUSED(state)
    emit isPlayingChanged();
}

void YouTubeProvider::onMediaPlayerDurationChanged(qint64 duration)
{
    if (duration > 0) {
        m_duration = duration;
        emit durationChanged();
    }
}

void YouTubeProvider::onMediaPlayerPositionChanged(qint64 position)
{
    Q_UNUSED(position)
    emit positionChanged();
}
