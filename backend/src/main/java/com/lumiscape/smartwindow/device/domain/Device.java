package com.lumiscape.smartwindow.device.domain;

import com.lumiscape.smartwindow.alarm.domain.Alarm;
import com.lumiscape.smartwindow.media.domain.Media;
import com.lumiscape.smartwindow.user.domain.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "devices")
public class Device {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "device_unique_id", nullable = false, unique = true)
    private String deviceUniqueId;

    @Column(name = "device_name", nullable = false, length = 100)
    private String deviceName;

    @Column(name = "power_status", nullable = false)
    private boolean powerStatus = false;

    @Column(name = "open_status", nullable = false)
    private boolean openStatus = false;

    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "mode_status", nullable = false, columnDefinition = "device_mode_enum")
    private DeviceMode modeStatus = DeviceMode.AUTO_MODE;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "mode_settings", columnDefinition = "jsonb")
    private Map<String, Object> modeSettings;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "media_id")
    private Media media;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @OneToMany(mappedBy = "device", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Alarm> alarms = new ArrayList<>();

    @Builder
    public Device(User user, String deviceUniqueId, String deviceName, Media media) {
        this.user = user;
        this.deviceUniqueId = deviceUniqueId;
        this.deviceName = deviceName;
        this.media = media;
    }

    public void updateName(String deviceName) {
        this.deviceName = deviceName;
    }
    public void updatePower(boolean powerStatus) {
        this.powerStatus = powerStatus;
    }
    public void updateOpen(boolean openStatus) {
        this.openStatus = openStatus;
    }
    public void updateMode(DeviceMode modeStatus) {
        this.modeStatus = modeStatus;
    }
    public void updateModeSettings(Map<String, Object> settings) {
        this.modeSettings = settings;
    }
    public void updateMedia(Media media) {
        this.media = media;
    }

}
