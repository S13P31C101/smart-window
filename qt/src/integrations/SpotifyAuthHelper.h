#pragma once

#include <QObject>
#include <QString>
#include "core/RestClient.h"

/**
 * @brief Spotify OAuth authentication helper
 *
 * Provides utility functions for Spotify OAuth flow.
 * Supports PKCE (Proof Key for Code Exchange) for secure authentication.
 */
class SpotifyAuthHelper : public QObject
{
    Q_OBJECT
    Q_PROPERTY(QString authUrl READ authUrl NOTIFY authUrlChanged)
    Q_PROPERTY(bool authenticated READ authenticated NOTIFY authenticationChanged)

public:
    explicit SpotifyAuthHelper(RestClient *restClient, QObject *parent = nullptr);
    ~SpotifyAuthHelper() = default;

    /**
     * @brief Get authorization URL for OAuth flow
     */
    QString authUrl() const { return m_authUrl; }

    /**
     * @brief Check if authenticated
     */
    bool authenticated() const { return m_authenticated; }

    /**
     * @brief Initialize OAuth flow
     * @param clientId Spotify client ID
     * @param redirectUri Redirect URI
     * @param scopes Space-separated list of scopes
     */
    Q_INVOKABLE void initAuth(const QString &clientId,
                              const QString &redirectUri,
                              const QString &scopes);

    /**
     * @brief Handle callback with authorization code
     * @param code Authorization code from callback
     */
    Q_INVOKABLE void handleCallback(const QString &code);

    /**
     * @brief Try to restore authentication from saved tokens
     */
    Q_INVOKABLE void restoreAuthentication();

    /**
     * @brief Refresh access token using refresh token
     */
    Q_INVOKABLE void refreshAccessToken();

signals:
    void authUrlChanged();
    void authenticationChanged();
    void accessTokenReceived(const QString &token, int expiresIn);
    void authenticationFailed(const QString &error);

private:
    QString generateCodeVerifier();
    QString generateCodeChallenge(const QString &verifier);
    void exchangeToken(const QString &code);
    void saveTokens(const QString &accessToken, const QString &refreshToken, int expiresIn);
    bool loadTokens(QString &accessToken, QString &refreshToken);

    RestClient *m_restClient{nullptr};
    QString m_authUrl;
    bool m_authenticated{false};
    QString m_codeVerifier;
    QString m_clientId;
    QString m_redirectUri;
    QString m_refreshToken;
};
