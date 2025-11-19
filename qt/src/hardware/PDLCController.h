#ifndef PDLCCONTROLLER_H
#define PDLCCONTROLLER_H

#include <QObject>
#include <QString>
#include <memory>
#include "GpioControl.h"

/**
 * @brief PDLC film controller using GPIO relays
 *
 * Controls transparency of smart glass via GPIO 18 and 23.
 * PDLC (Polymer Dispersed Liquid Crystal) film:
 * - Power ON (relay ON): Transparent
 * - Power OFF (relay OFF): Opaque/Frosted
 */
class PDLCController : public QObject
{
    Q_OBJECT
    Q_PROPERTY(bool isTransparent READ isTransparent NOTIFY transparencyChanged)
    Q_PROPERTY(QString status READ status NOTIFY statusChanged)

public:
    explicit PDLCController(QObject *parent = nullptr);
    ~PDLCController() = default;

    /**
     * @brief Set PDLC film to transparent (clear glass)
     * Turns relay ON to supply power to PDLC
     */
    Q_INVOKABLE void setTransparent();

    /**
     * @brief Set PDLC film to opaque (privacy/frosted mode)
     * Turns relay OFF to cut power to PDLC
     */
    Q_INVOKABLE void setOpaque();

    /**
     * @brief Set transparency state
     * @param transparent true for transparent, false for opaque
     */
    Q_INVOKABLE void setTransparency(bool transparent);

    bool isTransparent() const { return m_transparent; }
    QString status() const { return m_status; }
    bool isReady() const { return m_ready; }

signals:
    void transparencyChanged(bool transparent);
    void statusChanged(const QString &status);

private:
    void setStatus(const QString &text);

    std::unique_ptr<GpioControl> m_gpio18;  // Relay 1
    std::unique_ptr<GpioControl> m_gpio23;  // Relay 2

    QString m_status;
    bool m_transparent = true;   // Default: transparent
    bool m_ready = false;        // Initialization status
};

#endif // PDLCCONTROLLER_H
