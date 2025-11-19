package com.lumiscape.smartwindow.media.event;

public record MediaUploadEvent(
        Long userId,
        Long deviceId,
        Long mediaId
) {
}