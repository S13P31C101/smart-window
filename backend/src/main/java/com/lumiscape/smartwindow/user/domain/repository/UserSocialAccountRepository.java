package com.lumiscape.smartwindow.user.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.lumiscape.smartwindow.user.domain.entity.UserSocialAccount;
import com.lumiscape.smartwindow.user.domain.entity.UserSocialAccountId;

import java.util.Optional;

public interface UserSocialAccountRepository extends JpaRepository<UserSocialAccount, UserSocialAccountId> {
    // socialId와 provider로 소셜 계정 정보를 찾는 메소드
    Optional<UserSocialAccount> findById(UserSocialAccountId id);
}