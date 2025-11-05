package com.lumiscape.smartwindow.media.dto;

import com.lumiscape.smartwindow.media.domain.MediaType;

public record MediaRegisterRequest(
        String s3ObjectKey,
        String fileName,
        MediaType fileType,
        Long fileSize,
        String resolution
) {
}
