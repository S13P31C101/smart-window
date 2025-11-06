package com.lumiscape.smartwindow.device.repository;

import com.lumiscape.smartwindow.device.domain.Device;
import com.lumiscape.smartwindow.media.domain.Media;
import com.lumiscape.smartwindow.user.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DeviceRepository extends JpaRepository<Device, Long> {

    List<Device> findAllByUserId(Long userId);

    boolean existsByDeviceUniqueId(String deviceUniqueId);

    Optional<Device> findByIdAndUserId(Long deviceId, Long userId);

    Optional<Device> findByDeviceUniqueId(String deviceUniqueId);

    List<Device> findAllByMedia(Media media);
}
