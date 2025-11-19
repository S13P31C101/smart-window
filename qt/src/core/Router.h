#pragma once

#include <QObject>
#include <QString>
#include <QStack>
#include <QVariantMap>

// Forward declaration
class MqttClient;

/**
 * @brief Screen navigation router
 *
 * Manages screen transitions and navigation history.
 * Supports navigation with parameters and back navigation.
 * Publishes mode status changes to MQTT when configured.
 */
class Router : public QObject
{
    Q_OBJECT
    Q_PROPERTY(QString currentScreen READ currentScreen NOTIFY screenChanged)
    Q_PROPERTY(bool canGoBack READ canGoBack NOTIFY historyChanged)

public:
    explicit Router(QObject *parent = nullptr);
    ~Router() = default;

    /**
     * @brief Set MQTT client for publishing mode status
     * @param client Pointer to MqttClient instance
     * @param deviceId Unique device identifier
     */
    void setMqttClient(MqttClient *client, const QString &deviceId);

    /**
     * @brief Navigate to a screen
     * @param screen Screen identifier
     * @param params Optional parameters to pass to the screen
     */
    Q_INVOKABLE void navigateTo(const QString &screen, const QVariantMap &params = QVariantMap());

    /**
     * @brief Navigate back to previous screen
     */
    Q_INVOKABLE void goBack();

    /**
     * @brief Clear navigation history
     */
    Q_INVOKABLE void clearHistory();

    /**
     * @brief Replace current screen without adding to history
     * @param screen Screen identifier
     * @param params Optional parameters
     */
    Q_INVOKABLE void replace(const QString &screen, const QVariantMap &params = QVariantMap());

    /**
     * @brief Get current screen identifier
     */
    QString currentScreen() const { return m_currentScreen; }

    /**
     * @brief Get parameters for current screen
     */
    Q_INVOKABLE QVariantMap currentParams() const { return m_currentParams; }

    /**
     * @brief Check if back navigation is possible
     */
    bool canGoBack() const { return !m_history.isEmpty(); }

signals:
    void screenChanged(const QString &screen, const QVariantMap &params);
    void historyChanged();
    void backPressed();

private:
    struct HistoryEntry {
        QString screen;
        QVariantMap params;
    };

    /**
     * @brief Publish mode status to MQTT if client is configured
     * @param screen Screen identifier
     */
    void publishModeStatus(const QString &screen);

    /**
     * @brief Convert screen name to backend mode name
     * @param screen Internal screen identifier
     * @return Backend mode name (empty if not a mode screen)
     */
    QString getModeName(const QString &screen) const;

    QString m_currentScreen;
    QVariantMap m_currentParams;
    QStack<HistoryEntry> m_history;

    // MQTT publishing
    MqttClient *m_mqttClient{nullptr};
    QString m_deviceId;
};
