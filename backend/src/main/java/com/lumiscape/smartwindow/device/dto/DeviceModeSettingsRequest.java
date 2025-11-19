package com.lumiscape.smartwindow.device.dto;

import java.util.Map;

public record DeviceModeSettingsRequest(
        boolean widgetClock,
        boolean widgetWeather,
        boolean widgetQuotes,
        boolean widgetMusic
) {
}
