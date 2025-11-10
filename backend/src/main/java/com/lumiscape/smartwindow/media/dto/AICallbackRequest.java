package com.lumiscape.smartwindow.media.dto;

import com.lumiscape.smartwindow.media.domain.MediaType;

public record AICallbackRequest(
        Long parentMediaId,
        String s3ObjectKey,
        MediaType fileType,
        Long fileSize,
        String resolution
) {
}
