#include "WidgetRegistry.h"
#include <QDebug>

WidgetRegistry::WidgetRegistry(QObject *parent)
    : QObject(parent)
{
}

void WidgetRegistry::registerWidget(const QString &widgetId, QObject *provider)
{
    if (m_providers.contains(widgetId)) {
        qWarning() << "Widget already registered:" << widgetId;
        return;
    }

    if (!provider) {
        qWarning() << "Cannot register null provider for widget:" << widgetId;
        return;
    }

    m_providers[widgetId] = provider;
    provider->setParent(this);

    qInfo() << "Widget registered:" << widgetId;
    emit widgetsChanged();
}

void WidgetRegistry::unregisterWidget(const QString &widgetId)
{
    if (!m_providers.contains(widgetId)) {
        qWarning() << "Widget not found:" << widgetId;
        return;
    }

    m_providers.remove(widgetId);
    m_configurations.remove(widgetId);
    m_activeWidgets.removeAll(widgetId);

    qInfo() << "Widget unregistered:" << widgetId;
    emit widgetsChanged();
    emit activeWidgetsChanged();
}

QObject* WidgetRegistry::getWidget(const QString &widgetId) const
{
    return m_providers.value(widgetId, nullptr);
}

void WidgetRegistry::activateWidget(const QString &widgetId)
{
    if (!m_providers.contains(widgetId)) {
        qWarning() << "Cannot activate widget: not found -" << widgetId;
        return;
    }

    if (m_activeWidgets.contains(widgetId)) {
        return;  // Already active
    }

    m_activeWidgets.append(widgetId);
    qInfo() << "Widget activated:" << widgetId;

    emit widgetActivated(widgetId);
    emit activeWidgetsChanged();
}

void WidgetRegistry::deactivateWidget(const QString &widgetId)
{
    if (!m_activeWidgets.contains(widgetId)) {
        return;  // Already inactive
    }

    m_activeWidgets.removeAll(widgetId);
    qInfo() << "Widget deactivated:" << widgetId;

    emit widgetDeactivated(widgetId);
    emit activeWidgetsChanged();
}

void WidgetRegistry::toggleWidget(const QString &widgetId)
{
    if (isWidgetActive(widgetId)) {
        deactivateWidget(widgetId);
    } else {
        activateWidget(widgetId);
    }
}

bool WidgetRegistry::isWidgetActive(const QString &widgetId) const
{
    return m_activeWidgets.contains(widgetId);
}

QVariantMap WidgetRegistry::getWidgetConfig(const QString &widgetId) const
{
    return m_configurations.value(widgetId, QVariantMap());
}

void WidgetRegistry::setWidgetConfig(const QString &widgetId, const QVariantMap &config)
{
    if (!m_providers.contains(widgetId)) {
        qWarning() << "Cannot set config: widget not found -" << widgetId;
        return;
    }

    m_configurations[widgetId] = config;
    qDebug() << "Widget config updated:" << widgetId << config;

    emit widgetConfigChanged(widgetId, config);
}

QStringList WidgetRegistry::availableWidgets() const
{
    return m_providers.keys();
}

QStringList WidgetRegistry::activeWidgets() const
{
    return m_activeWidgets;
}

void WidgetRegistry::clear()
{
    m_providers.clear();
    m_configurations.clear();
    m_activeWidgets.clear();

    emit widgetsChanged();
    emit activeWidgetsChanged();
}
