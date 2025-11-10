package com.lumiscape.smartwindow.media.dto;

public record AIRequest(
        Long mediaId,
        String downloadUrl,
        String targetAIS3Key
) {
}
