#include "SpotifyAuthHelper.h"
#include <QCryptographicHash>
#include <QRandomGenerator>
#include <QUrlQuery>
#include <QJsonDocument>
#include <QJsonObject>
#include <QNetworkAccessManager>
#include <QNetworkRequest>
#include <QNetworkReply>
#include <QSettings>
#include <QDateTime>
#include <QDebug>

SpotifyAuthHelper::SpotifyAuthHelper(RestClient *restClient, QObject *parent)
    : QObject(parent)
    , m_restClient(restClient)
{
}

void SpotifyAuthHelper::initAuth(const QString &clientId,
                                  const QString &redirectUri,
                                  const QString &scopes)
{
    m_clientId = clientId;
    m_redirectUri = redirectUri;

    // Generate PKCE code verifier
    m_codeVerifier = generateCodeVerifier();
    QString codeChallenge = generateCodeChallenge(m_codeVerifier);

    // Build authorization URL
    QUrlQuery query;
    query.addQueryItem("client_id", clientId);
    query.addQueryItem("response_type", "code");
    query.addQueryItem("redirect_uri", redirectUri);
    query.addQueryItem("scope", scopes);
    query.addQueryItem("code_challenge_method", "S256");
    query.addQueryItem("code_challenge", codeChallenge);

    m_authUrl = "https://accounts.spotify.com/authorize?" + query.toString();

    emit authUrlChanged();

    qInfo() << "Spotify auth URL generated. Open in browser to authenticate.";
    qDebug() << "Auth URL:" << m_authUrl;
}

void SpotifyAuthHelper::handleCallback(const QString &code)
{
    if (code.isEmpty()) {
        emit authenticationFailed("No authorization code received");
        return;
    }

    qInfo() << "Received authorization code, exchanging for access token...";
    exchangeToken(code);
}

void SpotifyAuthHelper::exchangeToken(const QString &code)
{
    QString url = "https://accounts.spotify.com/api/token";

    // Prepare URL-encoded form data
    QUrlQuery postData;
    postData.addQueryItem("grant_type", "authorization_code");
    postData.addQueryItem("code", code);
    postData.addQueryItem("redirect_uri", m_redirectUri);
    postData.addQueryItem("client_id", m_clientId);
    postData.addQueryItem("code_verifier", m_codeVerifier);

    QByteArray postDataBytes = postData.toString(QUrl::FullyEncoded).toUtf8();

    qDebug() << "Exchanging authorization code for access token...";
    qDebug() << "Request body:" << postData.toString();

    // Create custom network request with form-urlencoded content type
    QUrl requestUrl(url);
    QNetworkRequest request(requestUrl);
    request.setHeader(QNetworkRequest::ContentTypeHeader, "application/x-www-form-urlencoded");

    QNetworkAccessManager *manager = new QNetworkAccessManager(this);
    QNetworkReply *reply = manager->post(request, postDataBytes);

    connect(reply, &QNetworkReply::finished, this, [this, reply, manager]() {
        manager->deleteLater();

        if (reply->error() != QNetworkReply::NoError) {
            QString error = reply->errorString();
            qWarning() << "Token exchange network error:" << error;
            qWarning() << "Response:" << reply->readAll();
            emit authenticationFailed(error);
            reply->deleteLater();
            return;
        }

        QByteArray responseData = reply->readAll();
        reply->deleteLater();

        // Parse JSON response
        QJsonParseError parseError;
        QJsonDocument doc = QJsonDocument::fromJson(responseData, &parseError);

        if (parseError.error != QJsonParseError::NoError) {
            qWarning() << "JSON parse error:" << parseError.errorString();
            qWarning() << "Response:" << responseData;
            emit authenticationFailed("Invalid response from Spotify");
            return;
        }

        QJsonObject jsonObj = doc.object();

        if (jsonObj.contains("access_token")) {
            QString accessToken = jsonObj["access_token"].toString();
            QString refreshToken = jsonObj["refresh_token"].toString();
            int expiresIn = jsonObj["expires_in"].toInt();

            // Save tokens for future use
            saveTokens(accessToken, refreshToken, expiresIn);
            m_refreshToken = refreshToken;

            m_authenticated = true;
            emit authenticationChanged();
            emit accessTokenReceived(accessToken, expiresIn);

            qInfo() << "Successfully authenticated with Spotify";
            qDebug() << "Access token expires in" << expiresIn << "seconds";
        } else if (jsonObj.contains("error")) {
            QString error = jsonObj["error"].toString();
            QString errorDesc = jsonObj["error_description"].toString();
            qWarning() << "Spotify API error:" << error << "-" << errorDesc;
            emit authenticationFailed(error + ": " + errorDesc);
        } else {
            qWarning() << "No access token in response:" << responseData;
            emit authenticationFailed("No access token received");
        }
    });
}

QString SpotifyAuthHelper::generateCodeVerifier()
{
    const QString chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
    QString verifier;

    for (int i = 0; i < 128; ++i) {
        int index = QRandomGenerator::global()->bounded(chars.length());
        verifier.append(chars.at(index));
    }

    return verifier;
}

QString SpotifyAuthHelper::generateCodeChallenge(const QString &verifier)
{
    QByteArray hash = QCryptographicHash::hash(verifier.toUtf8(), QCryptographicHash::Sha256);

    // Base64 URL encoding
    QString challenge = hash.toBase64(QByteArray::Base64UrlEncoding | QByteArray::OmitTrailingEquals);

    return challenge;
}

void SpotifyAuthHelper::saveTokens(const QString &accessToken, const QString &refreshToken, int expiresIn)
{
    QSettings settings("Lumiscape", "SpotifyAuth");
    settings.setValue("access_token", accessToken);
    settings.setValue("refresh_token", refreshToken);
    settings.setValue("expires_at", QDateTime::currentDateTime().addSecs(expiresIn).toSecsSinceEpoch());

    qInfo() << "Spotify tokens saved successfully";
}

bool SpotifyAuthHelper::loadTokens(QString &accessToken, QString &refreshToken)
{
    QSettings settings("Lumiscape", "SpotifyAuth");

    if (!settings.contains("refresh_token")) {
        qDebug() << "No saved Spotify tokens found";
        return false;
    }

    accessToken = settings.value("access_token").toString();
    refreshToken = settings.value("refresh_token").toString();
    qint64 expiresAt = settings.value("expires_at").toLongLong();

    // Check if access token is still valid
    if (QDateTime::currentDateTime().toSecsSinceEpoch() < expiresAt) {
        qInfo() << "Loaded valid access token from storage";
        return true;
    } else {
        qInfo() << "Access token expired, will need to refresh";
        return false;
    }
}

void SpotifyAuthHelper::restoreAuthentication()
{
    QString accessToken, refreshToken;

    if (loadTokens(accessToken, refreshToken)) {
        // Access token is still valid
        m_refreshToken = refreshToken;
        m_authenticated = true;
        emit authenticationChanged();
        emit accessTokenReceived(accessToken, 3600); // Approximate expiry
        qInfo() << "Authentication restored from saved tokens";
    } else if (!refreshToken.isEmpty()) {
        // Need to refresh the access token
        m_refreshToken = refreshToken;
        refreshAccessToken();
    } else {
        qInfo() << "No valid tokens found, user needs to authenticate";
    }
}

void SpotifyAuthHelper::refreshAccessToken()
{
    if (m_refreshToken.isEmpty()) {
        qWarning() << "No refresh token available";
        emit authenticationFailed("No refresh token");
        return;
    }

    QString url = "https://accounts.spotify.com/api/token";

    QUrlQuery postData;
    postData.addQueryItem("grant_type", "refresh_token");
    postData.addQueryItem("refresh_token", m_refreshToken);
    postData.addQueryItem("client_id", m_clientId);

    QByteArray postDataBytes = postData.toString(QUrl::FullyEncoded).toUtf8();

    qDebug() << "Refreshing Spotify access token...";

    QUrl requestUrl(url);
    QNetworkRequest request(requestUrl);
    request.setHeader(QNetworkRequest::ContentTypeHeader, "application/x-www-form-urlencoded");

    QNetworkAccessManager *manager = new QNetworkAccessManager(this);
    QNetworkReply *reply = manager->post(request, postDataBytes);

    connect(reply, &QNetworkReply::finished, this, [this, reply, manager]() {
        manager->deleteLater();

        if (reply->error() != QNetworkReply::NoError) {
            QString error = reply->errorString();
            qWarning() << "Token refresh error:" << error;
            emit authenticationFailed(error);
            reply->deleteLater();
            return;
        }

        QByteArray responseData = reply->readAll();
        reply->deleteLater();

        QJsonParseError parseError;
        QJsonDocument doc = QJsonDocument::fromJson(responseData, &parseError);

        if (parseError.error != QJsonParseError::NoError) {
            qWarning() << "JSON parse error:" << parseError.errorString();
            emit authenticationFailed("Invalid response");
            return;
        }

        QJsonObject jsonObj = doc.object();

        if (jsonObj.contains("access_token")) {
            QString accessToken = jsonObj["access_token"].toString();
            int expiresIn = jsonObj["expires_in"].toInt();

            // Refresh token might be updated
            if (jsonObj.contains("refresh_token")) {
                m_refreshToken = jsonObj["refresh_token"].toString();
            }

            saveTokens(accessToken, m_refreshToken, expiresIn);

            m_authenticated = true;
            emit authenticationChanged();
            emit accessTokenReceived(accessToken, expiresIn);

            qInfo() << "Access token refreshed successfully";
        } else {
            qWarning() << "No access token in refresh response";
            emit authenticationFailed("Token refresh failed");
        }
    });
}
