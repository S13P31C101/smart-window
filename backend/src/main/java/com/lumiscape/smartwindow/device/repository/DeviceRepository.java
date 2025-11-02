package com.lumiscape.smartwindow.device.repository;

import com.lumiscape.smartwindow.device.domain.Device;
import com.lumiscape.smartwindow.user.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DeviceRepository extends JpaRepository<Device, Long> {

    List<Device> findAllByUser(User user);

    boolean existsByDeviceUniqueId(String deviceUniqueId);

    Optional<Device> findByIdAndUserId(Long deviceId, Long userId);
}
