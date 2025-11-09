package com.lumiscape.smartwindow.user.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.lumiscape.smartwindow.user.domain.entity.User;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    // OAuth2SuccessHandler에서 중복 가입 방지를 위해 필수적으로 사용됩니다.
    Optional<User> findByEmail(String email);
}
