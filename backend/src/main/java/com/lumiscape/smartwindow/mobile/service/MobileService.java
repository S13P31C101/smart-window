package com.lumiscape.smartwindow.mobile.service;

import com.lumiscape.smartwindow.mobile.domain.Mobile;
import com.lumiscape.smartwindow.mobile.repository.MobileRepository;
import com.lumiscape.smartwindow.user.domain.entity.User;
import com.lumiscape.smartwindow.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class MobileService {

    private final MobileRepository mobileRepository;
    private final UserService userService;

    public void registerFcmToken(Long userId, String token) {
        User user = userService.getUserReference(userId);

        Mobile mobile = Mobile.builder()
                        .token(token)
                        .user(user)
                        .build();

        mobileRepository.save(mobile);
    }
}
