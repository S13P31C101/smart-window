#pragma once

#include <QObject>
#include <QProcess>
#include <QString>
#include <QJsonObject>

/**
 * @brief Client for MediaPipe gesture recognition service
 *
 * Manages the Python MediaPipe process and handles
 * communication via stdin/stdout JSON protocol.
 */
class MediaPipeClient : public QObject
{
    Q_OBJECT
    Q_PROPERTY(bool isRunning READ isRunning NOTIFY runningStateChanged)
    Q_PROPERTY(QString status READ status NOTIFY statusChanged)

public:
    explicit MediaPipeClient(QObject *parent = nullptr);
    ~MediaPipeClient();

    /**
     * @brief Start the MediaPipe gesture recognition service
     * @param pythonPath Path to Python executable (default: "python3")
     * @param scriptPath Path to MediaPipe script
     * @return true if started successfully
     */
    Q_INVOKABLE bool start(const QString &pythonPath = "python3",
                           const QString &scriptPath = "python/mediapipe_gesture_service.py");

    /**
     * @brief Stop the MediaPipe service
     */
    Q_INVOKABLE void stop();

    /**
     * @brief Restart the service
     */
    Q_INVOKABLE void restart();

    /**
     * @brief Enable or disable auto-restart
     * @param enable true to enable auto-restart, false to disable
     */
    Q_INVOKABLE void setAutoRestart(bool enable);

    /**
     * @brief Check if service is running
     */
    bool isRunning() const;

    /**
     * @brief Get current status message
     */
    QString status() const { return m_status; }

    /**
     * @brief Send command to MediaPipe service
     * @param command Command object
     */
    Q_INVOKABLE void sendCommand(const QJsonObject &command);

signals:
    void gestureDataReceived(qreal nx, qreal ny, const QString &gesture, qreal confidence);
    void runningStateChanged();
    void statusChanged(const QString &status);
    void errorOccurred(const QString &error);

private slots:
    void onReadyReadStandardOutput();
    void onReadyReadStandardError();
    void onProcessErrorOccurred(QProcess::ProcessError error);
    void onProcessFinished(int exitCode, QProcess::ExitStatus exitStatus);

private:
    void parseGestureData(const QJsonObject &data);
    void setStatus(const QString &status);

    QProcess *m_process{nullptr};
    QString m_status{"Not started"};
    QString m_pythonPath;
    QString m_scriptPath;
    bool m_autoRestart{true};
};
