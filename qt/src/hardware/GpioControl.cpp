#include "GpioControl.h"
#include <stdexcept>
#include <iostream>

GpioControl::GpioControl(const std::string& chip_name, int line_offset)
    : m_chip_name(chip_name), m_line_offset(line_offset)
#ifdef HAVE_GPIOD
    , chip(chip_name)
#endif
{
#ifdef HAVE_GPIOD
    if (!chip) {
        throw std::runtime_error("GPIO 칩을 여는 데 실패했습니다: " + chip_name);
    }
    line = chip.get_line(line_offset);
    if (!line) {
        throw std::runtime_error("GPIO 라인을 가져오는 데 실패했습니다: " + std::to_string(line_offset));
    }

    // 작동하는 코드와 동일하게, 처음에 한 번만 핀을 '출력 모드'로 요청합니다.
    // 초기값은 1(HIGH)로 설정하여 릴레이가 꺼진 상태(OFF)에서 시작하도록 합니다.
    line.request({consumer, ::gpiod::line_request::DIRECTION_OUTPUT, 0}, 1);
    std::cout << "GPIO " << line.offset() << " 초기화 완료. 초기 상태: OFF(HIGH)" << std::endl;
#else
    std::cout << "[MOCK] GPIO " << line_offset << " (chip: " << chip_name << ") 초기화 (개발 모드)" << std::endl;
#endif
}

GpioControl::~GpioControl()
{
#ifdef HAVE_GPIOD
    if (line && line.is_requested()) {
        // 프로그램 종료 시 릴레이를 끄고(HIGH) 제어권을 해제합니다.
        line.set_value(1);
        line.release();
    }
#endif
}

void GpioControl::setRelay(bool on)
{
    // 릴레이는 Active-Low 방식이므로 논리를 반전시킵니다.
    // on = true  (켜기) -> set_value(0) LOW 신호
    // on = false (끄기) -> set_value(1) HIGH 신호
    int value = on ? 0 : 1;

#ifdef HAVE_GPIOD
    if (line) {
        line.set_value(value);
        std::cout << "GPIO " << line.offset() << " 상태 변경 -> " << (on ? "ON (LOW)" : "OFF (HIGH)") << std::endl;
    }
#else
    std::cout << "[MOCK] GPIO " << m_line_offset << " 상태 변경 -> " << (on ? "ON (LOW)" : "OFF (HIGH)") << std::endl;
#endif
}
