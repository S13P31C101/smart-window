package com.lumiscape.smartwindow.device.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lumiscape.smartwindow.device.domain.Device;
import com.lumiscape.smartwindow.device.domain.DeviceMode;
import com.lumiscape.smartwindow.device.dto.DeviceControlRequestDto;
import com.lumiscape.smartwindow.device.dto.DeviceDetailResponseDto;
import com.lumiscape.smartwindow.device.dto.DeviceRegisterRequestDto;
import com.lumiscape.smartwindow.device.dto.DeviceUpdateRequestDto;
import com.lumiscape.smartwindow.device.repository.DeviceRepository;
import com.lumiscape.smartwindow.global.exception.CustomException;
import com.lumiscape.smartwindow.global.exception.ErrorCode;
import com.lumiscape.smartwindow.global.infra.MqttPublishService;
import com.lumiscape.smartwindow.user.domain.User;
import com.lumiscape.smartwindow.user.repository.UserRepository;
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
public class DeviceService {

    private final DeviceRepository deviceRepository;
    private final UserRepository userRepository;
    private final MqttPublishService mqttPublishService;
    private final ObjectMapper objectMapper;

    public List<DeviceDetailResponseDto> getMyDevice(Long userId) {
        User user = findUserById(userId);

        return deviceRepository.findAllByUser(user).stream()
                .map(DeviceDetailResponseDto::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public DeviceDetailResponseDto registerDevice(Long userId, DeviceRegisterRequestDto request) {
        if (deviceRepository.existsByDeviceUniqueId(request.deviceUniqueId())) {
            throw new CustomException(ErrorCode.DEVICE_ALREADY_EXISTS);
        }

        User user = findUserById(userId);

        Device newDevice = Device.builder()
                .user(user)
                .deviceUniqueId(request.deviceUniqueId())
                .deviceName(request.deviceName())
                .build();

        Device savedDevice = deviceRepository.save(newDevice);

        return DeviceDetailResponseDto.from(savedDevice);
    }

    public DeviceDetailResponseDto getDeviceDetail(Long userId, Long deviceId) {
        Device device = findDeviceByUser(deviceId, userId);

        return DeviceDetailResponseDto.from(device);
    }

    @Transactional
    public DeviceDetailResponseDto updateDeviceName(Long userId, Long deviceId, DeviceUpdateRequestDto request) {
        Device device = findDeviceByUser(deviceId, userId);
        device.updateName(request.deviceName());

        return DeviceDetailResponseDto.from(device);
    }

    @Transactional
    public void deleteDevice(Long userId, Long deviceId) {
        Device device = findDeviceByUser(deviceId, userId);

        deviceRepository.delete(device);
    }

    @Transactional
    public DeviceDetailResponseDto controlPower(Long userId, Long deviceId, DeviceControlRequestDto request) {
        Device device = findDeviceByUser(deviceId, userId);
        boolean newStatus = request.status();

        publishMqttCommand(device.getDeviceUniqueId(), "power", Map.of("status", newStatus));

        device.updatePower(newStatus);

        return DeviceDetailResponseDto.from(device);
    }

    @Transactional
    public DeviceDetailResponseDto controlOpen(Long userId, Long deviceId, DeviceControlRequestDto request) {
        Device device = findDeviceByUser(deviceId, userId);
        boolean newStatus = request.status();

        publishMqttCommand(device.getDeviceUniqueId(), "open", Map.of("status", newStatus));

        device.updateOpen(newStatus);

        return DeviceDetailResponseDto.from(device);
    }

    @Transactional
    public DeviceDetailResponseDto controlMode(Long userId, Long deviceId, DeviceControlRequestDto request) {
        Device device = findDeviceByUser(deviceId, userId);

        DeviceMode newMode = DeviceMode.valueOf(request.mode().toUpperCase());
        Map<String, Object> newSettings = request.modeSettings();

        publishMqttCommand(device.getDeviceUniqueId(), "mode", Map.of("mode", newMode));

        device.updateMode(newMode);
        device.updateModeSettings(newSettings);

        return DeviceDetailResponseDto.from(device);
    }

    @Transactional
    public void updateDeviceStatusFromMqtt(String deviceUniqueId, String statusType, String payload) {
        log.info("[MQTT Inbound] ID : {}, TYPE : {}, PAYLOAD : {}", deviceUniqueId, statusType, payload);

        // TODO
    }

    // TODO
    private User findUserById(Long userId) {
        return null;
//        return userRepository.findById(userId)
//                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
    }

    private Device findDeviceByUser(Long deviceId, Long userId) {
        return deviceRepository.findByIdAndUserId(deviceId, userId)
                .orElseThrow(() -> new CustomException(ErrorCode.FORBIDDEN_DEVICE_ACCESS));
    }

    private void publishMqttCommand(String deviceUniqueId, String command, Object payload) {
        try {
            String jsonPayload = objectMapper.writeValueAsString(payload);
            mqttPublishService.publishCommand(deviceUniqueId, command, jsonPayload);
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize MQTT payload", e);

            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }
}
