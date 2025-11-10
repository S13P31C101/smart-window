package com.lumiscape.smartwindow.device.dto;

import com.lumiscape.smartwindow.device.domain.Device;

import java.util.Map;

public record DeviceModeSettingsResponse(
        Long deviceId,
        Map<String, Object> modeSettings
) {
    public static DeviceModeSettingsResponse from(Device device) {
        return new DeviceModeSettingsResponse(device.getId(), device.getModeSettings());
    }
}
