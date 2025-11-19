#include "SensorBus.h"
#include <QDebug>

SensorBus::SensorBus(QObject *parent)
    : QObject(parent)
{
}

void SensorBus::publish(const QString &topic, const QVariantMap &data)
{
    qDebug() << "SensorBus:" << topic << data;
    emit eventReceived(topic, data);

    // Route to specific signals based on topic
    if (topic == "light/level" && data.contains("level")) {
        emit lightLevelChanged(data["level"].toReal());
    } else if (topic == "temperature" && data.contains("celsius")) {
        emit temperatureChanged(data["celsius"].toReal());
    } else if (topic == "motion" && data.contains("detected")) {
        emit motionDetected(data["detected"].toBool());
    } else if (topic == "proximity" && data.contains("distance")) {
        emit proximityChanged(data["distance"].toReal());
    } else if (topic == "sound/level" && data.contains("level")) {
        emit ambientSoundLevelChanged(data["level"].toReal());
    } else if (topic == "time/period" && data.contains("period")) {
        emit timeOfDayChanged(data["period"].toString());
    } else if (topic == "weather/condition" && data.contains("condition")) {
        emit weatherConditionChanged(data["condition"].toString());
    } else if (topic == "system/mode" && data.contains("mode")) {
        emit modeChanged(data["mode"].toString());
    } else if (topic == "system/state" && data.contains("state")) {
        emit systemStateChanged(data["state"].toString());
    }
}

void SensorBus::publishString(const QString &topic, const QString &message)
{
    QVariantMap data;
    data["message"] = message;
    publish(topic, data);
}
