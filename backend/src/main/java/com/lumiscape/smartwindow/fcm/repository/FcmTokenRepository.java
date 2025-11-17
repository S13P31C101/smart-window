package com.lumiscape.smartwindow.fcm.repository;

import com.lumiscape.smartwindow.fcm.domain.FcmToken;
import com.lumiscape.smartwindow.user.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface FcmTokenRepository extends JpaRepository<FcmToken, Long> {
    Optional<FcmToken> findByUser(User user);
    Optional<FcmToken> findByUserId(Long userId);
}
