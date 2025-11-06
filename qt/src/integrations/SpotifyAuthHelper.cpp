#include "SpotifyAuthHelper.h"
#include <QCryptographicHash>
#include <QRandomGenerator>
#include <QUrlQuery>
#include <QDebug>

SpotifyAuthHelper::SpotifyAuthHelper(QObject *parent)
    : QObject(parent)
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

    // In a real implementation, you would exchange the code for an access token
    // using RestClient. For now, we'll emit a placeholder signal.

    // This would be done via POST to https://accounts.spotify.com/api/token
    // with the code, code_verifier, client_id, redirect_uri

    // Placeholder:
    qWarning() << "Token exchange not fully implemented. Implement REST call to token endpoint.";

    // Simulated success
    m_authenticated = true;
    emit authenticationChanged();
    emit accessTokenReceived("placeholder_token", 3600);
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
