package com.lumiscape.smartwindow.user.domain;

import com.lumiscape.smartwindow.device.domain.Device;
import com.lumiscape.smartwindow.media.domain.Media;
import com.lumiscape.smartwindow.mobile.domain.Mobile;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Table(name = "users")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(nullable = false, length = 50)
    private String nickname;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "last_login_at")
    private OffsetDateTime lastLoginAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "user_status_enum")
    private UserStatus status;


    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UserSocialAccount> socialAccounts = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Mobile> mobiles = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Media> mediaList = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Device> devices = new ArrayList<>();


    @Builder
    public User(String email, String nickname) {
        this.email = email;
        this.nickname = nickname;
    }

    public User updateNickname(String nickname) {
        this.nickname = nickname;

        return this;
    }

    public User updateLastLogin() {
        this.lastLoginAt = OffsetDateTime.now();

        return this;
    }
}
