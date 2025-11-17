#include "AlarmManager.h"
#include <QDebug>
#include <QJsonDocument>
#include <QJsonArray>
#include <QJsonObject>
#include <QFile>
#include <QDir>

// ============================================================================
// Alarm struct implementation
// ============================================================================

QVariantMap Alarm::toVariantMap() const
{
    QVariantMap map;
    map["alarmId"] = alarmId;
    map["deviceId"] = deviceId;
    map["alarmName"] = alarmName;
    map["alarmTime"] = alarmTime.toString("HH:mm:ss");

    // Convert repeatDays set to list
    QVariantList daysList;
    for (int day : repeatDays) {
        if (day >= 1 && day <= 7) {
            // Convert to English day names
            QString dayStr;
            switch (day) {
                case 1: dayStr = "MONDAY"; break;
                case 2: dayStr = "TUESDAY"; break;
                case 3: dayStr = "WEDNESDAY"; break;
                case 4: dayStr = "THURSDAY"; break;
                case 5: dayStr = "FRIDAY"; break;
                case 6: dayStr = "SATURDAY"; break;
                case 7: dayStr = "SUNDAY"; break;
            }
            daysList.append(dayStr);
        }
    }
    map["repeatDays"] = daysList;
    map["isActive"] = isActive;
    map["createdAt"] = createdAt.toString(Qt::ISODate);

    return map;
}

Alarm Alarm::fromVariantMap(const QVariantMap &map)
{
    Alarm alarm;
    alarm.alarmId = map.value("alarmId").toLongLong();
    alarm.deviceId = map.value("deviceId").toLongLong();
    alarm.alarmName = map.value("alarmName").toString();
    alarm.alarmTime = QTime::fromString(map.value("alarmTime").toString(), "HH:mm:ss");
    alarm.isActive = map.value("isActive").toBool();

    // Parse createdAt
    QString createdAtStr = map.value("createdAt").toString();
    if (!createdAtStr.isEmpty()) {
        alarm.createdAt = QDateTime::fromString(createdAtStr, Qt::ISODate);
    }

    // Parse repeatDays
    QVariantList daysList = map.value("repeatDays").toList();
    for (const QVariant &dayVar : daysList) {
        QString dayStr = dayVar.toString();
        int day = 0;
        if (dayStr == "MONDAY") day = 1;
        else if (dayStr == "TUESDAY") day = 2;
        else if (dayStr == "WEDNESDAY") day = 3;
        else if (dayStr == "THURSDAY") day = 4;
        else if (dayStr == "FRIDAY") day = 5;
        else if (dayStr == "SATURDAY") day = 6;
        else if (dayStr == "SUNDAY") day = 7;

        if (day > 0) {
            alarm.repeatDays.insert(day);
        }
    }

    return alarm;
}

bool Alarm::shouldTrigger(const QDateTime &currentTime) const
{
    if (!isActive) {
        return false;
    }

    // Check if already triggered today
    if (lastTriggered.isValid() && lastTriggered == currentTime.date()) {
        return false;
    }

    // Check time (only hour and minute, ignore seconds for 1-minute window)
    QTime currentTimeOnly = currentTime.time();
    if (currentTimeOnly.hour() != alarmTime.hour() ||
        currentTimeOnly.minute() != alarmTime.minute()) {
        return false;
    }

    // Check day of week
    int currentDayOfWeek = currentTime.date().dayOfWeek(); // 1=Monday, 7=Sunday
    if (repeatDays.isEmpty() || repeatDays.contains(currentDayOfWeek)) {
        return true;
    }

    return false;
}

// ============================================================================
// AlarmManager implementation
// ============================================================================

AlarmManager::AlarmManager(QObject *parent)
    : QObject(parent)
{
    // Create timer but don't start yet (will start in initialize())
    m_checkTimer = new QTimer(this);
    m_checkTimer->setInterval(1000); // Check every 1 second
    connect(m_checkTimer, &QTimer::timeout, this, &AlarmManager::checkAlarms);
}

void AlarmManager::initialize(const QString &storageFilePath)
{
    m_storageFilePath = storageFilePath;

    qInfo() << "========================================";
    qInfo() << "AlarmManager initializing...";
    qInfo() << "Storage file:" << m_storageFilePath;

    // Load alarms from file
    if (loadFromFile()) {
        qInfo() << "✓ Loaded" << m_alarms.size() << "alarms from storage";
    } else {
        qWarning() << "No existing alarms found or failed to load";
    }

    // Start alarm checking timer
    startAlarmTimer();

    qInfo() << "AlarmManager initialized successfully";
    qInfo() << "========================================";
}

bool AlarmManager::loadFromFile()
{
    QFile file(m_storageFilePath);
    if (!file.exists()) {
        qInfo() << "Alarm storage file does not exist yet:" << m_storageFilePath;
        return false;
    }

    if (!file.open(QIODevice::ReadOnly)) {
        qWarning() << "Failed to open alarm storage file:" << m_storageFilePath;
        return false;
    }

    QByteArray data = file.readAll();
    file.close();

    QJsonDocument doc = QJsonDocument::fromJson(data);
    if (!doc.isArray()) {
        qWarning() << "Invalid alarm storage format (expected array)";
        return false;
    }

    // Clear existing alarms
    m_alarms.clear();

    // Load alarms
    QJsonArray alarmArray = doc.array();
    for (const QJsonValue &val : alarmArray) {
        if (!val.isObject()) {
            continue;
        }

        QVariantMap alarmMap = val.toObject().toVariantMap();
        Alarm alarm = Alarm::fromVariantMap(alarmMap);

        if (alarm.alarmId > 0) {
            m_alarms[alarm.alarmId] = alarm;
        }
    }

    emit alarmsChanged();

    qInfo() << "Loaded" << m_alarms.size() << "alarms from file";
    return true;
}

bool AlarmManager::saveToFile()
{
    QJsonArray alarmArray;

    for (const Alarm &alarm : m_alarms.values()) {
        QVariantMap alarmMap = alarm.toVariantMap();
        alarmArray.append(QJsonObject::fromVariantMap(alarmMap));
    }

    QJsonDocument doc(alarmArray);

    QFile file(m_storageFilePath);
    if (!file.open(QIODevice::WriteOnly)) {
        qWarning() << "Failed to open alarm storage file for writing:" << m_storageFilePath;
        return false;
    }

    qint64 bytesWritten = file.write(doc.toJson(QJsonDocument::Indented));
    file.close();

    if (bytesWritten > 0) {
        qInfo() << "Saved" << m_alarms.size() << "alarms to file";
        return true;
    } else {
        qWarning() << "Failed to write alarms to file";
        return false;
    }
}

void AlarmManager::handleAlarmUpsert(const QVariantMap &alarmData)
{
    Alarm alarm = Alarm::fromVariantMap(alarmData);

    if (alarm.alarmId <= 0) {
        qWarning() << "Invalid alarm ID in UPSERT message";
        return;
    }

    // Check if this is new or update
    bool isNew = !m_alarms.contains(alarm.alarmId);

    // Store alarm
    m_alarms[alarm.alarmId] = alarm;

    // Save to file
    saveToFile();

    // Emit signals
    emit alarmUpdated(alarm.alarmId);
    emit alarmsChanged();

    qInfo() << (isNew ? "Created" : "Updated") << "alarm:"
            << alarm.alarmName
            << "at" << alarm.alarmTime.toString("HH:mm:ss")
            << "isActive:" << alarm.isActive;
}

void AlarmManager::handleAlarmDelete(const QVariantMap &alarmData)
{
    qint64 alarmId = alarmData.value("alarmId").toLongLong();

    if (alarmId <= 0) {
        qWarning() << "Invalid alarm ID in DELETE message";
        return;
    }

    if (!m_alarms.contains(alarmId)) {
        qWarning() << "Alarm not found for deletion:" << alarmId;
        return;
    }

    // Remove alarm
    Alarm removedAlarm = m_alarms.take(alarmId);

    // Save to file
    saveToFile();

    // Emit signals
    emit alarmDeleted(alarmId);
    emit alarmsChanged();

    qInfo() << "Deleted alarm:" << removedAlarm.alarmName << "(ID:" << alarmId << ")";
}

void AlarmManager::handleAlarmList(const QVariantList &alarmList)
{
    qInfo() << "========================================";
    qInfo() << "Received alarm list from backend:" << alarmList.size() << "alarms";

    // Clear existing alarms
    m_alarms.clear();

    // Load all alarms
    for (const QVariant &alarmVar : alarmList) {
        QVariantMap alarmMap = alarmVar.toMap();
        Alarm alarm = Alarm::fromVariantMap(alarmMap);

        if (alarm.alarmId > 0) {
            m_alarms[alarm.alarmId] = alarm;
            qInfo() << "  -" << alarm.alarmName
                    << "at" << alarm.alarmTime.toString("HH:mm:ss")
                    << "active:" << alarm.isActive;
        }
    }

    // Save to file
    saveToFile();

    // Emit signal
    emit alarmsChanged();

    qInfo() << "✓ Synchronized" << m_alarms.size() << "alarms";
    qInfo() << "========================================";
}

void AlarmManager::requestAlarmsFromBackend(const QString &deviceUniqueId)
{
    if (deviceUniqueId.isEmpty()) {
        qWarning() << "Cannot request alarms: empty device unique ID";
        return;
    }

    QString topic = QString("/devices/%1/request/alarms").arg(deviceUniqueId);
    QString payload = ""; // Empty payload

    qInfo() << "Requesting alarms from backend via MQTT:" << topic;

    emit publishMqttRequest(topic, payload);
}

void AlarmManager::startAlarmTimer()
{
    if (m_checkTimer->isActive()) {
        qInfo() << "Alarm timer already running";
        return;
    }

    m_checkTimer->start();
    qInfo() << "✓ Alarm timer started (checking every 1 second)";
}

void AlarmManager::stopAlarmTimer()
{
    if (!m_checkTimer->isActive()) {
        return;
    }

    m_checkTimer->stop();
    qInfo() << "Alarm timer stopped";
}

void AlarmManager::dismissAlarm()
{
    if (!m_isAlarmTriggered) {
        qWarning() << "No alarm is currently triggered";
        return;
    }

    qInfo() << "========================================";
    qInfo() << "Dismissing alarm:" << m_currentAlarmName;
    qInfo() << "========================================";

    m_isAlarmTriggered = false;
    m_currentAlarmName.clear();
    m_currentAlarmId = 0;

    emit alarmTriggeredStateChanged();
    emit currentAlarmChanged();
}

QVariantList AlarmManager::getAllAlarms() const
{
    QVariantList result;
    for (const Alarm &alarm : m_alarms.values()) {
        result.append(alarm.toVariantMap());
    }
    return result;
}

QVariantMap AlarmManager::getAlarmById(qint64 alarmId) const
{
    if (m_alarms.contains(alarmId)) {
        return m_alarms[alarmId].toVariantMap();
    }
    return QVariantMap();
}

void AlarmManager::checkAlarms()
{
    // Don't check if an alarm is already triggered
    if (m_isAlarmTriggered) {
        return;
    }

    QDateTime currentTime = QDateTime::currentDateTime();

    for (Alarm &alarm : m_alarms) {
        if (alarm.shouldTrigger(currentTime)) {
            // Only trigger once per second (check if seconds == 0 to prevent multiple triggers)
            if (currentTime.time().second() == 0) {
                triggerAlarm(alarm);
                // Mark as triggered today
                alarm.lastTriggered = currentTime.date();
                break; // Only trigger one alarm at a time
            }
        }
    }
}

void AlarmManager::triggerAlarm(const Alarm &alarm)
{
    qInfo() << "========================================";
    qInfo() << "🔔 ALARM TRIGGERED! 🔔";
    qInfo() << "Name:" << alarm.alarmName;
    qInfo() << "Time:" << alarm.alarmTime.toString("HH:mm:ss");
    qInfo() << "========================================";

    m_isAlarmTriggered = true;
    m_currentAlarmName = alarm.alarmName;
    m_currentAlarmId = alarm.alarmId;

    emit alarmTriggered(alarm.toVariantMap());
    emit alarmTriggeredStateChanged();
    emit currentAlarmChanged();
}

int AlarmManager::parseDayOfWeek(const QString &dayStr) const
{
    if (dayStr == "MONDAY") return 1;
    if (dayStr == "TUESDAY") return 2;
    if (dayStr == "WEDNESDAY") return 3;
    if (dayStr == "THURSDAY") return 4;
    if (dayStr == "FRIDAY") return 5;
    if (dayStr == "SATURDAY") return 6;
    if (dayStr == "SUNDAY") return 7;
    return 0;
}

QString AlarmManager::dayOfWeekToString(int day) const
{
    switch (day) {
        case 1: return "MONDAY";
        case 2: return "TUESDAY";
        case 3: return "WEDNESDAY";
        case 4: return "THURSDAY";
        case 5: return "FRIDAY";
        case 6: return "SATURDAY";
        case 7: return "SUNDAY";
        default: return "";
    }
}
