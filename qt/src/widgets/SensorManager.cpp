#include "SensorManager.h"
#include <QDebug>

// SHTC3 I2C 주소 및 장치 경로
const int SHTC3_ADDR = 0x70;
const char* I2C_BUS = "/dev/i2c-1";

SensorManager::SensorManager(QObject *parent) : QObject(parent)
{
    m_i2c_fd = -1; // I2C 파일 디스크립터 초기화
    // --- CO2 센서 설정 ---
    co2Serial = new QSerialPort(this);
    co2Serial->setPortName("/dev/ttyUSB0"); // 사용자 환경에 맞게 수정
    co2Serial->setBaudRate(QSerialPort::Baud9600);
    // ... (이하 시리얼 설정)
    connect(co2Serial, &QSerialPort::readyRead, this, &SensorManager::readCo2Data);

    // --- 미세먼지 센서 설정 ---
    dustSerial = new QSerialPort(this);
    dustSerial->setPortName("/dev/ttyUSB1"); // 사용자 환경에 맞게 수정
    // ... (이하 시리얼 설정)
    if (dustSerial->open(QIODevice::ReadOnly)) {
        connect(dustSerial, &QSerialPort::readyRead, this, &SensorManager::readDustData);
    } else {
        qWarning() << "Failed to open dust sensor port:" << dustSerial->errorString();
    }

    // --- 타이머 설정 ---
    timer = new QTimer(this);
    connect(timer, &QTimer::timeout, this, &SensorManager::requestCo2Data);
    // 타이머에 온습도 데이터 요청 슬롯도 연결
    connect(timer, &QTimer::timeout, this, &SensorManager::requestTempHumiData);
    timer->start(5000); // 5초
    requestCo2Data();
    requestTempHumiData();
}

SensorManager::~SensorManager()
{
    if(co2Serial->isOpen()) co2Serial->close();
    if(dustSerial->isOpen()) dustSerial->close();
    if (m_i2c_fd != -1) {
        close(m_i2c_fd);
    }
}

// --- 게터 함수 구현 ---
int SensorManager::co2() const { return m_co2; }
float SensorManager::pm25() const { return m_pm25; }
float SensorManager::pm10() const { return m_pm10; }
float SensorManager::temperature() const { return m_temperature; }
float SensorManager::humidity() const { return m_humidity; }

// --- 슬롯 함수 구현 ---
void SensorManager::requestCo2Data()
{
    if (!co2Serial->isOpen()) {
        if (!co2Serial->open(QIODevice::ReadWrite)) return;
    }
    const char cmd[] = {(char)0xFF, (char)0x01, (char)0x86, 0x00, 0x00, 0x00, 0x00, 0x00, (char)0x79};
    co2Serial->write(QByteArray(cmd, 9));
}

void SensorManager::readCo2Data()
{
    QByteArray responseData = co2Serial->readAll();
    if (responseData.size() >= 9 && (uchar)responseData[0] == 0xFF && (uchar)responseData[1] == 0x86) {
        if (calculateCo2Checksum(responseData) == (uchar)responseData[8]) {
            int new_co2 = (uchar)responseData[2] * 256 + (uchar)responseData[3];
            // 값이 변경되었을 때만 신호를 보냄
            if (m_co2 != new_co2) {
                m_co2 = new_co2;
                emit co2Changed(); // QML에 알림!
            }
        }
    }
}

void SensorManager::readDustData()
{
    dustDataBuffer.append(dustSerial->readAll());
    while (dustDataBuffer.size() >= 10) {
        int startIndex = dustDataBuffer.indexOf((char)0xAA);
        if (startIndex == -1) { dustDataBuffer.clear(); return; }
        if (startIndex > 0) { dustDataBuffer.remove(0, startIndex); }
        if (dustDataBuffer.size() < 10) break;
        if ((uchar)dustDataBuffer.at(9) != 0xAB) { dustDataBuffer.remove(0, 1); continue; }

        QByteArray packet = dustDataBuffer.left(10);

        int checksum_received = (uchar)packet.at(8);
        int checksum_calculated = 0;
        for(int i = 2; i < 8; ++i) checksum_calculated += (uchar)packet.at(i);
        checksum_calculated %= 256;

        if (checksum_received == checksum_calculated) {
            float new_pm25 = ((uchar)packet.at(3) * 256 + (uchar)packet.at(2)) / 10.0;
            float new_pm10 = ((uchar)packet.at(5) * 256 + (uchar)packet.at(4)) / 10.0;

            if (m_pm25 != new_pm25) {
                m_pm25 = new_pm25;
                emit pm25Changed(); // QML에 알림!
            }
            if (m_pm10 != new_pm10) {
                m_pm10 = new_pm10;
                emit pm10Changed(); // QML에 알림!
            }
        }
        dustDataBuffer.remove(0, 10);
    }
}

// --- 온습도 데이터 요청 슬롯 ---
void SensorManager::requestTempHumiData()
{
    m_i2c_fd = open(I2C_BUS, O_RDWR);
    if (m_i2c_fd < 0) {
        qWarning("Failed to open the i2c bus");
        return;
    }

    if (ioctl(m_i2c_fd, I2C_SLAVE, SHTC3_ADDR) < 0) {
        qWarning("Failed to acquire bus access to SHTC3.");
        close(m_i2c_fd);
        m_i2c_fd = -1;
        return;
    }

    // 측정 명령어 전송
    unsigned char cmd[] = {0x78, 0x66};
    if (write(m_i2c_fd, cmd, 2) != 2) {
        qWarning("Failed to write to i2c bus.");
        close(m_i2c_fd);
        m_i2c_fd = -1;
        return;
    }

    usleep(15000); // 15ms 측정 대기

    // 6바이트 데이터 읽기
    unsigned char data[6];
    if (read(m_i2c_fd, data, 6) != 6) {
        qWarning("Failed to read from i2c bus.");
        close(m_i2c_fd);
        m_i2c_fd = -1;
        return;
    }

    close(m_i2c_fd); // 통신 후 바로 닫기
    m_i2c_fd = -1;

    // CRC 체크
    if (data[2] != crc8(data, 2) || data[5] != crc8(data + 3, 2)) {
        qWarning("SHTC3 CRC checksum failed.");
        return;
    }

    // 데이터 계산 및 프로퍼티 업데이트
    unsigned int raw_temp = (data[0] << 8) | data[1];
    float new_temp = -45.0 + 175.0 * (float)raw_temp / 65535.0;

    unsigned int raw_humi = (data[3] << 8) | data[4];
    float new_humi = 100.0 * (float)raw_humi / 65535.0;

    if (m_temperature != new_temp) {
        m_temperature = new_temp;
        emit temperatureChanged();
    }
    if (m_humidity != new_humi) {
        m_humidity = new_humi;
        emit humidityChanged();
    }
}

// SHTC3용 CRC8 헬퍼 함수
unsigned char SensorManager::crc8(const unsigned char *data, int len) {
    unsigned char crc = 0xFF;
    for (int i = 0; i < len; i++) {
        crc ^= data[i];
        for (int j = 0; j < 8; j++) {
            if ((crc & 0x80) != 0) {
                crc = (unsigned char)((crc << 1) ^ 0x31);
            } else {
                crc <<= 1;
            }
        }
    }
    return crc;
}

unsigned char SensorManager::calculateCo2Checksum(const QByteArray &data)
{
    unsigned char checksum = 0;
    for (int i = 1; i < 8; ++i) checksum += (uchar)data[i];
    return 0xFF - checksum + 1;
}
