package com.lumiscape.smartwindow.user.repository;

import com.lumiscape.smartwindow.user.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
}
