package com.lumiscape.smartwindow.auth.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class TokenReissueRequest {
    private String accessToken;
    private String refreshToken;
}