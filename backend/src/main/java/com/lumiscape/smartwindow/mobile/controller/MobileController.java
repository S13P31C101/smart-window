package com.lumiscape.smartwindow.mobile.controller;

// import com.lumiscape.smartwindow.config.security.SecurityUtil; // 이 클래스의 실제 위치를 확인하고 import 하세요.
import com.lumiscape.smartwindow.global.common.ApiResponse;
import com.lumiscape.smartwindow.mobile.dto.FcmTokenRequestDto;
import com.lumiscape.smartwindow.mobile.service.MobileService;
import com.lumiscape.smartwindow.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/v1/mobile")
@RequiredArgsConstructor
public class MobileController {

    private final MobileService mobileService;

    @PostMapping("/fcm-token")
    @ResponseStatus(HttpStatus.OK)
    public ApiResponse<?> registerFcmToken(@AuthenticationPrincipal User user, @RequestBody FcmTokenRequestDto fcmTokenRequestDto) {
        mobileService.registerFcmToken(user.getEmail(), fcmTokenRequestDto.getFcmToken());
        return ApiResponse.onSuccess();
    }
}
