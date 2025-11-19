package com.lumiscape.smartwindow.device.service;

import com.lumiscape.smartwindow.device.domain.Device;
import com.lumiscape.smartwindow.device.domain.DeviceMode;
import com.lumiscape.smartwindow.device.dto.*;
import com.lumiscape.smartwindow.device.repository.DeviceRepository;
import com.lumiscape.smartwindow.fcm.service.FcmNotificationService;
import com.lumiscape.smartwindow.global.exception.CustomException;
import com.lumiscape.smartwindow.global.exception.ErrorCode;
import com.lumiscape.smartwindow.global.infra.MqttPublishService;
import com.lumiscape.smartwindow.global.infra.S3Service;
import com.lumiscape.smartwindow.media.domain.Media;
import com.lumiscape.smartwindow.media.domain.MediaOrigin;
import com.lumiscape.smartwindow.media.service.MediaService;
import com.lumiscape.smartwindow.music.domain.Music;
import com.lumiscape.smartwindow.music.service.MusicService;
import com.lumiscape.smartwindow.user.domain.entity.User;

import com.lumiscape.smartwindow.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import com.lumiscape.smartwindow.fcm.service.FcmNotificationService;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DeviceService {

    private final DeviceRepository deviceRepository;
    private final UserService userService;
    private final S3Service s3Service;
    private final MqttPublishService mqttPublishService;

    private final FcmNotificationService fcmNotificationService;

    private MediaService mediaService;
    private MusicService musicService;

    @Autowired
    public void setMediaService(@Lazy MediaService mediaService) {
        this.mediaService = mediaService;
    }

    @Autowired
    public void setMusicService(@Lazy MusicService musicService) {
        this.musicService = musicService;
    }

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

        User userReference = userService.getUserReference(userId);

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

        mqttPublishService.publishCommand(device.getDeviceUniqueId(), "power", Map.of("status", newStatus));

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

        mqttPublishService.publishCommand(device.getDeviceUniqueId(), "open", Map.of("status", newStatus));

        device.updateOpen(newStatus);

        return DeviceStatusResponse.ofOpen(device);
    }

    @Transactional
    public DeviceStatusResponse controlOpacity(Long userId, Long deviceId, DeviceStatusRequest request) {
        Device device = findDeviceByUser(deviceId, userId);
        boolean newStatus = request.status();

        mqttPublishService.publishCommand(device.getDeviceUniqueId(), "opacity", Map.of("status", newStatus));

        device.updateOpacity(newStatus);

        return DeviceStatusResponse.ofOpacity(device);
    }

    @Transactional
    public DeviceModeStatusResponse controlModeStatus(Long userId, Long deviceId, DeviceModeStatusRequest request) {
        Device device = findDeviceByUser(deviceId, userId);

        DeviceMode newMode = DeviceMode.valueOf(request.mode().toUpperCase());

        mqttPublishService.publishCommand(device.getDeviceUniqueId(), "mode", Map.of("status", newMode.name()));

        device.updateMode(newMode);

        return DeviceModeStatusResponse.from(device);
    }

    @Transactional
    public DeviceModeSettingsResponse controlModeSettings(Long userId, Long deviceId, DeviceModeSettingsRequest request) {
        Device device = findDeviceByUser(deviceId, userId);
        Map<String, Object> newSettings = Map.of("widgetClock", request.widgetClock(),
                "widgetWeather", request.widgetWeather(),
                "widgetQuotes", request.widgetQuotes(),
                "widgetMusic", request.widgetMusic());

        mqttPublishService.publishCommand(device.getDeviceUniqueId(), "widgets", newSettings);

        device.updateModeSettings(newSettings);

        return DeviceModeSettingsResponse.from(device);
    }

    @Transactional
    public DeviceDetailResponse updateDeviceMedia(Long userId, Long deviceId, Long mediaId) {
        Device device = findDeviceByUser(deviceId, userId);

        Media media = null;
        if (mediaId != null) {
            media = mediaService.findMediaByUser(mediaId, userId);
        }

        device.updateMedia(media);

        publishMediaUpdateToDevice(device);

        return DeviceDetailResponse.from(device);
    }

    @Transactional
    public void deleteDevicesMedia(Long userId, Long mediaId) {
        Media media = mediaService.findMediaByUser(mediaId, userId);

        List<Device> affectedDevices = findByAllMedia(media);

        Media replacementMedia = (media.getOriginType() != MediaOrigin.ORIGINAL && media.getParentMedia() != null)
                ? media.getParentMedia() : null;

        for (Device device : affectedDevices) {
            device.updateMedia(replacementMedia);
            publishMediaUpdateToDevice(device);
        }
    }

    @Transactional
    public DeviceDetailResponse updateDeviceMusic(Long userId, Long deviceId, Long musicId) {
        Device device = findDeviceByUser(deviceId, userId);

        Music music = null;
        if (musicId != null) {
            music = musicService.findMusicByUser(musicId, userId);
        }

        device.updateMusic(music);

        publishMusicUpdateToDevice(device);

        return DeviceDetailResponse.from(device);
    }

    @Transactional
    public void updateDeviceStatusFromMqtt(String deviceUniqueId, String statusType, String payload) {
        log.info("[MQTT Inbound] ID : {}, TYPE : {}, PAYLOAD : {}", deviceUniqueId, statusType, payload);

        Device device = findByDeviceUniqueId(deviceUniqueId);

        switch (statusType) {
            case "power":
                boolean power = Boolean.parseBoolean(payload);
                device.updatePower(power);
                // TODO FCM
                fcmNotificationService.sendNotification(device.getUser().getId(),
                        "전원",
                        device.getDeviceName() + (power ? " 의 전원이 켜졌습니다." : " 의 전원이 꺼졌습니다."));
                break;
            case "open":
                boolean open = Boolean.parseBoolean(payload);
                device.updateOpen(open);
                // TODO FCM
                fcmNotificationService.sendNotification(device.getUser().getId(),
                        "개폐",
                        device.getDeviceName() + (open ? " 이 열렸습니다." : " 이 닫혔습니다."));
                break;
            case "mode":
                DeviceMode mode = DeviceMode.valueOf(payload);
                device.updateMode(mode);
                fcmNotificationService.sendNotification(device.getUser().getId(),
                        "모드",
                        device.getDeviceName() + " 가 " + mode + " 입니다.");
            case "sensor":
                // TODO FCM
                fcmNotificationService.sendNotification(device.getUser().getId(),
                        "센서",
                        payload);
                break;
        }
    }

    @Transactional(readOnly = true)
    public Device findDeviceByUser(Long deviceId, Long userId) {
        return deviceRepository.findByIdAndUserId(deviceId, userId)
                .orElseThrow(() -> new CustomException(ErrorCode.FORBIDDEN_DEVICE_ACCESS));
    }

    public List<Device> findByAllMedia(Media media) {
        return deviceRepository.findAllByMedia(media);
    }

    public Device findByDeviceUniqueId(String deviceUniqueId) {
        return deviceRepository.findByDeviceUniqueId(deviceUniqueId)
                .orElseThrow(() -> new CustomException(ErrorCode.DEVICE_NOT_FOUND));
    }

    // TODO improve music part
    public String findById(Long deviceId) {
        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new CustomException(ErrorCode.DEVICE_NOT_FOUND));

        return device.getDeviceUniqueId();
    }

    public void publishMediaUpdateToDevice(Device device) {
        Media media = device.getMedia();

        Long mediaId = null;
        String mediaUrl = null;

        if (media != null) {
            mediaId = media.getId();

            mediaUrl = s3Service.generatePresignedUrlForDownload(media.getFileUrl());
        }

        Map<String, Object> payload = Map.of("mediaId", mediaId, "mediaUrl", mediaUrl);

        mqttPublishService.publishCommand(device.getDeviceUniqueId(), "media", payload);
    }

    public void publishMusicUpdateToDevice(Device device) {
        Music music = device.getMusic();

        Long musicId = null;
        String musicUrl = null;

        if (music != null) {
            musicId = music.getId();
            musicUrl = music.getMusicUrl();
        }

        Map<String, Object> payload = new HashMap<>();
        payload.put("musicId", musicId);
        payload.put("musicUrl", musicUrl);

        mqttPublishService.publishCommand(device.getDeviceUniqueId(), "music", payload);
    }
}
