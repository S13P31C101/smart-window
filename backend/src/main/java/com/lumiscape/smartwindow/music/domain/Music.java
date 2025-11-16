package com.lumiscape.smartwindow.music.domain;

import com.lumiscape.smartwindow.user.domain.entity.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "musics")
public class Music {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "music_name", nullable = false)
    private String musicName;

    @Column(name = "music_url", nullable = false, length = 500)
    private String musicUrl;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Builder
    public Music(User user, String musicName, String musicUrl) {
        this.user = user;
        this.musicName = musicName;
        this.musicUrl = musicUrl;
    }

    public void update(String musicName, String musicUrl) {
        this.musicName = musicName;
        this.musicUrl = musicUrl;
    }
}
