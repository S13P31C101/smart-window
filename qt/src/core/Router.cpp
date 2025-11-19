#include "Router.h"
#include "MqttClient.h"
#include <QDebug>
#include <QJsonDocument>
#include <QJsonObject>

Router::Router(QObject *parent)
    : QObject(parent)
{
}

void Router::setMqttClient(MqttClient *client, const QString &deviceId)
{
    m_mqttClient = client;
    m_deviceId = deviceId;
    qInfo() << "Router: MQTT client configured with device ID:" << deviceId;
}

void Router::navigateTo(const QString &screen, const QVariantMap &params)
{
    if (screen == m_currentScreen) {
        qDebug() << "Already on screen:" << screen;
        return;
    }

    // Save current screen to history
    if (!m_currentScreen.isEmpty()) {
        HistoryEntry entry;
        entry.screen = m_currentScreen;
        entry.params = m_currentParams;
        m_history.push(entry);
        emit historyChanged();
    }

    // Navigate to new screen
    m_currentScreen = screen;
    m_currentParams = params;

    qInfo() << "Navigating to:" << screen;
    emit screenChanged(screen, params);

    // Publish mode status to MQTT
    publishModeStatus(screen);
}

void Router::goBack()
{
    if (m_history.isEmpty()) {
        qWarning() << "No history to go back to";
        return;
    }

    // Pop from history
    HistoryEntry entry = m_history.pop();
    m_currentScreen = entry.screen;
    m_currentParams = entry.params;

    qInfo() << "Going back to:" << m_currentScreen;
    emit screenChanged(m_currentScreen, m_currentParams);
    emit historyChanged();
    emit backPressed();

    // Publish mode status to MQTT
    publishModeStatus(m_currentScreen);
}

void Router::clearHistory()
{
    m_history.clear();
    emit historyChanged();
    qInfo() << "Navigation history cleared";
}

void Router::replace(const QString &screen, const QVariantMap &params)
{
    // Don't add to history, just replace current screen
    m_currentScreen = screen;
    m_currentParams = params;

    qInfo() << "Replacing screen with:" << screen;
    emit screenChanged(screen, params);

    // Publish mode status to MQTT
    publishModeStatus(screen);
}

QString Router::getModeName(const QString &screen) const
{
    if (screen == "menu") return "MENU_MODE";
    if (screen == "custom") return "CUSTOM_MODE";
    if (screen == "auto") return "AUTO_MODE";
    if (screen == "privacy") return "PRIVACY_MODE";
    if (screen == "glass") return "GLASS_MODE";

    // For other screens (loading, standby, alarm), return empty string
    return "";
}

void Router::publishModeStatus(const QString &screen)
{
    // Don't publish if MQTT client is not configured
    if (!m_mqttClient || m_deviceId.isEmpty()) {
        return;
    }

    // Get mode name from screen identifier
    QString modeName = getModeName(screen);
    if (modeName.isEmpty()) {
        // Don't publish for non-mode screens (loading, standby, alarm, etc.)
        return;
    }

    // Check if MQTT is connected
    if (!m_mqttClient->isConnected()) {
        qWarning() << "Router: Cannot publish mode status - MQTT not connected";
        return;
    }

    // Prepare topic and payload
    QString statusTopic = QString("/devices/%1/status/mode").arg(m_deviceId);
    QVariantMap payload;
    payload["status"] = modeName;

    // Publish to MQTT
    m_mqttClient->publishJson(statusTopic, payload, 1);
    qInfo() << "Router: Published mode status:" << modeName << "to" << statusTopic;
}
