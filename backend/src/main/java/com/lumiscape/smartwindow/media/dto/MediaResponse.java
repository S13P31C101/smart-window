package com.lumiscape.smartwindow.media.dto;

import com.lumiscape.smartwindow.media.domain.Media;
import com.lumiscape.smartwindow.media.domain.MediaOrigin;
import com.lumiscape.smartwindow.media.domain.MediaType;

import java.time.OffsetDateTime;

public record MediaResponse(
        Long mediaId,
        String fileName,
        String downloadUrl,
        MediaType fileType,
        MediaOrigin originType,
        Long parentMediaId,
        Long fileSize,
        String bgmUrl,
        String resolution,
        OffsetDateTime createdAt
) {
    public static MediaResponse from(Media media, String downloadUrl) {
        return new MediaResponse(
                media.getId(),
                media.getFileName(),
                downloadUrl,
                media.getFileType(),
                media.getOriginType(),
                (media.getParentMedia() != null) ? media.getParentMedia().getId() : null,
                media.getFileSize(),
                media.getBgmUrl(),
                media.getResolution(),
                media.getCreatedAt()
        );
    }
}
