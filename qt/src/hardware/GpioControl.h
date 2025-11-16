#ifndef GPIOCONTROL_H
#define GPIOCONTROL_H

#include <string>

#ifdef HAVE_GPIOD
#include <gpiod.hpp>
#endif

class GpioControl
{
public:
    GpioControl(const std::string& chip_name, int line_offset);
    ~GpioControl();

    // 릴레이 상태를 설정하는 함수 (true: ON, false: OFF)
    // 릴레이가 Active-Low 방식이므로 내부에서 값을 반전시켜 줄 것입니다.
    void setRelay(bool on);

private:
#ifdef HAVE_GPIOD
    ::gpiod::chip chip;
    ::gpiod::line line;
#endif
    const std::string consumer = "RelayControlApp";
    int m_line_offset;
    std::string m_chip_name;
};

#endif // GPIOCONTROL_H
