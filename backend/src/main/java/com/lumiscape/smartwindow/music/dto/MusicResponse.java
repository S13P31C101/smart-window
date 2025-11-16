package com.lumiscape.smartwindow.music.dto;

import com.lumiscape.smartwindow.music.domain.Music;

public record MusicResponse(
        Long musicId,
        String musicName,
        String musicUrl,
        boolean isSystemMusic
) {
    public static MusicResponse from(Music music) {
        return new MusicResponse(
                music.getId(),
                music.getMusicName(),
                music.getMusicUrl(),
                music.getUser() == null
        );
    }
}
