package com.lumiscape.smartwindow.device.dto;

import com.lumiscape.smartwindow.device.domain.Device;

public record DeviceStatusResponse(
        Long deviceId,
        Boolean status
) {

    public static DeviceStatusResponse ofPower(Device device) {
        return new DeviceStatusResponse(device.getId(), device.isPowerStatus());
    }

    public static DeviceStatusResponse ofOpen(Device device) {
        return new DeviceStatusResponse(device.getId(), device.isOpenStatus());
    }
}
