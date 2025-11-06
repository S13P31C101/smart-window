#pragma once

#include <QObject>
#include <QVariantMap>

/**
 * @brief Central event bus for sensor and system events
 *
 * Provides a decoupled communication mechanism between
 * different system components using signal/slot pattern.
 */
class SensorBus : public QObject
{
    Q_OBJECT

public:
    explicit SensorBus(QObject *parent = nullptr);
    ~SensorBus() = default;

    /**
     * @brief Publish an event to the bus
     * @param topic Event topic/category
     * @param data Event data
     */
    Q_INVOKABLE void publish(const QString &topic, const QVariantMap &data = QVariantMap());

    /**
     * @brief Publish a simple string event
     */
    Q_INVOKABLE void publishString(const QString &topic, const QString &message);

signals:
    // Generic event signal
    void eventReceived(const QString &topic, const QVariantMap &data);

    // Specific event signals for common use cases
    void lightLevelChanged(qreal level);
    void temperatureChanged(qreal celsius);
    void motionDetected(bool detected);
    void proximityChanged(qreal distance);
    void ambientSoundLevelChanged(qreal level);
    void timeOfDayChanged(const QString &period);  // morning, afternoon, evening, night
    void weatherConditionChanged(const QString &condition);
    void modeChanged(const QString &mode);
    void systemStateChanged(const QString &state);
};
