package com.lumiscape.smartwindow.device.dto;

public record DeviceSensorDataRequest(
        Integer co2,
        Double pm25,
        Double pm10,
        Double temperature,
        Double humidity
) {
}
