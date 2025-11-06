#pragma once

#include <QObject>
#include <QString>
#include <QMqttClient>
#include <QMqttSubscription>
#include <QVariantMap>

/**
 * @brief MQTT client for IoT communication
 *
 * Provides publish/subscribe interface for MQTT messaging.
 * Supports automatic reconnection and QoS levels.
 */
class MqttClient : public QObject
{
    Q_OBJECT
    Q_PROPERTY(bool connected READ isConnected NOTIFY connectionStateChanged)
    Q_PROPERTY(QString status READ status NOTIFY statusChanged)
    Q_PROPERTY(QString clientId READ clientId WRITE setClientId NOTIFY clientIdChanged)

public:
    explicit MqttClient(QObject *parent = nullptr);
    ~MqttClient() = default;

    /**
     * @brief Connect to MQTT broker
     * @param host Broker hostname
     * @param port Broker port (default: 1883)
     * @param username Optional username
     * @param password Optional password
     */
    Q_INVOKABLE void connectToHost(const QString &host,
                                   quint16 port = 1883,
                                   const QString &username = QString(),
                                   const QString &password = QString());

    /**
     * @brief Disconnect from broker
     */
    Q_INVOKABLE void disconnect();

    /**
     * @brief Publish a message
     * @param topic Topic to publish to
     * @param message Message payload
     * @param qos Quality of Service (0, 1, or 2)
     * @param retain Retain message flag
     */
    Q_INVOKABLE void publish(const QString &topic,
                            const QString &message,
                            quint8 qos = 0,
                            bool retain = false);

    /**
     * @brief Publish JSON data
     * @param topic Topic to publish to
     * @param data JSON data as QVariantMap
     * @param qos Quality of Service
     * @param retain Retain message flag
     */
    Q_INVOKABLE void publishJson(const QString &topic,
                                 const QVariantMap &data,
                                 quint8 qos = 0,
                                 bool retain = false);

    /**
     * @brief Subscribe to a topic
     * @param topic Topic filter (supports wildcards)
     * @param qos Quality of Service
     */
    Q_INVOKABLE void subscribe(const QString &topic, quint8 qos = 0);

    /**
     * @brief Unsubscribe from a topic
     * @param topic Topic filter
     */
    Q_INVOKABLE void unsubscribe(const QString &topic);

    /**
     * @brief Check connection status
     */
    bool isConnected() const;

    /**
     * @brief Get current status message
     */
    QString status() const { return m_status; }

    /**
     * @brief Get/Set client ID
     */
    QString clientId() const;
    void setClientId(const QString &clientId);

signals:
    void connectionStateChanged(bool connected);
    void statusChanged(const QString &status);
    void clientIdChanged();
    void messageReceived(const QString &topic, const QString &message);
    void jsonMessageReceived(const QString &topic, const QVariantMap &data);
    void errorOccurred(const QString &error);

private slots:
    void onConnected();
    void onDisconnected();
    void onMessageReceived(const QByteArray &message, const QMqttTopicName &topic);
    void onStateChanged(QMqttClient::ClientState state);
    void onErrorChanged(QMqttClient::ClientError error);

private:
    void setStatus(const QString &status);

    QMqttClient *m_client{nullptr};
    QString m_status{"Disconnected"};
    QMap<QString, QMqttSubscription*> m_subscriptions;
    bool m_autoReconnect{true};
};
