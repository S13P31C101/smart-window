#include "Router.h"
#include <QDebug>

Router::Router(QObject *parent)
    : QObject(parent)
{
}

void Router::navigateTo(const QString &screen, const QVariantMap &params)
{
    if (screen == m_currentScreen) {
        qDebug() << "Already on screen:" << screen;
        return;
    }

    // Save current screen to history
    if (!m_currentScreen.isEmpty()) {
        HistoryEntry entry;
        entry.screen = m_currentScreen;
        entry.params = m_currentParams;
        m_history.push(entry);
        emit historyChanged();
    }

    // Navigate to new screen
    m_currentScreen = screen;
    m_currentParams = params;

    qInfo() << "Navigating to:" << screen;
    emit screenChanged(screen, params);
}

void Router::goBack()
{
    if (m_history.isEmpty()) {
        qWarning() << "No history to go back to";
        return;
    }

    // Pop from history
    HistoryEntry entry = m_history.pop();
    m_currentScreen = entry.screen;
    m_currentParams = entry.params;

    qInfo() << "Going back to:" << m_currentScreen;
    emit screenChanged(m_currentScreen, m_currentParams);
    emit historyChanged();
    emit backPressed();
}

void Router::clearHistory()
{
    m_history.clear();
    emit historyChanged();
    qInfo() << "Navigation history cleared";
}

void Router::replace(const QString &screen, const QVariantMap &params)
{
    // Don't add to history, just replace current screen
    m_currentScreen = screen;
    m_currentParams = params;

    qInfo() << "Replacing screen with:" << screen;
    emit screenChanged(screen, params);
}
