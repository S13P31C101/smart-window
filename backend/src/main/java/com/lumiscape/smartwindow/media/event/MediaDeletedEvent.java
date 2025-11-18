package com.lumiscape.smartwindow.media.event;

public record MediaDeletedEvent(
        Long userId,
        Long mediaId
) {
}