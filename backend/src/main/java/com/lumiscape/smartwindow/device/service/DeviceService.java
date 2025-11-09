package com.lumiscape.smartwindow.device.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lumiscape.smartwindow.device.domain.Device;
import com.lumiscape.smartwindow.device.domain.DeviceMode;
import com.lumiscape.smartwindow.device.dto.*;
import com.lumiscape.smartwindow.device.repository.DeviceRepository;
import com.lumiscape.smartwindow.global.exception.CustomException;
import com.lumiscape.smartwindow.global.exception.ErrorCode;
import com.lumiscape.smartwindow.global.infra.MqttPublishService;
import com.lumiscape.smartwindow.global.infra.S3Service;
import com.lumiscape.smartwindow.media.domain.Media;
import com.lumiscape.smartwindow.media.repository.MediaRepository;
import com.lumiscape.smartwindow.user.domain.entity.User;
import com.lumiscape.smartwindow.user.domain.repository.UserRepository;

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
    private final MediaRepository mediaRepository;
    private final S3Service s3Service;
    private final MqttPublishService mqttPublishService;
    private final ObjectMapper objectMapper;

    public List<DeviceDetailResponse> getMyDevice(Long userId) {

        return deviceRepository.findAllByUserId(userId).stream()
                .map(DeviceDetailResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public DeviceDetailResponse registerDevice(Long userId, DeviceRegisterRequest request) {
        if (deviceRepository.existsByDeviceUniqueId(request.deviceUniqueId())) {
            throw new CustomException(ErrorCode.DEVICE_ALREADY_EXISTS);
        }

        User userReference = userRepository.getReferenceById(userId);

        Device newDevice = Device.builder()
                .user(userReference)
                .deviceUniqueId(request.deviceUniqueId())
                .deviceName(request.deviceName())
                .build();

        Device savedDevice = deviceRepository.save(newDevice);

        return DeviceDetailResponse.from(savedDevice);
    }

    public DeviceDetailResponse getDeviceDetail(Long userId, Long deviceId) {
        Device device = findDeviceByUser(deviceId, userId);

        return DeviceDetailResponse.from(device);
    }

    @Transactional
    public DeviceDetailResponse updateDeviceName(Long userId, Long deviceId, DeviceUpdateNameRequest request) {
        Device device = findDeviceByUser(deviceId, userId);
        device.updateName(request.deviceName());

        return DeviceDetailResponse.from(device);
    }

    @Transactional
    public void deleteDevice(Long userId, Long deviceId) {
        Device device = findDeviceByUser(deviceId, userId);

        deviceRepository.delete(device);
    }

    public DeviceStatusResponse getPowerStatus(Long userId, Long deviceId) {
        Device device = findDeviceByUser(deviceId, userId);

        return DeviceStatusResponse.ofPower(device);
    }

    @Transactional
    public DeviceStatusResponse controlPower(Long userId, Long deviceId, DeviceStatusRequest request) {
        Device device = findDeviceByUser(deviceId, userId);
        boolean newStatus = request.status();

        publishMqttCommand(device.getDeviceUniqueId(), "power", Map.of("status", newStatus));

        device.updatePower(newStatus);

        return DeviceStatusResponse.ofPower(device);
    }

    public DeviceStatusResponse getOpenStatus(Long userId, Long deviceId) {
        Device device = findDeviceByUser(deviceId, userId);

        return DeviceStatusResponse.ofOpen(device);
    }

    @Transactional
    public DeviceStatusResponse controlOpen(Long userId, Long deviceId, DeviceStatusRequest request) {
        Device device = findDeviceByUser(deviceId, userId);
        boolean newStatus = request.status();

        publishMqttCommand(device.getDeviceUniqueId(), "open", Map.of("status", newStatus));

        device.updateOpen(newStatus);

        return DeviceStatusResponse.ofOpen(device);
    }

    @Transactional
    public DeviceModeStatusResponse controlModeStatus(Long userId, Long deviceId, DeviceModeStatusRequest request) {
        Device device = findDeviceByUser(deviceId, userId);

        DeviceMode newMode = DeviceMode.valueOf(request.mode().toUpperCase());

        publishMqttCommand(device.getDeviceUniqueId(), "mode", Map.of("mode", newMode.name()));

        device.updateMode(newMode);

        return DeviceModeStatusResponse.from(device);
    }

    @Transactional
    public DeviceModeSettingsResponse controlModeSettings(Long userId, Long deviceId, DeviceModeSettingsRequest request) {
        Device device = findDeviceByUser(deviceId, userId);
        Map<String, Object> newSettings = request.settings();

        device.updateModeSettings(newSettings);

        return DeviceModeSettingsResponse.from(device);
    }

    @Transactional
    public DeviceDetailResponse updateDeviceMedia(Long userId, Long deviceId, Long mediaId) {
        Device device = findDeviceByUser(deviceId, userId);

        Media media = null;
        if (mediaId != null) {
            media = mediaRepository.findByIdAndUserId(mediaId, userId)
                    .orElseThrow(() -> new CustomException(ErrorCode.IMAGE_NOT_FOUND));
        }

        device.updateMedia(media);

        publishMediaUpdateToDevice(device);

        return DeviceDetailResponse.from(device);
    }

    @Transactional
    public void updateDeviceStatusFromMqtt(String deviceUniqueId, String statusType, String payload) {
        log.info("[MQTT Inbound] ID : {}, TYPE : {}, PAYLOAD : {}", deviceUniqueId, statusType, payload);

        Device device = deviceRepository.findByDeviceUniqueId(deviceUniqueId)
                .orElseThrow(() -> new CustomException(ErrorCode.DEVICE_NOT_FOUND));
        // TODO
        switch (statusType) {
            case "power":
                boolean power = Boolean.parseBoolean(payload);
                device.updatePower(power);
                break;
            case "open":
                boolean open = Boolean.parseBoolean(payload);
                device.updateOpen(open);
                break;
        }
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

    public void publishMediaUpdateToDevice(Device device) {
        Media media = device.getMedia();

        Long mediaId = null;
        String mediaUrl = null;

        if (media != null) {
            mediaId = media.getId();

            mediaUrl = s3Service.generatePresignedUrlForDownload(media.getFileUrl());

            Map<String, Object> payload = Map.of("mediaId", mediaId, "mediaUrl", mediaUrl);

            publishMqttCommand(device.getDeviceUniqueId(), "media", payload);
        }
    }
}
