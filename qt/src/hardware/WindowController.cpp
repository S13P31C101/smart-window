#include "WindowController.h"
#include <QDebug>
#include <QtConcurrent/QtConcurrent>

WindowController::WindowController(QObject *parent)
    : QObject(parent)
{
    qInfo() << "Initializing Window Controller...";

#ifdef HAVE_SIMPLEBLE
    // Initialize Bluetooth adapter
    try {
        auto adapters = SimpleBLE::Adapter::get_adapters();
        if (adapters.empty()) {
            setStatus("No Bluetooth adapter found");
            qWarning() << "No Bluetooth adapter found";
            return;
        }

        m_adapter = adapters[0];
        m_ready = true;
        setStatus("Bluetooth adapter ready");
        qInfo() << "✓ Window Controller initialized with adapter:"
                << QString::fromStdString(m_adapter.identifier());

        // Auto-connect on startup
        connect();
    } catch (const std::exception &e) {
        setStatus("Bluetooth initialization failed");
        qCritical() << "Bluetooth initialization error:" << e.what();
    }
#else
    // Mock mode - simulate successful initialization
    m_ready = true;
    m_connected = true;  // Simulate connection for testing
    setStatus("[MOCK] Window Controller ready (BLE disabled)");
    qInfo() << "[MOCK] Window Controller initialized (development mode)";
#endif
}

void WindowController::setPosition(int percentage)
{
    if (percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;

    if (!m_connected) {
        qWarning() << "Window controller not connected - cannot set position";
        setStatus("Not connected");
        return;
    }

    m_position = percentage;
    emit positionChanged(m_position);

    sendCommand(percentage);

    qInfo() << "Window position set to" << percentage << "%";
}

void WindowController::openWindow()
{
    setPosition(100);  // Fully open
    setStatus("Window opening to 100%");
}

void WindowController::closeWindow()
{
    setPosition(0);  // Fully closed
    setStatus("Window closing to 0%");
}

void WindowController::connect()
{
#ifdef HAVE_SIMPLEBLE
    if (!m_ready) {
        qWarning() << "Window controller not ready";
        return;
    }

    if (m_connected) {
        qInfo() << "Already connected to window actuator";
        return;
    }

    setStatus("Scanning for device...");
    qInfo() << "Starting BLE scan for Minibig actuator...";

    // Scan for device in background thread
    auto scanTask = [this]() {
        try {
            m_adapter.scan_for(5000);  // 5-second scan

            auto peripherals = m_adapter.scan_get_results();
            for (auto &peripheral : peripherals) {
                if (peripheral.address() == TARGET_MAC) {
                    m_peripheral = peripheral;
                    qInfo() << "Found target device:" << QString::fromStdString(TARGET_MAC);

                    // Connect in main thread
                    QMetaObject::invokeMethod(this, &WindowController::connectToDevice);
                    return;
                }
            }

            qWarning() << "Target device not found:" << QString::fromStdString(TARGET_MAC);
            setStatus("Device not found");
        } catch (const std::exception &e) {
            qCritical() << "Scan error:" << e.what();
            setStatus("Scan failed");
        }
    };

    QtConcurrent::run(scanTask);
#else
    // Mock connection
    m_connected = true;
    setStatus("[MOCK] Connected to window actuator");
    emit connectionChanged(true);
    qInfo() << "[MOCK] Connected to BLE device (development mode)";
#endif
}

void WindowController::disconnect()
{
#ifdef HAVE_SIMPLEBLE
    if (m_peripheral.is_connected()) {
        m_peripheral.disconnect();
        m_connected = false;
        setStatus("Disconnected");
        emit connectionChanged(false);
        qInfo() << "Disconnected from window actuator";
    }
#else
    m_connected = false;
    setStatus("[MOCK] Disconnected");
    emit connectionChanged(false);
    qInfo() << "[MOCK] Disconnected from BLE device";
#endif
}

void WindowController::sendCommand(int percentage)
{
#ifdef HAVE_SIMPLEBLE
    if (!m_peripheral.is_connected()) {
        qWarning() << "Peripheral not connected";
        return;
    }

    try {
        // Minibig command format: 6 bytes
        // 0x2A 0x17 0x10 0x00 0x00 [percentage]
        std::vector<uint8_t> command = {0x2A, 0x17, 0x10, 0x00, 0x00, static_cast<uint8_t>(percentage)};

        m_peripheral.write_request(SERVICE_UUID, CHAR_UUID,
                                    std::string(command.begin(), command.end()));

        qInfo() << "Sent position command:" << percentage << "% to window actuator";
        setStatus(QString("Position: %1%").arg(percentage));
    } catch (const std::exception &e) {
        qCritical() << "Write command error:" << e.what();
        setStatus("Command failed");
    }
#else
    qInfo() << "[MOCK] Sending window position command:" << percentage << "%";
    setStatus(QString("[MOCK] Position: %1%").arg(percentage));
#endif
}

#ifdef HAVE_SIMPLEBLE
void WindowController::connectToDevice()
{
    setStatus("Connecting...");
    qInfo() << "Connecting to Minibig actuator...";

    auto connectTask = [this]() {
        try {
            m_peripheral.connect();

            if (m_peripheral.is_connected()) {
                m_connected = true;
                setStatus("Connected");
                emit connectionChanged(true);
                qInfo() << "✓ Connected to window actuator successfully";
            } else {
                setStatus("Connection failed");
                qWarning() << "Failed to connect to window actuator";
            }
        } catch (const std::exception &e) {
            qCritical() << "Connection error:" << e.what();
            setStatus("Connection error");
        }
    };

    QtConcurrent::run(connectTask);
}
#endif

void WindowController::setStatus(const QString &text)
{
    if (m_status == text) return;

    m_status = text;
    emit statusChanged(text);
}
