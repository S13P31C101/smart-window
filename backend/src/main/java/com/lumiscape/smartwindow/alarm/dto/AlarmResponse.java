package com.lumiscape.smartwindow.alarm.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.lumiscape.smartwindow.alarm.domain.Alarm;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.Set;

public record AlarmResponse(
        Long alarmId,
        Long deviceId,
        String alarmName,
        @JsonFormat(pattern = "HH:mm:ss")
        LocalTime alarmTime,
        Set<DayOfWeek> repeatDays,
        boolean isActive,
        OffsetDateTime createdAt
) {

    public static AlarmResponse from(Alarm alarm) {
        return new AlarmResponse(
                alarm.getId(),
                alarm.getDevice().getId(),
                alarm.getAlarmName(),
                alarm.getAlarmTime(),
                alarm.getRepeatDays(),
                alarm.isActive(),
                alarm.getCreatedAt()
        );
    }
}
