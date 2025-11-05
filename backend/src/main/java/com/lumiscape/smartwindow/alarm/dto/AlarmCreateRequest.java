package com.lumiscape.smartwindow.alarm.dto;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.Set;

public record AlarmCreateRequest(
        Long deviceId,
        String alarmName,
        @JsonFormat(pattern = "HH:mm:ss")
        LocalTime alarmTime,
        Set<DayOfWeek> repeatDays,
        boolean isActive
) {
}
