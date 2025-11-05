package com.lumiscape.smartwindow.media.dto;

public record MediaUploadResponse(
        String s3ObjectKey,
        String fileUrl
) {
}
