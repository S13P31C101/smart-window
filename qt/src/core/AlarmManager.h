#pragma once

#include <QObject>
#include <QTimer>
#include <QTime>
#include <QDateTime>
#include <QString>
#include <QVariantMap>
#include <QVariantList>
#include <QMap>
#include <QSet>
#include <QJsonDocument>
#include <QJsonArray>
#include <QJsonObject>
#include <QFile>

/**
 * @brief Alarm data structure
 *
 * Represents a single alarm with its properties.
 */
struct Alarm {
    qint64 alarmId{0};              // Unique alarm ID from backend
    qint64 deviceId{0};             // Device ID
    QString alarmName;              // User-defined alarm name
    QTime alarmTime;                // Time to trigger (HH:mm:ss)
    QSet<int> repeatDays;           // Days of week (1=Monday, 7=Sunday)
    bool isActive{true};            // Whether alarm is enabled
    QDateTime createdAt;            // Creation timestamp

    // For tracking if alarm was triggered today (to prevent duplicate triggers)
    QDate lastTriggered;

    /**
     * @brief Convert to QVariantMap for JSON serialization
     */
    QVariantMap toVariantMap() const;

    /**
     * @brief Create Alarm from QVariantMap (JSON deserialization)
     */
    static Alarm fromVariantMap(const QVariantMap &map);

    /**
     * @brief Check if alarm should trigger at given time
     */
    bool shouldTrigger(const QDateTime &currentTime) const;
};

/**
 * @brief Alarm management system
 *
 * Manages alarms with offline persistence, MQTT synchronization,
 * and automatic triggering.
 *
 * Features:
 * - JSON file-based storage (works offline)
 * - MQTT synchronization with backend
 * - Automatic alarm checking (1-second timer)
 * - Alarm triggering with visual/audio feedback
 */
class AlarmManager : public QObject
{
    Q_OBJECT
    Q_PROPERTY(bool isAlarmTriggered READ isAlarmTriggered NOTIFY alarmTriggeredStateChanged)
    Q_PROPERTY(QString currentAlarmName READ currentAlarmName NOTIFY currentAlarmChanged)
    Q_PROPERTY(int alarmCount READ alarmCount NOTIFY alarmsChanged)

public:
    explicit AlarmManager(QObject *parent = nullptr);
    ~AlarmManager() = default;

    /**
     * @brief Initialize alarm manager
     * @param storageFilePath Path to JSON storage file (default: "alarms.json")
     */
    Q_INVOKABLE void initialize(const QString &storageFilePath = "alarms.json");

    /**
     * @brief Load alarms from local storage
     * @return true if successful
     */
    Q_INVOKABLE bool loadFromFile();

    /**
     * @brief Save alarms to local storage
     * @return true if successful
     */
    Q_INVOKABLE bool saveToFile();

    /**
     * @brief Handle MQTT alarm message (UPSERT action)
     * @param alarmData Alarm data from backend
     */
    Q_INVOKABLE void handleAlarmUpsert(const QVariantMap &alarmData);

    /**
     * @brief Handle MQTT alarm deletion (DELETE action)
     * @param alarmData Alarm data with alarmId
     */
    Q_INVOKABLE void handleAlarmDelete(const QVariantMap &alarmData);

    /**
     * @brief Handle MQTT alarm list (full sync)
     * @param alarmList List of alarms from backend
     */
    Q_INVOKABLE void handleAlarmList(const QVariantList &alarmList);

    /**
     * @brief Request all alarms from backend via MQTT
     * @param deviceUniqueId Device unique identifier
     */
    Q_INVOKABLE void requestAlarmsFromBackend(const QString &deviceUniqueId);

    /**
     * @brief Start alarm checking timer
     */
    Q_INVOKABLE void startAlarmTimer();

    /**
     * @brief Stop alarm checking timer
     */
    Q_INVOKABLE void stopAlarmTimer();

    /**
     * @brief Dismiss currently triggered alarm
     */
    Q_INVOKABLE void dismissAlarm();

    /**
     * @brief Get all alarms as QVariantList (for QML)
     */
    Q_INVOKABLE QVariantList getAllAlarms() const;

    /**
     * @brief Get alarm by ID
     */
    Q_INVOKABLE QVariantMap getAlarmById(qint64 alarmId) const;

    // Property getters
    bool isAlarmTriggered() const { return m_isAlarmTriggered; }
    QString currentAlarmName() const { return m_currentAlarmName; }
    int alarmCount() const { return m_alarms.size(); }

signals:
    /**
     * @brief Emitted when alarm is triggered
     * @param alarm Alarm data
     */
    void alarmTriggered(const QVariantMap &alarm);

    /**
     * @brief Emitted when alarm triggered state changes
     */
    void alarmTriggeredStateChanged();

    /**
     * @brief Emitted when current alarm changes
     */
    void currentAlarmChanged();

    /**
     * @brief Emitted when alarms list is updated
     */
    void alarmsChanged();

    /**
     * @brief Emitted when an alarm is added or updated
     */
    void alarmUpdated(qint64 alarmId);

    /**
     * @brief Emitted when an alarm is deleted
     */
    void alarmDeleted(qint64 alarmId);

    /**
     * @brief Request to publish MQTT message
     * @param topic MQTT topic
     * @param payload Message payload
     */
    void publishMqttRequest(const QString &topic, const QString &payload);

private slots:
    /**
     * @brief Check all alarms (called every second)
     */
    void checkAlarms();

private:
    /**
     * @brief Parse day of week string to int
     * @param dayStr "MONDAY", "TUESDAY", etc.
     * @return 1-7 (Monday-Sunday), 0 if invalid
     */
    int parseDayOfWeek(const QString &dayStr) const;

    /**
     * @brief Convert int to day of week string
     * @param day 1-7 (Monday-Sunday)
     * @return "MONDAY", "TUESDAY", etc.
     */
    QString dayOfWeekToString(int day) const;

    /**
     * @brief Trigger alarm
     */
    void triggerAlarm(const Alarm &alarm);

    // Storage
    QString m_storageFilePath{"alarms.json"};
    QMap<qint64, Alarm> m_alarms;  // alarmId -> Alarm

    // Timer for checking alarms
    QTimer *m_checkTimer{nullptr};

    // Current triggered alarm state
    bool m_isAlarmTriggered{false};
    QString m_currentAlarmName;
    qint64 m_currentAlarmId{0};
};
