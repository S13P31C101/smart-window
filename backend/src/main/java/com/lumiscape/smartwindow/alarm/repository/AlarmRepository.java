package com.lumiscape.smartwindow.alarm.repository;

import com.lumiscape.smartwindow.alarm.domain.Alarm;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AlarmRepository extends JpaRepository<Alarm, Long> {

    List<Alarm> findAllByDeviceUserId(Long userId);

    Optional<Alarm> findByIdAndDeviceUserId(Long alarmId, Long userId);

    List<Alarm> findAllByDeviceId(Long deviceId);

    List<Alarm> findAllByDeviceIdAndDeviceUserId(Long deviceId, Long userId);
}
