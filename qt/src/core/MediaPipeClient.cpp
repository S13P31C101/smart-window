#include "MediaPipeClient.h"
#include <QJsonDocument>
#include <QJsonObject>
#include <QDebug>
#include <QThread>
#include <QTimer>

MediaPipeClient::MediaPipeClient(QObject *parent)
    : QObject(parent)
{
    m_process = new QProcess(this);

    connect(m_process, &QProcess::readyReadStandardOutput,
            this, &MediaPipeClient::onReadyReadStandardOutput);
    connect(m_process, &QProcess::readyReadStandardError,
            this, &MediaPipeClient::onReadyReadStandardError);
    connect(m_process, &QProcess::errorOccurred,
            this, &MediaPipeClient::onProcessErrorOccurred);
    connect(m_process, QOverload<int, QProcess::ExitStatus>::of(&QProcess::finished),
            this, &MediaPipeClient::onProcessFinished);
}

MediaPipeClient::~MediaPipeClient()
{
    stop();
}

bool MediaPipeClient::start(const QString &pythonPath, const QString &scriptPath)
{
    if (isRunning()) {
        qWarning() << "MediaPipe client is already running";
        return false;
    }

    m_pythonPath = pythonPath;
    m_scriptPath = scriptPath;

    qInfo() << "Starting MediaPipe service:" << pythonPath << scriptPath;
    setStatus("Starting...");

    m_process->start(pythonPath, QStringList() << scriptPath);

    if (!m_process->waitForStarted(5000)) {
        QString error = QString("Failed to start MediaPipe service: %1").arg(m_process->errorString());
        setStatus(error);
        emit errorOccurred(error);
        return false;
    }

    setStatus("Running");
    emit runningStateChanged();
    qInfo() << "MediaPipe service started successfully";
    return true;
}

void MediaPipeClient::stop()
{
    if (!isRunning()) {
        return;
    }

    qInfo() << "Stopping MediaPipe service";
    setStatus("Stopping...");

    m_process->terminate();

    if (!m_process->waitForFinished(3000)) {
        qWarning() << "MediaPipe service did not terminate, killing...";
        m_process->kill();
        m_process->waitForFinished(1000);
    }

    setStatus("Stopped");
    emit runningStateChanged();
    qInfo() << "MediaPipe service stopped";
}

void MediaPipeClient::restart()
{
    qInfo() << "Restarting MediaPipe service";
    stop();
    QThread::msleep(500);  // Brief delay before restart
    start(m_pythonPath, m_scriptPath);
}

void MediaPipeClient::setAutoRestart(bool enable)
{
    m_autoRestart = enable;
    qInfo() << "MediaPipe auto-restart:" << (enable ? "ENABLED" : "DISABLED");
}

bool MediaPipeClient::isRunning() const
{
    return m_process && m_process->state() == QProcess::Running;
}

void MediaPipeClient::sendCommand(const QJsonObject &command)
{
    if (!isRunning()) {
        qWarning() << "Cannot send command: MediaPipe service not running";
        return;
    }

    QJsonDocument doc(command);
    QByteArray data = doc.toJson(QJsonDocument::Compact) + "\n";

    m_process->write(data);
    m_process->waitForBytesWritten();
}

void MediaPipeClient::onReadyReadStandardOutput()
{
    while (m_process->canReadLine()) {
        QByteArray line = m_process->readLine().trimmed();

        if (line.isEmpty()) {
            continue;
        }

        QJsonParseError parseError;
        QJsonDocument doc = QJsonDocument::fromJson(line, &parseError);

        if (parseError.error != QJsonParseError::NoError) {
            qWarning() << "JSON parse error:" << parseError.errorString();
            qWarning() << "Raw data:" << line;
            continue;
        }

        if (doc.isObject()) {
            parseGestureData(doc.object());
        }
    }
}

void MediaPipeClient::onReadyReadStandardError()
{
    QByteArray errorData = m_process->readAllStandardError();
    if (!errorData.isEmpty()) {
        QString errorMsg = QString::fromUtf8(errorData).trimmed();
        qWarning() << "MediaPipe stderr:" << errorMsg;

        // Only emit error for critical messages
        if (errorMsg.contains("Error", Qt::CaseInsensitive) ||
            errorMsg.contains("Exception", Qt::CaseInsensitive)) {
            emit errorOccurred(errorMsg);
        }
    }
}

void MediaPipeClient::onProcessErrorOccurred(QProcess::ProcessError error)
{
    QString errorMsg;
    switch (error) {
    case QProcess::FailedToStart:
        errorMsg = "MediaPipe failed to start. Check Python installation and script path.";
        break;
    case QProcess::Crashed:
        errorMsg = "MediaPipe process crashed.";
        break;
    case QProcess::Timedout:
        errorMsg = "MediaPipe process timed out.";
        break;
    default:
        errorMsg = QString("MediaPipe error: %1").arg(m_process->errorString());
        break;
    }

    qCritical() << errorMsg;
    setStatus(errorMsg);
    emit errorOccurred(errorMsg);
    emit runningStateChanged();
}

void MediaPipeClient::onProcessFinished(int exitCode, QProcess::ExitStatus exitStatus)
{
    QString finishMsg = QString("MediaPipe service finished with exit code %1").arg(exitCode);
    qInfo() << finishMsg;

    if (exitStatus == QProcess::CrashExit) {
        setStatus("Crashed");
        emit errorOccurred("MediaPipe service crashed");

        if (m_autoRestart) {
            qInfo() << "Auto-restarting MediaPipe service...";
            QTimer::singleShot(2000, this, &MediaPipeClient::restart);
        }
    } else {
        setStatus("Stopped");
    }

    emit runningStateChanged();
}

void MediaPipeClient::parseGestureData(const QJsonObject &data)
{
    // Expected format: { "nx": 0.5, "ny": 0.5, "gesture": "pointing", "confidence": 0.95 }

    if (!data.contains("nx") || !data.contains("ny")) {
        return;
    }

    qreal nx = data["nx"].toDouble(0.5);
    qreal ny = data["ny"].toDouble(0.5);
    QString gesture = data["gesture"].toString("none");
    qreal confidence = data["confidence"].toDouble(0.0);

    emit gestureDataReceived(nx, ny, gesture, confidence);
}

void MediaPipeClient::setStatus(const QString &status)
{
    if (m_status != status) {
        m_status = status;
        emit statusChanged(status);
    }
}
