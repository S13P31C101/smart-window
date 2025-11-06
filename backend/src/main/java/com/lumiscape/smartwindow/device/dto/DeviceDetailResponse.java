package com.lumiscape.smartwindow.device.dto;

import com.lumiscape.smartwindow.device.domain.Device;
import com.lumiscape.smartwindow.device.domain.DeviceMode;

import java.time.OffsetDateTime;
import java.util.Map;

public record DeviceDetailResponse(
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

    public static DeviceDetailResponse from(Device device) {
        return new DeviceDetailResponse(
                device.getId(),
                device.getDeviceUniqueId(),
                device.getDeviceName(),
                device.isPowerStatus(),
                device.isOpenStatus(),
                device.getModeStatus(),
                device.getModeSettings(),
                device.getMedia() != null ? device.getMedia().getId() : null,
                device.getCreatedAt()
        );
    }
}
