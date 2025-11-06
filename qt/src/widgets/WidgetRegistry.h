#pragma once

#include <QObject>
#include <QString>
#include <QMap>
#include <QVariantMap>
#include <QQmlListProperty>

/**
 * @brief Registry for dynamic widget management
 *
 * Manages widget providers and their visibility/configuration.
 * Supports dynamic widget loading and unloading.
 */
class WidgetRegistry : public QObject
{
    Q_OBJECT
    Q_PROPERTY(QStringList availableWidgets READ availableWidgets NOTIFY widgetsChanged)
    Q_PROPERTY(QStringList activeWidgets READ activeWidgets NOTIFY activeWidgetsChanged)

public:
    explicit WidgetRegistry(QObject *parent = nullptr);
    ~WidgetRegistry() = default;

    /**
     * @brief Register a widget provider
     * @param widgetId Unique widget identifier
     * @param provider Widget provider object
     */
    Q_INVOKABLE void registerWidget(const QString &widgetId, QObject *provider);

    /**
     * @brief Unregister a widget
     * @param widgetId Widget identifier
     */
    Q_INVOKABLE void unregisterWidget(const QString &widgetId);

    /**
     * @brief Get widget provider by ID
     * @param widgetId Widget identifier
     * @return Provider object or nullptr
     */
    Q_INVOKABLE QObject* getWidget(const QString &widgetId) const;

    /**
     * @brief Activate a widget (make it visible)
     * @param widgetId Widget identifier
     */
    Q_INVOKABLE void activateWidget(const QString &widgetId);

    /**
     * @brief Deactivate a widget (hide it)
     * @param widgetId Widget identifier
     */
    Q_INVOKABLE void deactivateWidget(const QString &widgetId);

    /**
     * @brief Toggle widget activation
     * @param widgetId Widget identifier
     */
    Q_INVOKABLE void toggleWidget(const QString &widgetId);

    /**
     * @brief Check if widget is active
     */
    Q_INVOKABLE bool isWidgetActive(const QString &widgetId) const;

    /**
     * @brief Get widget configuration
     * @param widgetId Widget identifier
     * @return Configuration as QVariantMap
     */
    Q_INVOKABLE QVariantMap getWidgetConfig(const QString &widgetId) const;

    /**
     * @brief Set widget configuration
     * @param widgetId Widget identifier
     * @param config Configuration map
     */
    Q_INVOKABLE void setWidgetConfig(const QString &widgetId, const QVariantMap &config);

    /**
     * @brief Get list of available widget IDs
     */
    QStringList availableWidgets() const;

    /**
     * @brief Get list of active widget IDs
     */
    QStringList activeWidgets() const;

    /**
     * @brief Clear all widgets
     */
    Q_INVOKABLE void clear();

signals:
    void widgetsChanged();
    void activeWidgetsChanged();
    void widgetActivated(const QString &widgetId);
    void widgetDeactivated(const QString &widgetId);
    void widgetConfigChanged(const QString &widgetId, const QVariantMap &config);

private:
    QMap<QString, QObject*> m_providers;
    QMap<QString, QVariantMap> m_configurations;
    QStringList m_activeWidgets;
};
