#ifndef WINDOWCONTROLLER_H
#define WINDOWCONTROLLER_H

#include <QObject>
#include <QString>
#include <QFuture>
#include <QFutureWatcher>

#ifdef HAVE_SIMPLEBLE
#include <simpleble/SimpleBLE.h>
#endif

/**
 * @brief Automatic window opener/closer controller via Bluetooth
 *
 * Controls Minibig motorized window actuator via BLE.
 * Target device: Minibig actuator (MAC: CE:20:27:1E:7C:92)
 */
class WindowController : public QObject
{
    Q_OBJECT
    Q_PROPERTY(bool isConnected READ isConnected NOTIFY connectionChanged)
    Q_PROPERTY(QString status READ status NOTIFY statusChanged)
    Q_PROPERTY(int currentPosition READ currentPosition NOTIFY positionChanged)

public:
    explicit WindowController(QObject *parent = nullptr);
    ~WindowController() = default;

    /**
     * @brief Open window to specified percentage
     * @param percentage 0 (closed) to 100 (fully open)
     */
    Q_INVOKABLE void setPosition(int percentage);

    /**
     * @brief Fully open the window
     */
    Q_INVOKABLE void openWindow();

    /**
     * @brief Fully close the window
     */
    Q_INVOKABLE void closeWindow();

    /**
     * @brief Connect to Bluetooth device
     */
    Q_INVOKABLE void connect();

    /**
     * @brief Disconnect from Bluetooth device
     */
    Q_INVOKABLE void disconnect();

    bool isConnected() const { return m_connected; }
    QString status() const { return m_status; }
    int currentPosition() const { return m_position; }

signals:
    void connectionChanged(bool connected);
    void statusChanged(const QString &status);
    void positionChanged(int position);

private:
    void setStatus(const QString &text);
    void sendCommand(int percentage);

#ifdef HAVE_SIMPLEBLE
    void scanForDevice();
    void connectToDevice();

    SimpleBLE::Adapter m_adapter;
    SimpleBLE::Peripheral m_peripheral;

    // Minibig actuator BLE characteristics
    const std::string TARGET_MAC = "CE:20:27:1E:7C:92";
    const SimpleBLE::BluetoothUUID SERVICE_UUID = "2b8d0001-6828-46af-98aa-557761b15400";
    const SimpleBLE::BluetoothUUID CHAR_UUID = "2b8d0002-6828-46af-98aa-557761b15400";
#endif

    QString m_status;
    bool m_connected = false;
    bool m_ready = false;
    int m_position = 0;  // Current window position (0-100%)

    QFutureWatcher<void> *m_scanWatcher{nullptr};
    QFutureWatcher<void> *m_connectWatcher{nullptr};
};

#endif // WINDOWCONTROLLER_H
