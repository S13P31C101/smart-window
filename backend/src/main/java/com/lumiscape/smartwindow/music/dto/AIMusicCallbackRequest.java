package com.lumiscape.smartwindow.music.dto;

// TODO improve music part
public record AIMusicCallbackRequest(
        Long mediaId,
        String deviceId,
        String musicUrl
) {
}
