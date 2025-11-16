package com.lumiscape.smartwindow.music.repository;

import com.lumiscape.smartwindow.music.domain.Music;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MusicRepository extends JpaRepository<Music, Long> {

    List<Music> findAllByUserIsNull();

    List<Music> findAllByUser_Id(Long userId);

    List<Music> findAllByUser_IdOrUserIsNull(Long userId);

    Optional<Music> findByIdAndUser_IdOrUserIsNull(Long musicId, Long userId);

    boolean existsByMusicUrl(String musicUrl);

    Optional<Music> findByIdAndUser_Id(Long musicId, Long userId);
}
