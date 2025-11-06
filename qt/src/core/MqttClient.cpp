#include "MqttClient.h"
#include <QJsonDocument>
#include <QJsonObject>
#include <QDebug>
#include <QTimer>

MqttClient::MqttClient(QObject *parent)
    : QObject(parent)
{
    m_client = new QMqttClient(this);
    m_client->setClientId(QStringLiteral("Lumiscape_") +
                          QString::number(QDateTime::currentMSecsSinceEpoch()));

    connect(m_client, &QMqttClient::connected,
            this, &MqttClient::onConnected);
    connect(m_client, &QMqttClient::disconnected,
            this, &MqttClient::onDisconnected);
    connect(m_client, &QMqttClient::stateChanged,
            this, &MqttClient::onStateChanged);
    connect(m_client, &QMqttClient::errorChanged,
            this, &MqttClient::onErrorChanged);
    connect(m_client, &QMqttClient::messageReceived,
            this, &MqttClient::onMessageReceived);
}

void MqttClient::connectToHost(const QString &host, quint16 port,
                               const QString &username, const QString &password)
{
    if (m_client->state() == QMqttClient::Connected) {
        qWarning() << "Already connected to MQTT broker";
        return;
    }

    qInfo() << "Connecting to MQTT broker:" << host << ":" << port;
    setStatus("Connecting...");

    m_client->setHostname(host);
    m_client->setPort(port);

    if (!username.isEmpty()) {
        m_client->setUsername(username);
    }
    if (!password.isEmpty()) {
        m_client->setPassword(password);
    }

    m_client->connectToHost();
}

void MqttClient::disconnect()
{
    if (m_client->state() != QMqttClient::Disconnected) {
        qInfo() << "Disconnecting from MQTT broker";
        m_autoReconnect = false;
        m_client->disconnectFromHost();
    }
}

void MqttClient::publish(const QString &topic, const QString &message,
                        quint8 qos, bool retain)
{
    if (!isConnected()) {
        qWarning() << "Cannot publish: not connected to MQTT broker";
        return;
    }

    m_client->publish(topic, message.toUtf8(), qos, retain);
    qDebug() << "Published to" << topic << ":" << message;
}

void MqttClient::publishJson(const QString &topic, const QVariantMap &data,
                             quint8 qos, bool retain)
{
    QJsonDocument doc = QJsonDocument::fromVariant(data);
    QString jsonString = QString::fromUtf8(doc.toJson(QJsonDocument::Compact));
    publish(topic, jsonString, qos, retain);
}

void MqttClient::subscribe(const QString &topic, quint8 qos)
{
    if (!isConnected()) {
        qWarning() << "Cannot subscribe: not connected to MQTT broker";
        return;
    }

    auto subscription = m_client->subscribe(topic, qos);
    if (subscription) {
        m_subscriptions[topic] = subscription;
        qInfo() << "Subscribed to topic:" << topic << "with QoS" << qos;

        connect(subscription, &QMqttSubscription::messageReceived,
                this, [this](QMqttMessage msg) {
            onMessageReceived(msg.payload(), msg.topic());
        });
    } else {
        qWarning() << "Failed to subscribe to topic:" << topic;
    }
}

void MqttClient::unsubscribe(const QString &topic)
{
    if (m_subscriptions.contains(topic)) {
        m_client->unsubscribe(topic);
        m_subscriptions.remove(topic);
        qInfo() << "Unsubscribed from topic:" << topic;
    }
}

bool MqttClient::isConnected() const
{
    return m_client && m_client->state() == QMqttClient::Connected;
}

QString MqttClient::clientId() const
{
    return m_client->clientId();
}

void MqttClient::setClientId(const QString &clientId)
{
    if (m_client->clientId() != clientId) {
        m_client->setClientId(clientId);
        emit clientIdChanged();
    }
}

void MqttClient::onConnected()
{
    qInfo() << "Connected to MQTT broker";
    setStatus("Connected");
    emit connectionStateChanged(true);
    m_autoReconnect = true;
}

void MqttClient::onDisconnected()
{
    qInfo() << "Disconnected from MQTT broker";
    setStatus("Disconnected");
    emit connectionStateChanged(false);

    // Auto-reconnect if enabled
    if (m_autoReconnect) {
        qInfo() << "Attempting to reconnect in 5 seconds...";
        QTimer::singleShot(5000, this, [this]() {
            if (m_autoReconnect && !isConnected()) {
                m_client->connectToHost();
            }
        });
    }
}

void MqttClient::onMessageReceived(const QByteArray &message, const QMqttTopicName &topic)
{
    QString topicStr = topic.name();
    QString messageStr = QString::fromUtf8(message);

    qDebug() << "MQTT message received on" << topicStr << ":" << messageStr;
    emit messageReceived(topicStr, messageStr);

    // Try to parse as JSON
    QJsonParseError parseError;
    QJsonDocument doc = QJsonDocument::fromJson(message, &parseError);

    if (parseError.error == QJsonParseError::NoError && doc.isObject()) {
        QVariantMap data = doc.object().toVariantMap();
        emit jsonMessageReceived(topicStr, data);
    }
}

void MqttClient::onStateChanged(QMqttClient::ClientState state)
{
    QString stateStr;
    switch (state) {
    case QMqttClient::Disconnected:
        stateStr = "Disconnected";
        break;
    case QMqttClient::Connecting:
        stateStr = "Connecting";
        break;
    case QMqttClient::Connected:
        stateStr = "Connected";
        break;
    }

    qDebug() << "MQTT client state changed:" << stateStr;
    setStatus(stateStr);
}

void MqttClient::onErrorChanged(QMqttClient::ClientError error)
{
    if (error == QMqttClient::NoError) {
        return;
    }

    QString errorMsg;
    switch (error) {
    case QMqttClient::InvalidProtocolVersion:
        errorMsg = "Invalid MQTT protocol version";
        break;
    case QMqttClient::IdRejected:
        errorMsg = "Client ID rejected";
        break;
    case QMqttClient::ServerUnavailable:
        errorMsg = "Server unavailable";
        break;
    case QMqttClient::BadUsernameOrPassword:
        errorMsg = "Bad username or password";
        break;
    case QMqttClient::NotAuthorized:
        errorMsg = "Not authorized";
        break;
    case QMqttClient::TransportInvalid:
        errorMsg = "Transport invalid";
        break;
    case QMqttClient::ProtocolViolation:
        errorMsg = "Protocol violation";
        break;
    case QMqttClient::UnknownError:
    default:
        errorMsg = "Unknown MQTT error";
        break;
    }

    qWarning() << "MQTT error:" << errorMsg;
    emit errorOccurred(errorMsg);
}

void MqttClient::setStatus(const QString &status)
{
    if (m_status != status) {
        m_status = status;
        emit statusChanged(status);
    }
}
