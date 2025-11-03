package com.lumiscape.smartwindow.alarm.service;

import com.lumiscape.smartwindow.alarm.domain.Alarm;
import com.lumiscape.smartwindow.alarm.dto.AlarmCreateRequest;
import com.lumiscape.smartwindow.alarm.dto.AlarmResponse;
import com.lumiscape.smartwindow.alarm.dto.AlarmUpdateRequest;
import com.lumiscape.smartwindow.alarm.repository.AlarmRepository;
import com.lumiscape.smartwindow.device.domain.Device;
import com.lumiscape.smartwindow.device.repository.DeviceRepository;
import com.lumiscape.smartwindow.global.exception.CustomException;
import com.lumiscape.smartwindow.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AlarmService {

    private final AlarmRepository alarmRepository;
    private final DeviceRepository deviceRepository;

    public List<AlarmResponse> getAllUserAlarms(Long userId) {

        return alarmRepository.findAllByDeviceUserId(userId).stream()
                .map(AlarmResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public AlarmResponse createAlarm(Long userId, AlarmCreateRequest request) {
        Device device = deviceRepository.findByIdAndUserId(request.deviceId(), userId)
                .orElseThrow(() -> new CustomException(ErrorCode.FORBIDDEN_DEVICE_ACCESS));

        Alarm alarm = Alarm.builder()
                .device(device)
                .alarmName(request.alarmName())
                .alarmTime(request.alarmTime())
                .repeatDays(request.repeatDays())
                .isActive(request.isActive())
                .build();

        Alarm savedAlarm = alarmRepository.save(alarm);

        return AlarmResponse.from(savedAlarm);
    }

    public AlarmResponse getAlarmById(Long userId, Long alarmId) {
        Alarm alarm = findAlarmByUser(alarmId, userId);

        return AlarmResponse.from(alarm);
    }

    @Transactional
    public AlarmResponse updateAlarm(Long userId, Long alarmId, AlarmUpdateRequest request) {
        Alarm alarm = findAlarmByUser(alarmId, userId);

        alarm.update(
                request.alarmName(),
                request.alarmTime(),
                request.repeatDays(),
                request.isActive()
        );

        return AlarmResponse.from(alarm);
    }


}
