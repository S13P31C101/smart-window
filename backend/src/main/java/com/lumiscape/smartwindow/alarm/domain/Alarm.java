package com.lumiscape.smartwindow.alarm.domain;

import com.lumiscape.smartwindow.device.domain.Device;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalTime;
import java.time.OffsetDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "alarms")
public class Alarm {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_id", nullable = false)
    private Device device;

    @Column(name = "alarm_name", nullable = false, length = 100)
    private String alarmName;

    @Column(name = "alarm_time", nullable = false)
    private LocalTime alarmTime;

    @Column(name = "repeat_days", length = 100)
    private String repeatDays;

    @Column(name = "is_active", nullable = false)
    private boolean isActive;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;


    @Builder
    public Alarm(Device device, String alarmName, LocalTime alarmTime, String repeatDays, boolean isActive) {
        this.device = device;
        this.alarmName = alarmName;
        this.alarmTime = alarmTime;
        this.repeatDays = repeatDays;
        this.isActive = isActive;
    }


    public void update(String alarmName, LocalTime alarmTime, String repeatDays, boolean isActive) {
        this.alarmName = alarmName;
        this.alarmTime = alarmTime;
        this.repeatDays = repeatDays;
        this.isActive = isActive;
    }
}
