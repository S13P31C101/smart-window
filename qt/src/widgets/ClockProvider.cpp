#include "ClockProvider.h"

ClockProvider::ClockProvider(QObject *parent)
    : QObject(parent)
{
    m_timer = new QTimer(this);
    connect(m_timer, &QTimer::timeout, this, &ClockProvider::updateTime);

    // Update every second
    m_timer->start(1000);

    // Initialize with current time
    updateTime();
}

QString ClockProvider::timeString() const
{
    if (m_is24HourFormat) {
        return m_currentTime.toString("HH:mm:ss");
    } else {
        return m_currentTime.toString("hh:mm:ss AP");
    }
}

QString ClockProvider::dateString() const
{
    return m_currentTime.toString("yyyy-MM-dd");
}

QString ClockProvider::dayOfWeek() const
{
    return m_currentTime.toString("dddd");
}

QString ClockProvider::period() const
{
    int hour = m_currentTime.time().hour();

    if (hour >= 5 && hour < 12) {
        return "Morning";
    } else if (hour >= 12 && hour < 17) {
        return "Afternoon";
    } else if (hour >= 17 && hour < 21) {
        return "Evening";
    } else {
        return "Night";
    }
}

void ClockProvider::set24HourFormat(bool format)
{
    if (m_is24HourFormat != format) {
        m_is24HourFormat = format;
        emit formatChanged();
        emit timeChanged();
    }
}

QString ClockProvider::getFormattedTime(const QString &format) const
{
    return m_currentTime.toString(format);
}

QString ClockProvider::getFormattedDate(const QString &format) const
{
    return m_currentTime.toString(format);
}

void ClockProvider::updateTime()
{
    QDateTime newTime = QDateTime::currentDateTime();
    QDate newDate = newTime.date();

    bool timeChangedFlag = (m_currentTime.time() != newTime.time());
    bool dateChangedFlag = (m_currentDate != newDate);

    m_currentTime = newTime;
    m_currentDate = newDate;

    if (timeChangedFlag) {
        emit timeChanged();
    }

    if (dateChangedFlag) {
        emit dateChanged();
    }
}
