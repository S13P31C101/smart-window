#include "RestClient.h"
#include <QNetworkRequest>
#include <QNetworkReply>
#include <QJsonDocument>
#include <QJsonObject>
#include <QJsonArray>
#include <QTimer>
#include <QDebug>
#include <QJSValue>
#include <QQmlEngine>

RestClient::RestClient(QObject *parent)
    : QObject(parent)
{
    m_manager = new QNetworkAccessManager(this);

    // Set default headers
    m_defaultHeaders["Content-Type"] = "application/json";
    m_defaultHeaders["Accept"] = "application/json";
}

void RestClient::get(const QString &url, const QVariantMap &headers, const QJSValue &callback)
{
    get(url, headers, [this, url, callback](const QVariantMap &response, const QString &error) {
        if (callback.isCallable()) {
            QJSValueList args;
            args << QJSValue(error);
            args << m_manager->parent()->property("engine").value<QQmlEngine*>()
                    ->toScriptValue(response);
            const_cast<QJSValue&>(callback).call(args);
        }

        if (error.isEmpty()) {
            emit requestCompleted(url, response);
        } else {
            emit requestFailed(url, error);
        }
    });
}

void RestClient::post(const QString &url, const QVariantMap &data,
                     const QVariantMap &headers, const QJSValue &callback)
{
    post(url, data, headers, [this, url, callback](const QVariantMap &response, const QString &error) {
        if (callback.isCallable()) {
            QJSValueList args;
            args << QJSValue(error);
            args << m_manager->parent()->property("engine").value<QQmlEngine*>()
                    ->toScriptValue(response);
            const_cast<QJSValue&>(callback).call(args);
        }

        if (error.isEmpty()) {
            emit requestCompleted(url, response);
        } else {
            emit requestFailed(url, error);
        }
    });
}

void RestClient::put(const QString &url, const QVariantMap &data,
                    const QVariantMap &headers, const QJSValue &callback)
{
    put(url, data, headers, [this, url, callback](const QVariantMap &response, const QString &error) {
        if (callback.isCallable()) {
            QJSValueList args;
            args << QJSValue(error);
            args << m_manager->parent()->property("engine").value<QQmlEngine*>()
                    ->toScriptValue(response);
            const_cast<QJSValue&>(callback).call(args);
        }

        if (error.isEmpty()) {
            emit requestCompleted(url, response);
        } else {
            emit requestFailed(url, error);
        }
    });
}

void RestClient::del(const QString &url, const QVariantMap &headers, const QJSValue &callback)
{
    del(url, headers, [this, url, callback](const QVariantMap &response, const QString &error) {
        if (callback.isCallable()) {
            QJSValueList args;
            args << QJSValue(error);
            args << m_manager->parent()->property("engine").value<QQmlEngine*>()
                    ->toScriptValue(response);
            const_cast<QJSValue&>(callback).call(args);
        }

        if (error.isEmpty()) {
            emit requestCompleted(url, response);
        } else {
            emit requestFailed(url, error);
        }
    });
}

void RestClient::setDefaultHeaders(const QVariantMap &headers)
{
    m_defaultHeaders = headers;
}

void RestClient::setTimeout(int timeout)
{
    if (m_timeout != timeout) {
        m_timeout = timeout;
        emit timeoutChanged();
    }
}

void RestClient::get(const QString &url, const QVariantMap &headers, ResponseCallback callback)
{
    QNetworkRequest request = prepareRequest(QUrl(url), headers);
    QNetworkReply *reply = m_manager->get(request);

    m_callbacks[reply] = callback;
    processReply(reply, callback);

    qDebug() << "GET request to:" << url;
}

void RestClient::post(const QString &url, const QVariantMap &data,
                     const QVariantMap &headers, ResponseCallback callback)
{
    QNetworkRequest request = prepareRequest(QUrl(url), headers);
    QJsonDocument doc = QJsonDocument::fromVariant(data);
    QByteArray jsonData = doc.toJson();

    QNetworkReply *reply = m_manager->post(request, jsonData);

    m_callbacks[reply] = callback;
    processReply(reply, callback);

    qDebug() << "POST request to:" << url << "with data:" << jsonData;
}

void RestClient::put(const QString &url, const QVariantMap &data,
                    const QVariantMap &headers, ResponseCallback callback)
{
    QNetworkRequest request = prepareRequest(QUrl(url), headers);
    QJsonDocument doc = QJsonDocument::fromVariant(data);
    QByteArray jsonData = doc.toJson();

    QNetworkReply *reply = m_manager->put(request, jsonData);

    m_callbacks[reply] = callback;
    processReply(reply, callback);

    qDebug() << "PUT request to:" << url << "with data:" << jsonData;
}

void RestClient::del(const QString &url, const QVariantMap &headers, ResponseCallback callback)
{
    QNetworkRequest request = prepareRequest(QUrl(url), headers);
    QNetworkReply *reply = m_manager->deleteResource(request);

    m_callbacks[reply] = callback;
    processReply(reply, callback);

    qDebug() << "DELETE request to:" << url;
}

QNetworkRequest RestClient::prepareRequest(const QUrl &url, const QVariantMap &headers)
{
    QNetworkRequest request(url);

    // Apply default headers
    for (auto it = m_defaultHeaders.begin(); it != m_defaultHeaders.end(); ++it) {
        request.setRawHeader(it.key().toUtf8(), it.value().toString().toUtf8());
    }

    // Apply request-specific headers (override defaults)
    for (auto it = headers.begin(); it != headers.end(); ++it) {
        request.setRawHeader(it.key().toUtf8(), it.value().toString().toUtf8());
    }

    // Set timeout attribute
    request.setTransferTimeout(m_timeout);

    return request;
}

void RestClient::processReply(QNetworkReply *reply, ResponseCallback callback)
{
    // Setup timeout timer
    QTimer *timeoutTimer = new QTimer(reply);
    timeoutTimer->setSingleShot(true);
    timeoutTimer->setInterval(m_timeout);

    connect(timeoutTimer, &QTimer::timeout, reply, [reply]() {
        if (reply->isRunning()) {
            reply->abort();
        }
    });

    timeoutTimer->start();

    // Handle completion
    connect(reply, &QNetworkReply::finished, this, [this, reply, callback, timeoutTimer]() {
        timeoutTimer->stop();
        m_callbacks.remove(reply);

        if (reply->error() != QNetworkReply::NoError) {
            QString error = reply->errorString();
            qWarning() << "Network error:" << error;
            callback(QVariantMap(), error);
        } else {
            QByteArray responseData = reply->readAll();

            // Try to parse as JSON
            QJsonParseError parseError;
            QJsonDocument doc = QJsonDocument::fromJson(responseData, &parseError);

            if (parseError.error == QJsonParseError::NoError && doc.isObject()) {
                QVariantMap response = doc.object().toVariantMap();
                callback(response, QString());
            } else if (parseError.error == QJsonParseError::NoError && doc.isArray()) {
                QVariantMap response;
                response["data"] = doc.array().toVariantList();
                callback(response, QString());
            } else {
                // Not JSON, return raw text
                QVariantMap response;
                response["text"] = QString::fromUtf8(responseData);
                callback(response, QString());
            }
        }

        reply->deleteLater();
    });

    // Handle errors
    connect(reply, QOverload<QNetworkReply::NetworkError>::of(&QNetworkReply::errorOccurred),
            this, [callback](QNetworkReply::NetworkError error) {
        Q_UNUSED(error)
        // Error will be handled in finished signal
    });
}

void RestClient::onReplyFinished()
{
    // Handled inline in processReply
}

void RestClient::onReplyError(QNetworkReply::NetworkError error)
{
    Q_UNUSED(error)
    // Handled inline in processReply
}
