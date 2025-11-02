package com.lumiscape.smartwindow.device.dto;

import com.lumiscape.smartwindow.device.domain.Device;
import com.lumiscape.smartwindow.device.domain.DeviceMode;

import java.time.OffsetDateTime;
import java.util.Map;

public record DeviceDetailResponseDto(
        Long deviceId,
        String deviceUniqueId,
        String deviceName,
        boolean powerStatus,
        boolean openStatus,
        DeviceMode modeStatus,
        Map<String, Object> modeSettings,
        Long mediaId,
        OffsetDateTime createdAt
) {

    public static DeviceDetailResponseDto from(Device device) {
        return new DeviceDetailResponseDto(
                device.getId(),
                device.getDeviceName(),
                device.getDeviceUniqueId(),
                device.isPowerStatus(),
                device.isOpenStatus(),
                device.getModeStatus(),
                device.getModeSettings(),
                null, // device.getMedia() != null ? device.getMedia().getId() : null,
                device.getCreatedAt()
        );
    }
}
