package com.lumiscape.smartwindow.auth.service;

import com.lumiscape.smartwindow.auth.domain.RefreshToken;
import com.lumiscape.smartwindow.auth.dto.TokenReissueRequest;
import com.lumiscape.smartwindow.auth.dto.TokenResponse;
import com.lumiscape.smartwindow.auth.repository.RefreshTokenRepository;
import com.lumiscape.smartwindow.config.jwt.JwtTokenProvider;
import com.lumiscape.smartwindow.fcm.repository.FcmRepository;
import com.lumiscape.smartwindow.global.exception.CustomException;
import com.lumiscape.smartwindow.global.exception.ErrorCode;
import com.lumiscape.smartwindow.user.domain.entity.User;
import com.lumiscape.smartwindow.user.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;
    private final FcmRepository fcmRepository;

    @Transactional
    public void logout(Long userId) {
        refreshTokenRepository.deleteById(userId);
        fcmRepository.deleteByUser_Id(userId);
    }

    @Transactional
    public TokenResponse reissue(TokenReissueRequest tokenReissueRequest) {
        String refreshTokenValue = tokenReissueRequest.getRefreshToken();

        // 1. Refresh Token 유효성 검증
        jwtTokenProvider.validateToken(refreshTokenValue);

        // 2. DB에 저장된 토큰과 일치하는지 확인
        RefreshToken refreshToken = refreshTokenRepository.findByToken(refreshTokenValue)
                .orElseThrow(() -> new CustomException(ErrorCode.INVALID_TOKEN));

        // 3. 토큰에서 사용자 ID 추출
        Long userId = jwtTokenProvider.getUserIdFromToken(refreshTokenValue);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        // 4. 새로운 토큰 생성
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                user.getId().toString(), null, Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")));
        TokenResponse newTokenResponse = jwtTokenProvider.generateTokenResponse(authentication);

        // 5. DB에 새로운 Refresh Token 업데이트
        refreshToken.updateToken(newTokenResponse.getRefreshToken());
        refreshTokenRepository.save(refreshToken);

        return newTokenResponse;
    }
}
