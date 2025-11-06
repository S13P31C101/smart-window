#pragma once

#include <QObject>
#include <QString>
#include <QStack>
#include <QVariantMap>

/**
 * @brief Screen navigation router
 *
 * Manages screen transitions and navigation history.
 * Supports navigation with parameters and back navigation.
 */
class Router : public QObject
{
    Q_OBJECT
    Q_PROPERTY(QString currentScreen READ currentScreen NOTIFY screenChanged)
    Q_PROPERTY(bool canGoBack READ canGoBack NOTIFY historyChanged)

public:
    explicit Router(QObject *parent = nullptr);
    ~Router() = default;

    /**
     * @brief Navigate to a screen
     * @param screen Screen identifier
     * @param params Optional parameters to pass to the screen
     */
    Q_INVOKABLE void navigateTo(const QString &screen, const QVariantMap &params = QVariantMap());

    /**
     * @brief Navigate back to previous screen
     */
    Q_INVOKABLE void goBack();

    /**
     * @brief Clear navigation history
     */
    Q_INVOKABLE void clearHistory();

    /**
     * @brief Replace current screen without adding to history
     * @param screen Screen identifier
     * @param params Optional parameters
     */
    Q_INVOKABLE void replace(const QString &screen, const QVariantMap &params = QVariantMap());

    /**
     * @brief Get current screen identifier
     */
    QString currentScreen() const { return m_currentScreen; }

    /**
     * @brief Get parameters for current screen
     */
    Q_INVOKABLE QVariantMap currentParams() const { return m_currentParams; }

    /**
     * @brief Check if back navigation is possible
     */
    bool canGoBack() const { return !m_history.isEmpty(); }

signals:
    void screenChanged(const QString &screen, const QVariantMap &params);
    void historyChanged();
    void backPressed();

private:
    struct HistoryEntry {
        QString screen;
        QVariantMap params;
    };

    QString m_currentScreen;
    QVariantMap m_currentParams;
    QStack<HistoryEntry> m_history;
};
