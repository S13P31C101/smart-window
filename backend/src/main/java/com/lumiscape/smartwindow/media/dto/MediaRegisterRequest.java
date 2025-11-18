package com.lumiscape.smartwindow.media.dto;

import com.lumiscape.smartwindow.media.domain.MediaType;

public record MediaRegisterRequest(
        // TODO improve music part
        Long deviceId,
        String s3ObjectKey,
        String fileName,
        MediaType fileType,
        Long fileSize,
        String resolution
) {
}
