package com.lumiscape.smartwindow.media.domain;

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

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "media")
public class Media {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "file_url", nullable = false)
    private String fileUrl;

    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "file_type", nullable = false, columnDefinition = "media_type_enum")
    private MediaType fileType;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(length = 50)
    private String resolution;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "origin_type", nullable = false, columnDefinition = "media_origin_enum")
    private MediaOrigin originType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_media_id")
    private Media parentMedia;

    @OneToMany(mappedBy = "parentMedia", cascade = CascadeType.ALL)
    private List<Media> generatedChildren = new ArrayList<>();


    @Builder
    public Media(User user, String fileName, String fileUrl, MediaType fileType, Long fileSize,
                 String resolution, MediaOrigin originType, Media parentMedia) {
        this.user = user;
        this.fileName = fileName;
        this.fileUrl = fileUrl;
        this.fileType = fileType;
        this.fileSize = fileSize;
        this.resolution = resolution;
        this.originType = originType;
        this.parentMedia = parentMedia;
    }


    public void updateName(String fileName) {
        this.fileName = fileName;
    }
}
