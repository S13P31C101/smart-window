package com.lumiscape.smartwindow.music.service;

import com.lumiscape.smartwindow.device.service.DeviceService;
import com.lumiscape.smartwindow.global.exception.CustomException;
import com.lumiscape.smartwindow.global.exception.ErrorCode;
import com.lumiscape.smartwindow.global.infra.MqttPublishService;
import com.lumiscape.smartwindow.music.domain.Music;
import com.lumiscape.smartwindow.music.dto.AIMusicCallbackRequest;
import com.lumiscape.smartwindow.music.dto.MusicRegisterRequest;
import com.lumiscape.smartwindow.music.dto.MusicResponse;
import com.lumiscape.smartwindow.music.dto.MusicUpdateRequest;
import com.lumiscape.smartwindow.music.repository.MusicRepository;
import com.lumiscape.smartwindow.user.domain.entity.User;
import com.lumiscape.smartwindow.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MusicService {

    private final MusicRepository musicRepository;
    private final UserService userService;

    private final @Lazy DeviceService deviceService;

    // TODO improve music part
    private final MqttPublishService mqttPublishService;

    public List<MusicResponse> getMusicList(Long userId, String type) {
        List<Music> musics;

        if ("SYSTEM".equalsIgnoreCase(type)) {
            musics = musicRepository.findAllByUserIsNull();
        } else if ("USER".equalsIgnoreCase(type)) {
            musics = musicRepository.findAllByUser_Id(userId);
        } else {
            musics = musicRepository.findAllByUser_IdOrUserIsNull(userId);
        }

        return musics.stream()
                .map(MusicResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public MusicResponse registerMusic(Long userId, MusicRegisterRequest request) {
        User userReference = userService.getUserReference(userId);

        Music music = Music.builder()
                .user(userReference)
                .musicName(request.musicName())
                .musicUrl(request.musicUrl())
                .registrantType(request.registrantType())
                .build();

        Music savedMusic = musicRepository.save(music);

        return MusicResponse.from(savedMusic);
    }

    @Transactional
    public MusicResponse updateMusic(Long userId, Long musicId, MusicUpdateRequest request) {
        Music music = findMyMusic(musicId, userId);

        music.update(request.musicName(), request.musicUrl());

        return MusicResponse.from(music);
    }

    @Transactional
    public void deleteMusic(Long userId, Long musicId) {
        Music music = findMyMusic(musicId, userId);

        musicRepository.delete(music);
    }

    @Transactional
    public void handleAICallback(AIMusicCallbackRequest request) {
        // TODO improve music part
        Long deviceId = Long.parseLong(request.deviceId());
        String deviceUniqueId = deviceService.findById(deviceId);

        mqttPublishService.publishCommand(deviceUniqueId, "music", Map.of("musicUrl", request.musicUrl()));
    }

    public Music findMusicByUser(Long musicId, Long userId) {
        return musicRepository.findByIdAndUser_IdOrUserIsNull(musicId, userId)
                .orElseThrow(() -> new CustomException(ErrorCode.MUSIC_NOT_FOUND));
    }

    private Music findMyMusic(Long musicId, Long userId) {
        return musicRepository.findByIdAndUser_Id(musicId, userId)
                .orElseThrow(() -> new CustomException(ErrorCode.MUSIC_NOT_FOUND));
    }
}
