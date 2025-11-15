package com.lumiscape.smartwindow.alarm.service;

import com.lumiscape.smartwindow.alarm.domain.Alarm;
import com.lumiscape.smartwindow.alarm.dto.AlarmCreateRequest;
import com.lumiscape.smartwindow.alarm.dto.AlarmResponse;
import com.lumiscape.smartwindow.alarm.dto.AlarmUpdateRequest;
import com.lumiscape.smartwindow.alarm.repository.AlarmRepository;
import com.lumiscape.smartwindow.device.domain.Device;
import com.lumiscape.smartwindow.device.service.DeviceService;
import com.lumiscape.smartwindow.global.exception.CustomException;
import com.lumiscape.smartwindow.global.exception.ErrorCode;
import com.lumiscape.smartwindow.global.infra.MqttPublishService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AlarmService {

    private final AlarmRepository alarmRepository;
    private final DeviceService deviceService;
    private final MqttPublishService mqttPublishService;

    public List<AlarmResponse> getAllUserAlarms(Long userId) {

        return alarmRepository.findAllByDeviceUserId(userId).stream()
                .map(AlarmResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public AlarmResponse createAlarm(Long userId, AlarmCreateRequest request) {
        Device device = deviceService.findDeviceByUser(request.deviceId(), userId);

        Alarm alarm = Alarm.builder()
                .device(device)
                .alarmName(request.alarmName())
                .alarmTime(request.alarmTime())
                .repeatDays(request.repeatDays())
                .isActive(request.isActive())
                .build();

        Alarm savedAlarm = alarmRepository.save(alarm);

        publishAlarmToDevice(device, "UPSERT", savedAlarm);

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

        publishAlarmToDevice(alarm.getDevice(), "UPSERT", alarm);

        return AlarmResponse.from(alarm);
    }

    @Transactional
    public void deleteAlarm(Long userId, Long alarmId) {
        Alarm alarm = findAlarmByUser(alarmId, userId);

        Device device = alarm.getDevice();

        alarmRepository.delete(alarm);

        publishAlarmToDevice(device, "DELETE", alarm);
    }

    public List<AlarmResponse> getAlarmsByDevice(Long userId, Long deviceId) {
        deviceService.findDeviceByUser(deviceId, userId);

        return alarmRepository.findAllByDeviceId(deviceId).stream()
                .map(AlarmResponse::from)
                .collect(Collectors.toList());
    }

    public void publishAlarmListToDevice(String deviceUniqueId) {
        Device device = deviceService.findByDeviceUniqueId(deviceUniqueId);

        List<Alarm> allAlarms = alarmRepository.findAllByDeviceId(device.getId());

        List<AlarmResponse> alarmPayloads = allAlarms.stream()
                .map(AlarmResponse::from)
                .toList();

        mqttPublishService.publishCommand(device.getDeviceUniqueId(), "alarm", alarmPayloads);

        log.info("MQTT Publish : deviceUID = {}, Total : {}", device.getDeviceUniqueId(), alarmPayloads.size());
    }

    private Alarm findAlarmByUser(Long alarmId, Long userId) {
        return alarmRepository.findByIdAndDeviceUserId(alarmId, userId)
                .orElseThrow(() -> new CustomException(ErrorCode.ALARM_NOT_FOUND));
    }

    private void publishAlarmToDevice(Device device, String action, Alarm alarm) {
        Map<String, Object> payload;

        if ("DELETE".equals(action)) {
            payload = Map.of("action", "DELETE", "alarm", Map.of("alarmId", alarm.getId()));
        } else {
            payload = Map.of("action", "UPSERT", "alarm", AlarmResponse.from(alarm));
        }

        mqttPublishService.publishCommand(device.getDeviceUniqueId(), "alarm", payload);

        log.info("MQTT Publish : deviceUID = {}, Action = {}, AlarmId = {}", device.getDeviceUniqueId(), action, alarm.getId());
    }
}
