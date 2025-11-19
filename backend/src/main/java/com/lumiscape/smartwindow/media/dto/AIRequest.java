package com.lumiscape.smartwindow.media.dto;

import com.lumiscape.smartwindow.media.domain.MediaOrigin;

public record AIRequest(
        Long mediaId,
        String downloadUrl,
        String targetAIS3Key,
        String sceneType
) {
}
