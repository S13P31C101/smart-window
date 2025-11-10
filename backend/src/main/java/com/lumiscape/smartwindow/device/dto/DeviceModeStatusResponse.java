package com.lumiscape.smartwindow.device.dto;

import com.lumiscape.smartwindow.device.domain.Device;
import com.lumiscape.smartwindow.device.domain.DeviceMode;

import java.util.Map;

public record DeviceModeStatusResponse(
        Long deviceId,
        DeviceMode modeStatus
) {
    public static DeviceModeStatusResponse from(Device device) {
        return new DeviceModeStatusResponse(device.getId(), device.getModeStatus());
    }
}
