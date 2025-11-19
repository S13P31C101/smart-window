#pragma once

#include <QObject>
#include <QString>
#include <QTimer>
#include "core/RestClient.h"

/**
 * @brief Weather widget data provider
 *
 * Fetches weather data from OpenWeatherMap API.
 * Updates periodically and provides current weather information.
 */
class WeatherProvider : public QObject
{
    Q_OBJECT
    Q_PROPERTY(QString temperature READ temperature NOTIFY weatherDataChanged)
    Q_PROPERTY(QString condition READ condition NOTIFY weatherDataChanged)
    Q_PROPERTY(QString description READ description NOTIFY weatherDataChanged)
    Q_PROPERTY(QString iconCode READ iconCode NOTIFY weatherDataChanged)
    Q_PROPERTY(int humidity READ humidity NOTIFY weatherDataChanged)
    Q_PROPERTY(qreal windSpeed READ windSpeed NOTIFY weatherDataChanged)
    Q_PROPERTY(QString city READ city WRITE setCity NOTIFY cityChanged)
    Q_PROPERTY(bool loading READ loading NOTIFY loadingChanged)
    Q_PROPERTY(QString error READ error NOTIFY errorChanged)

public:
    explicit WeatherProvider(RestClient *restClient, QObject *parent = nullptr);
    ~WeatherProvider() = default;

    // Getters
    QString temperature() const { return m_temperature; }
    QString condition() const { return m_condition; }
    QString description() const { return m_description; }
    QString iconCode() const { return m_iconCode; }
    int humidity() const { return m_humidity; }
    qreal windSpeed() const { return m_windSpeed; }
    QString city() const { return m_city; }
    bool loading() const { return m_loading; }
    QString error() const { return m_error; }

    /**
     * @brief Set city for weather data
     */
    void setCity(const QString &city);

    /**
     * @brief Set API key for OpenWeatherMap
     */
    Q_INVOKABLE void setApiKey(const QString &apiKey);

    /**
     * @brief Fetch weather data immediately
     */
    Q_INVOKABLE void fetchWeather();

    /**
     * @brief Set update interval in minutes
     */
    Q_INVOKABLE void setUpdateInterval(int minutes);

signals:
    void weatherDataChanged();
    void cityChanged();
    void loadingChanged();
    void errorChanged();

private slots:
    void onWeatherDataReceived(const QVariantMap &data, const QString &error);

private:
    void parseWeatherData(const QVariantMap &data);
    void setLoading(bool loading);
    void setError(const QString &error);

    RestClient *m_restClient{nullptr};
    QTimer *m_updateTimer{nullptr};

    QString m_temperature{"--"};
    QString m_condition;
    QString m_description;
    QString m_iconCode;
    int m_humidity{0};
    qreal m_windSpeed{0.0};
    QString m_city{"Seoul"};
    bool m_loading{false};
    QString m_error;

    QString m_apiKey;
    QString m_apiUrl{"https://api.openweathermap.org/data/2.5/weather"};

    static constexpr int DEFAULT_UPDATE_INTERVAL_MS = 600000;  // 10 minutes
};
