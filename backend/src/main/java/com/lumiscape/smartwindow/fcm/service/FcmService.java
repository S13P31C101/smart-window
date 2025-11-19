package com.lumiscape.smartwindow.fcm.service;

import com.lumiscape.smartwindow.fcm.dto.FcmTokenRequest;
import com.lumiscape.smartwindow.fcm.repository.FcmRepository;
import com.lumiscape.smartwindow.global.exception.CustomException;
import com.lumiscape.smartwindow.global.exception.ErrorCode;
import com.lumiscape.smartwindow.mobile.domain.Mobile;
import com.lumiscape.smartwindow.user.domain.entity.User;
import com.lumiscape.smartwindow.user.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FcmService {

    private final FcmRepository fcmRepository;
    private final UserRepository userRepository;

    @Transactional
    public void registerFcmToken(Long userId, FcmTokenRequest fcmTokenRequest) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        Mobile mobile = Mobile.builder()
                .token(fcmTokenRequest.getFcmToken())
                .user(user)
                .build();

        fcmRepository.save(mobile);
    }
}