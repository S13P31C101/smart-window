package com.lumiscape.smartwindow.device.dto;

public record DeviceRegisterRequest(
        String deviceUniqueId,
        String deviceName
) {
}
