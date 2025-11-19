package com.lumiscape.smartwindow.mobile.controller;

import com.lumiscape.smartwindow.global.common.ApiResponse;
import com.lumiscape.smartwindow.mobile.dto.MobileTokenRequest;
import com.lumiscape.smartwindow.mobile.service.MobileService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

@RestController
@RequestMapping("/api/v1/mobile")
@RequiredArgsConstructor
public class MobileController {

    private final MobileService mobileService;

    @PostMapping
    public ApiResponse<?> registerFcmToken(@AuthenticationPrincipal Long userId,
                                           @RequestBody MobileTokenRequest request) {
        mobileService.registerFcmToken(userId, request.fcmToken());

        return ApiResponse.onSuccess();
    }
}
