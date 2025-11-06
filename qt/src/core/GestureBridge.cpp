#include "GestureBridge.h"
#include <QDateTime>
#include <QDebug>
#include <cmath>

GestureBridge::GestureBridge(QObject *parent)
    : QObject(parent)
{
}

void GestureBridge::updateGesture(qreal nx, qreal ny, const QString &gesture, qreal confidence)
{
    if (!m_enabled) {
        return;
    }

    // Update hand detection state
    bool prevHandDetected = m_handDetected;
    m_handDetected = !gesture.isEmpty() && gesture != "none";

    if (prevHandDetected != m_handDetected) {
        emit handDetectionChanged();
    }

    // Update cursor position with smoothing
    qreal targetX = qBound(0.0, nx, 1.0);
    qreal targetY = qBound(0.0, ny, 1.0);

    smoothCursor(targetX, targetY);

    if (m_cursorPos.x() != targetX || m_cursorPos.y() != targetY) {
        m_prevCursorPos = m_cursorPos;
        m_cursorPos.setX(targetX);
        m_cursorPos.setY(targetY);
        emit cursorPositionChanged();

        // Detect swipe gestures
        detectSwipe();
    }

    // Update gesture state
    if (m_currentGesture != gesture || std::abs(m_gestureConfidence - confidence) > 0.1) {
        m_prevGesture = m_currentGesture;
        m_currentGesture = gesture;
        m_gestureConfidence = confidence;

        emit gestureChanged(gesture, confidence);

        // Check gesture cooldown
        qint64 currentTime = QDateTime::currentMSecsSinceEpoch();
        if (currentTime - m_lastGestureTime < GESTURE_COOLDOWN_MS) {
            return;
        }
        m_lastGestureTime = currentTime;

        // Emit specific gesture signals
        if (gesture == "fist" && confidence > 0.7) {
            emit fistDetected();
            emit clickDetected(m_cursorPos.x(), m_cursorPos.y());
            qDebug() << "Fist detected at:" << m_cursorPos;
        } else if (gesture == "open_palm" && confidence > 0.7) {
            emit openPalmDetected();
            qDebug() << "Open palm detected";
        }
    }

    // Update pointing state
    bool pointing = (gesture == "pointing" || gesture == "open_palm") && confidence > 0.6;
    if (m_isPointing != pointing) {
        m_isPointing = pointing;
        emit pointingStateChanged();
    }
}

void GestureBridge::setCursorPosition(qreal x, qreal y)
{
    m_cursorPos.setX(qBound(0.0, x, 1.0));
    m_cursorPos.setY(qBound(0.0, y, 1.0));
    emit cursorPositionChanged();
}

void GestureBridge::setEnabled(bool enabled)
{
    if (m_enabled != enabled) {
        m_enabled = enabled;
        if (!enabled) {
            m_handDetected = false;
            emit handDetectionChanged();
        }
    }
}

void GestureBridge::detectSwipe()
{
    qreal deltaX = m_cursorPos.x() - m_prevCursorPos.x();
    qreal deltaY = m_cursorPos.y() - m_prevCursorPos.y();

    if (std::abs(deltaX) > SWIPE_THRESHOLD) {
        if (deltaX > 0) {
            emit swipeRightDetected();
            qDebug() << "Swipe right detected";
        } else {
            emit swipeLeftDetected();
            qDebug() << "Swipe left detected";
        }
    }

    if (std::abs(deltaY) > SWIPE_THRESHOLD) {
        if (deltaY > 0) {
            emit swipeDownDetected();
            qDebug() << "Swipe down detected";
        } else {
            emit swipeUpDetected();
            qDebug() << "Swipe up detected";
        }
    }
}

void GestureBridge::smoothCursor(qreal &x, qreal &y)
{
    // Exponential moving average for smooth cursor movement
    x = m_cursorPos.x() * (1.0 - SMOOTHING_FACTOR) + x * SMOOTHING_FACTOR;
    y = m_cursorPos.y() * (1.0 - SMOOTHING_FACTOR) + y * SMOOTHING_FACTOR;
}
