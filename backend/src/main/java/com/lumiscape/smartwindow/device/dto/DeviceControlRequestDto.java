package com.lumiscape.smartwindow.device.dto;

import java.util.Map;

public record DeviceControlRequestDto(
        Boolean status,
        String mode,
        Map<String, Object> modeSettings
) {
}
