package com.lumiscape.smartwindow.user.controller;

import com.lumiscape.smartwindow.user.dto.UserInfoResponseDto;
import com.lumiscape.smartwindow.user.dto.UserUpdateRequestDto;
import com.lumiscape.smartwindow.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // B-1: 내 정보 조회 (GET /api/v1/users/me)
    @GetMapping("/me")
    public ResponseEntity<UserInfoResponseDto> getMyInfo(@AuthenticationPrincipal Long userId) {
        UserInfoResponseDto userInfo = userService.getUserInfo(userId);

        return ResponseEntity.ok(userInfo);
    }

    // B-2: 내 정보 수정 (PUT /api/v1/users/me)
    @PutMapping("/me")
    public ResponseEntity<Map<String, String>> updateMyInfo(@AuthenticationPrincipal Long userId,
                                                            @RequestBody UserUpdateRequestDto requestDto) {
        userService.updateNickname(userId, requestDto);

        return ResponseEntity.ok(Map.of("message", "사용자 정보가 성공적으로 수정되었습니다."));
    }

    // B-3: 내 정보 탈퇴 (DELETE /api/v1/users/me)
    @DeleteMapping("/me")
    public ResponseEntity<Map<String, String>> deleteMyAccount(@AuthenticationPrincipal Long userId) {
        userService.deleteUser(userId);
        
        // 성공 응답을 반환합니다.
        return ResponseEntity.ok(Map.of("message", "회원 탈퇴가 성공적으로 처리되었습니다."));
    }
}
