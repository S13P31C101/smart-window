#pragma once

#include <QObject>
#include <QString>
#include <QNetworkAccessManager>
#include <QNetworkReply>
#include <QVariantMap>
#include <QUrl>
#include <QJSValue>
#include <functional>

/**
 * @brief REST API client
 *
 * Provides convenient methods for HTTP requests.
 * Supports GET, POST, PUT, DELETE with JSON payloads.
 */
class RestClient : public QObject
{
    Q_OBJECT
    Q_PROPERTY(int timeout READ timeout WRITE setTimeout NOTIFY timeoutChanged)

public:
    using ResponseCallback = std::function<void(const QVariantMap &, const QString &error)>;

    explicit RestClient(QObject *parent = nullptr);
    ~RestClient() = default;

    /**
     * @brief Perform GET request
     * @param url Target URL
     * @param headers Optional HTTP headers
     * @param callback Response callback
     */
    Q_INVOKABLE void get(const QString &url,
                        const QVariantMap &headers = QVariantMap(),
                        const QJSValue &callback = QJSValue());

    /**
     * @brief Perform POST request
     * @param url Target URL
     * @param data JSON data to send
     * @param headers Optional HTTP headers
     * @param callback Response callback
     */
    Q_INVOKABLE void post(const QString &url,
                         const QVariantMap &data,
                         const QVariantMap &headers = QVariantMap(),
                         const QJSValue &callback = QJSValue());

    /**
     * @brief Perform PUT request
     */
    Q_INVOKABLE void put(const QString &url,
                        const QVariantMap &data,
                        const QVariantMap &headers = QVariantMap(),
                        const QJSValue &callback = QJSValue());

    /**
     * @brief Perform DELETE request
     */
    Q_INVOKABLE void del(const QString &url,
                        const QVariantMap &headers = QVariantMap(),
                        const QJSValue &callback = QJSValue());

    /**
     * @brief Set default headers for all requests
     */
    Q_INVOKABLE void setDefaultHeaders(const QVariantMap &headers);

    /**
     * @brief Get/Set request timeout in milliseconds
     */
    int timeout() const { return m_timeout; }
    void setTimeout(int timeout);

    // C++ API with callback functions
    void get(const QString &url,
            const QVariantMap &headers,
            ResponseCallback callback);

    void post(const QString &url,
             const QVariantMap &data,
             const QVariantMap &headers,
             ResponseCallback callback);

    void put(const QString &url,
            const QVariantMap &data,
            const QVariantMap &headers,
            ResponseCallback callback);

    void del(const QString &url,
            const QVariantMap &headers,
            ResponseCallback callback);

signals:
    void requestCompleted(const QString &url, const QVariantMap &response);
    void requestFailed(const QString &url, const QString &error);
    void timeoutChanged();

private slots:
    void onReplyFinished();
    void onReplyError(QNetworkReply::NetworkError error);

private:
    QNetworkRequest prepareRequest(const QUrl &url, const QVariantMap &headers);
    void processReply(QNetworkReply *reply, ResponseCallback callback);

    QNetworkAccessManager *m_manager{nullptr};
    QVariantMap m_defaultHeaders;
    int m_timeout{30000};  // 30 seconds default
    QMap<QNetworkReply*, ResponseCallback> m_callbacks;
};
