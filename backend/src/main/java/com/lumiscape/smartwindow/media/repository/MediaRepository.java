package com.lumiscape.smartwindow.media.repository;

import com.lumiscape.smartwindow.media.domain.Media;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MediaRepository extends JpaRepository<Media, Long> {

    List<Media> findAllByUserId(Long userId);

    Optional<Media> findByIdAndUserId(Long mediaId, Long userId);

    boolean existsByFileUrl(String s3ObjectKey);

    List<Media> findAllByParentMediaId(Long parentMediaId);
}
