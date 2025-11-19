package com.lumiscape.smartwindow.mobile.repository;

import com.lumiscape.smartwindow.mobile.domain.Mobile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MobileRepository extends JpaRepository<Mobile, String> {

    List<Mobile> findAllByUser_Id(Long userId);

    void deleteAllByUser_Id(Long userId);
}
