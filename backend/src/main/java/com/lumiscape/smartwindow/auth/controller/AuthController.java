package com.lumiscape.smartwindow.auth.controller;

import com.lumiscape.smartwindow.global.common.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @GetMapping("/success")
    public ResponseEntity<ApiResponse<Map<String, String>>> oauthSuccess(
            @RequestParam("accessToken") String accessToken,
            @RequestParam("refreshToken") String refreshToken) {
        
        Map<String, String> tokens = Map.of(
                "accessToken", accessToken,
                "refreshToken", refreshToken
        );
        
        return ResponseEntity.ok(ApiResponse.onSuccess(HttpStatus.OK, tokens));
    }
}
