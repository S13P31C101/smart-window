package com.lumiscape.smartwindow.music.dto;

import com.lumiscape.smartwindow.music.domain.RegistrantType;

public record MusicRegisterRequest(
        String musicName,
        String musicUrl,
        RegistrantType registrantType
) {
}
