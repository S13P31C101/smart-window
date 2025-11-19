package com.lumiscape.smartwindow.fcm.repository;

import com.lumiscape.smartwindow.mobile.domain.Mobile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FcmRepository extends JpaRepository<Mobile, String> {
    void deleteByUser_Id(Long userId);
}