#include "WeatherProvider.h"
#include <QDebug>

WeatherProvider::WeatherProvider(RestClient *restClient, QObject *parent)
    : QObject(parent)
    , m_restClient(restClient)
{
    m_updateTimer = new QTimer(this);
    connect(m_updateTimer, &QTimer::timeout, this, &WeatherProvider::fetchWeather);
    m_updateTimer->start(DEFAULT_UPDATE_INTERVAL_MS);
}

void WeatherProvider::setCity(const QString &city)
{
    if (m_city != city) {
        m_city = city;
        emit cityChanged();

        // Fetch new weather data
        fetchWeather();
    }
}

void WeatherProvider::setApiKey(const QString &apiKey)
{
    m_apiKey = apiKey;

    // Fetch weather data when API key is set
    if (!m_apiKey.isEmpty()) {
        fetchWeather();
    }
}

void WeatherProvider::fetchWeather()
{
    if (m_apiKey.isEmpty()) {
        setError("API key not configured");
        qWarning() << "Weather API key not set";
        return;
    }

    if (m_city.isEmpty()) {
        setError("City not specified");
        return;
    }

    setLoading(true);
    setError(QString());

    QString url = QString("%1?q=%2&appid=%3&units=metric")
                      .arg(m_apiUrl)
                      .arg(m_city)
                      .arg(m_apiKey);

    qDebug() << "Fetching weather for:" << m_city;

    m_restClient->get(url, QVariantMap(),
                      [this](const QVariantMap &data, const QString &error) {
        onWeatherDataReceived(data, error);
    });
}

void WeatherProvider::setUpdateInterval(int minutes)
{
    int intervalMs = minutes * 60 * 1000;
    m_updateTimer->setInterval(intervalMs);
    qInfo() << "Weather update interval set to" << minutes << "minutes";
}

void WeatherProvider::onWeatherDataReceived(const QVariantMap &data, const QString &error)
{
    setLoading(false);

    if (!error.isEmpty()) {
        setError(error);
        qWarning() << "Weather data error:" << error;
        return;
    }

    parseWeatherData(data);
    emit weatherDataChanged();
}

void WeatherProvider::parseWeatherData(const QVariantMap &data)
{
    // Parse main weather data
    if (data.contains("main")) {
        QVariantMap main = data["main"].toMap();

        if (main.contains("temp")) {
            m_temperature = QString::number(qRound(main["temp"].toDouble())) + "°C";
        }

        if (main.contains("humidity")) {
            m_humidity = main["humidity"].toInt();
        }
    }

    // Parse weather condition
    if (data.contains("weather")) {
        QVariantList weather = data["weather"].toList();
        if (!weather.isEmpty()) {
            QVariantMap weatherItem = weather.first().toMap();

            if (weatherItem.contains("main")) {
                m_condition = weatherItem["main"].toString();
            }

            if (weatherItem.contains("description")) {
                m_description = weatherItem["description"].toString();
            }

            if (weatherItem.contains("icon")) {
                m_iconCode = weatherItem["icon"].toString();
            }
        }
    }

    // Parse wind data
    if (data.contains("wind")) {
        QVariantMap wind = data["wind"].toMap();
        if (wind.contains("speed")) {
            m_windSpeed = wind["speed"].toDouble();
        }
    }

    qInfo() << "Weather updated:" << m_city << m_temperature << m_condition;
}

void WeatherProvider::setLoading(bool loading)
{
    if (m_loading != loading) {
        m_loading = loading;
        emit loadingChanged();
    }
}

void WeatherProvider::setError(const QString &error)
{
    if (m_error != error) {
        m_error = error;
        emit errorChanged();
    }
}
