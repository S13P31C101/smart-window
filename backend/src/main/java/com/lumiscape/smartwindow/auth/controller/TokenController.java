package com.lumiscape.smartwindow.auth.controller;

import com.lumiscape.smartwindow.auth.dto.TokenReissueRequest;
import com.lumiscape.smartwindow.auth.dto.TokenResponse;
import com.lumiscape.smartwindow.auth.service.AuthService;
import com.lumiscape.smartwindow.global.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/tokens")
public class TokenController {

    private final AuthService authService;

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(@AuthenticationPrincipal Long userId) {
        authService.logout(userId);
        return ResponseEntity.ok(ApiResponse.onSuccess(HttpStatus.OK, null));
    }

    @PostMapping("/reissue")
    public ResponseEntity<ApiResponse<TokenResponse>> reissue(@RequestBody TokenReissueRequest request) {
        TokenResponse tokenResponse = authService.reissue(request);
        return ResponseEntity.ok(ApiResponse.onSuccess(HttpStatus.OK, tokenResponse));
    }
}