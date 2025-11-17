package com.lumiscape.smartwindow.mobile.service;

import com.lumiscape.smartwindow.fcm.domain.FcmToken;
import com.lumiscape.smartwindow.fcm.repository.FcmTokenRepository;
import com.lumiscape.smartwindow.user.domain.entity.User;
import com.lumiscape.smartwindow.user.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class MobileService {

    private final UserRepository userRepository;
    private final FcmTokenRepository fcmTokenRepository;

    public void registerFcmToken(String userEmail, String token) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userEmail));

        fcmTokenRepository.findByUser(user).ifPresentOrElse(
                fcmToken -> {
                    // 이미 토큰이 있으면 값만 업데이트
                    fcmToken.updateToken(token);
                },
                () -> {
                    // 토큰이 없으면 새로 생성하여 저장
                    fcmTokenRepository.save(new FcmToken(user, token));
                }
        );
    }
}
