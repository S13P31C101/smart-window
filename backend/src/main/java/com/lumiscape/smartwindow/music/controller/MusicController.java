package com.lumiscape.smartwindow.music.controller;

import com.lumiscape.smartwindow.global.common.ApiResponse;
import com.lumiscape.smartwindow.music.dto.MusicRegisterRequest;
import com.lumiscape.smartwindow.music.dto.MusicResponse;
import com.lumiscape.smartwindow.music.dto.MusicUpdateRequest;
import com.lumiscape.smartwindow.music.service.MusicService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/musics")
@RequiredArgsConstructor
public class MusicController {

    private final MusicService musicService;

    @GetMapping
    public ApiResponse<List<MusicResponse>> getMusicList(@AuthenticationPrincipal Long userId,
                                                         @RequestParam(required = false) String type) {
        List<MusicResponse> responses = musicService.getMusicList(userId, type);

        return ApiResponse.onSuccess(responses);
    }

    @PostMapping
    public ApiResponse<MusicResponse> registerMusic(@AuthenticationPrincipal Long userId,
                                                    @RequestBody MusicRegisterRequest request) {
        MusicResponse response = musicService.registerMusic(userId, request);

        return ApiResponse.onSuccess(HttpStatus.CREATED, response);
    }

    @PutMapping("/{music-id}")
    public ApiResponse<MusicResponse> updateMusic(@AuthenticationPrincipal Long userId,
                                                  @PathVariable("music-id") Long musicId,
                                                  @RequestBody MusicUpdateRequest request) {
        MusicResponse response = musicService.updateMusic(userId, musicId, request);

        return ApiResponse.onSuccess(response);
    }

    @DeleteMapping("/{music-id}")
    public ApiResponse<?> deleteMusic(@AuthenticationPrincipal Long userId,
                                      @PathVariable("music-id") Long musicId) {
        musicService.deleteMusic(userId, musicId);

        return ApiResponse.onSuccess();
    }
}
