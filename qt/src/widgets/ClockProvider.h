#pragma once

#include <QObject>
#include <QString>
#include <QDateTime>
#include <QTimer>

/**
 * @brief Clock widget data provider
 *
 * Provides current time and date information.
 * Updates automatically every second.
 */
class ClockProvider : public QObject
{
    Q_OBJECT
    Q_PROPERTY(QString timeString READ timeString NOTIFY timeChanged)
    Q_PROPERTY(QString dateString READ dateString NOTIFY dateChanged)
    Q_PROPERTY(int hours READ hours NOTIFY timeChanged)
    Q_PROPERTY(int minutes READ minutes NOTIFY timeChanged)
    Q_PROPERTY(int seconds READ seconds NOTIFY timeChanged)
    Q_PROPERTY(QString dayOfWeek READ dayOfWeek NOTIFY dateChanged)
    Q_PROPERTY(QString period READ period NOTIFY timeChanged)
    Q_PROPERTY(bool is24HourFormat READ is24HourFormat WRITE set24HourFormat NOTIFY formatChanged)

public:
    explicit ClockProvider(QObject *parent = nullptr);
    ~ClockProvider() = default;

    QString timeString() const;
    QString dateString() const;
    int hours() const { return m_currentTime.time().hour(); }
    int minutes() const { return m_currentTime.time().minute(); }
    int seconds() const { return m_currentTime.time().second(); }
    QString dayOfWeek() const;
    QString period() const;  // AM/PM or Morning/Afternoon/Evening/Night

    bool is24HourFormat() const { return m_is24HourFormat; }
    void set24HourFormat(bool format);

    /**
     * @brief Get formatted time string
     * @param format Qt date/time format string
     */
    Q_INVOKABLE QString getFormattedTime(const QString &format) const;

    /**
     * @brief Get formatted date string
     * @param format Qt date/time format string
     */
    Q_INVOKABLE QString getFormattedDate(const QString &format) const;

signals:
    void timeChanged();
    void dateChanged();
    void formatChanged();

private slots:
    void updateTime();

private:
    QTimer *m_timer{nullptr};
    QDateTime m_currentTime;
    QDate m_currentDate;
    bool m_is24HourFormat{false};
};
