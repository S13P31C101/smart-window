package com.lumiscape.smartwindow.mobile.domain;

import com.lumiscape.smartwindow.user.domain.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "mobiles")
public class Mobile {

    @Id
    @Column(length = 255)
    private String token;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @UpdateTimestamp
    @Column(name = "last_used_at", nullable = false)
    private OffsetDateTime lastUsedAt;


    @Builder
    public Mobile(String token, User user) {
        this.token = token;
        this.user = user;
    }
}
