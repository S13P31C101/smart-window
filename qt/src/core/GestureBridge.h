#pragma once

#include <QObject>
#include <QPointF>
#include <QString>

/**
 * @brief Bridge between MediaPipe gesture recognition and QML UI
 *
 * Processes gesture data from MediaPipe and provides
 * normalized coordinates and gesture events to QML.
 */
class GestureBridge : public QObject
{
    Q_OBJECT
    Q_PROPERTY(qreal cursorX READ cursorX NOTIFY cursorPositionChanged)
    Q_PROPERTY(qreal cursorY READ cursorY NOTIFY cursorPositionChanged)
    Q_PROPERTY(bool isPointing READ isPointing NOTIFY pointingStateChanged)
    Q_PROPERTY(bool isFist READ isFist NOTIFY gestureChanged)
    Q_PROPERTY(QString currentGesture READ currentGesture NOTIFY gestureChanged)
    Q_PROPERTY(qreal gestureConfidence READ gestureConfidence NOTIFY gestureChanged)
    Q_PROPERTY(bool handDetected READ handDetected NOTIFY handDetectionChanged)

public:
    explicit GestureBridge(QObject *parent = nullptr);
    ~GestureBridge() = default;

    // Getters
    qreal cursorX() const { return m_cursorPos.x(); }
    qreal cursorY() const { return m_cursorPos.y(); }
    bool isPointing() const { return m_isPointing; }
    bool isFist() const { return m_currentGesture == "fist"; }
    QString currentGesture() const { return m_currentGesture; }
    qreal gestureConfidence() const { return m_gestureConfidence; }
    bool handDetected() const { return m_handDetected; }

    /**
     * @brief Update gesture data from MediaPipe
     * @param nx Normalized X coordinate (0.0 - 1.0)
     * @param ny Normalized Y coordinate (0.0 - 1.0)
     * @param gesture Detected gesture name
     * @param confidence Gesture confidence (0.0 - 1.0)
     */
    Q_INVOKABLE void updateGesture(qreal nx, qreal ny, const QString &gesture, qreal confidence = 1.0);

    /**
     * @brief Set cursor position manually (for testing)
     */
    Q_INVOKABLE void setCursorPosition(qreal x, qreal y);

    /**
     * @brief Enable/disable gesture tracking
     */
    Q_INVOKABLE void setEnabled(bool enabled);

    /**
     * @brief Get cursor position as QPointF
     */
    QPointF cursorPosition() const { return m_cursorPos; }

signals:
    void cursorPositionChanged();
    void gestureChanged(const QString &gesture, qreal confidence);
    void pointingStateChanged();
    void handDetectionChanged();

    // Specific gesture signals
    void fistDetected();
    void openPalmDetected();
    void swipeLeftDetected();
    void swipeRightDetected();
    void swipeUpDetected();
    void swipeDownDetected();
    void clickDetected(qreal x, qreal y);

private:
    void detectSwipe();
    void smoothCursor(qreal &x, qreal &y);

    QPointF m_cursorPos{0.5, 0.5};  // Normalized coordinates (0.0-1.0)
    QPointF m_prevCursorPos{0.5, 0.5};
    bool m_isPointing{false};
    bool m_handDetected{false};
    QString m_currentGesture;
    QString m_prevGesture;
    qreal m_gestureConfidence{0.0};
    bool m_enabled{true};

    // Smoothing filter
    static constexpr qreal SMOOTHING_FACTOR = 0.3;
    static constexpr qreal SWIPE_THRESHOLD = 0.15;

    // Gesture timing
    qint64 m_lastGestureTime{0};
    static constexpr qint64 GESTURE_COOLDOWN_MS = 500;
};
