#include "PDLCController.h"
#include <stdexcept>
#include <QDebug>

PDLCController::PDLCController(QObject *parent)
    : QObject(parent)
{
    qInfo() << "Initializing PDLC Controller...";

    bool gpio18_ok = false;
    bool gpio23_ok = false;

    try {
        m_gpio18 = std::make_unique<GpioControl>("gpiochip4", 18);
        gpio18_ok = true;
        qInfo() << "GPIO 18 initialized successfully";
    } catch (const std::runtime_error &e) {
        qCritical() << "GPIO 18 initialization failed:" << e.what();
    }

    try {
        m_gpio23 = std::make_unique<GpioControl>("gpiochip4", 23);
        gpio23_ok = true;
        qInfo() << "GPIO 23 initialized successfully";
    } catch (const std::runtime_error &e) {
        qCritical() << "GPIO 23 initialization failed:" << e.what();
    }

    m_ready = gpio18_ok && gpio23_ok;

    if (m_ready) {
        // Initialize to opaque status - stay false
        setStatus("PDLC Controller ready");
        qInfo() << "✓ PDLC Controller initialized successfully";
    } else {
        setStatus("PDLC initialization failed");
        qCritical() << "✗ PDLC Controller initialization failed";
    }
}

void PDLCController::setTransparent()
{
    if (!m_ready) {
        qWarning() << "PDLC controller not ready - cannot set transparent";
        return;
    }

    // Turn ON relays (GPIO LOW) to supply power to PDLC → Transparent
    if (m_gpio18) m_gpio18->setRelay(true);
    if (m_gpio23) m_gpio23->setRelay(true);

    m_transparent = true;
    setStatus("PDLC: Transparent (Glass Mode)");
    emit transparencyChanged(true);

    qInfo() << "PDLC → TRANSPARENT (relays ON, power supplied)";
}

void PDLCController::setOpaque()
{
    if (!m_ready) {
        qWarning() << "PDLC controller not ready - cannot set opaque";
        return;
    }

    // Turn OFF relays (GPIO HIGH) to cut power to PDLC → Opaque/Frosted
    if (m_gpio18) m_gpio18->setRelay(false);
    if (m_gpio23) m_gpio23->setRelay(false);

    m_transparent = false;
    setStatus("PDLC: Opaque (Privacy Mode)");
    emit transparencyChanged(false);

    qInfo() << "PDLC → OPAQUE (relays OFF, power cut)";
}

void PDLCController::setTransparency(bool transparent)
{
    if (transparent) {
        setTransparent();
    } else {
        setOpaque();
    }
}

void PDLCController::setStatus(const QString &text)
{
    if (m_status == text) return;

    m_status = text;
    emit statusChanged(text);
}
