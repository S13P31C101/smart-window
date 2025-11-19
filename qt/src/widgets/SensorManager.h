#ifndef SENSORMANAGER_H
#define SENSORMANAGER_H

#include <QObject>
#include <QSerialPort>
#include <QTimer>

// I2C 통신에 필요한 표준 헤더 파일들
#include <unistd.h>
#include <fcntl.h>
#include <sys/ioctl.h>
#include <linux/i2c-dev.h>

class SensorManager : public QObject
{
    Q_OBJECT
    // QML에서 접근할 수 있는 프로퍼티(속성)들을 정의합니다.
    // 형식: Q_PROPERTY(타입 이름 READ 게터함수 NOTIFY 변경신호)
    Q_PROPERTY(int co2 READ co2 NOTIFY co2Changed)
    Q_PROPERTY(float pm25 READ pm25 NOTIFY pm25Changed)
    Q_PROPERTY(float pm10 READ pm10 NOTIFY pm10Changed)

    // 온습도 속성 추가
    Q_PROPERTY(float temperature READ temperature NOTIFY temperatureChanged)
    Q_PROPERTY(float humidity READ humidity NOTIFY humidityChanged)

public:
    explicit SensorManager(QObject *parent = nullptr);
    ~SensorManager();

    // 프로퍼티를 읽기 위한 게터(getter) 함수들
    int co2() const;
    float pm25() const;
    float pm10() const;
    float temperature() const;
    float humidity() const;

signals:
    // 프로퍼티 값이 변경되었음을 QML에 알리는 신호들
    void co2Changed();
    void pm25Changed();
    void pm10Changed();
    void temperatureChanged();
    void humidityChanged();

private slots:
    void requestCo2Data();
    void readCo2Data();
    void readDustData();
    void requestTempHumiData();

private:
    QSerialPort *co2Serial;
    QSerialPort *dustSerial;
    QTimer *timer;

    QByteArray dustDataBuffer; // 미세먼지 데이터 버퍼

    // 실제 데이터 값을 저장할 멤버 변수들
    int m_co2 = 0;
    float m_pm25 = 0.0;
    float m_pm10 = 0.0;

    // I2C 관련 멤버 변수 추가
    int m_i2c_fd; // I2C 장치 파일 디스크립터
    float m_temperature = 0.0;
    float m_humidity = 0.0;

    // Fallback flags for dummy data
    bool m_useDummyCo2 = false;
    bool m_useDummyDust = false;
    bool m_useDummyTempHumi = false;
    int m_failureCount = 0; // I2C 실패 카운트

    unsigned char crc8(const unsigned char *data, int len); // SHTC3용 CRC8
    unsigned char calculateCo2Checksum(const QByteArray &data);
};

#endif // SENSORMANAGER_H
