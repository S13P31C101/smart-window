package com.lumiscape.smartwindow.media.dto;

import com.lumiscape.smartwindow.media.domain.MediaType;

public record MediaUploadRequest(
        String fileName,
        MediaType fileType
) {
}
