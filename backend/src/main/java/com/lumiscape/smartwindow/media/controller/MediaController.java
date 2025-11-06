package com.lumiscape.smartwindow.media.controller;

import com.lumiscape.smartwindow.global.common.ApiResponse;
import com.lumiscape.smartwindow.global.exception.CustomException;
import com.lumiscape.smartwindow.global.exception.ErrorCode;
import com.lumiscape.smartwindow.media.dto.*;
import com.lumiscape.smartwindow.media.service.MediaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/media")
@RequiredArgsConstructor
public class MediaController {

    private final MediaService mediaService;

    @GetMapping
    public ApiResponse<List<MediaResponse>> getMyMedia( Long userId) {
        userId = 1L;
        List<MediaResponse> responses = mediaService.getMyMedia(userId);

        return ApiResponse.onSuccess(responses);
    }

    @GetMapping("/upload")
    public ApiResponse<MediaUploadResponse> getUploadUrl(Long userId,
                                                         @RequestBody MediaUploadRequest request) {
        userId = 1L;
        MediaUploadResponse response = mediaService.getUploadUrl(userId, request);

        return ApiResponse.onSuccess(response);
    }

    @PostMapping("/upload")
    public ApiResponse<MediaResponse> registerMedia(Long userId,
                                                    @RequestBody MediaRegisterRequest request) {
        userId = 1L;
        MediaResponse response = mediaService.registerMedia(userId, request);

        return ApiResponse.onSuccess(response);
    }

    @GetMapping("/{media-id}")
    public ApiResponse<MediaResponse> getMediaDetail( Long userId,
                                                      @PathVariable("media-id") Long mediaId) {
        userId = 1L;
        MediaResponse response = mediaService.getMediaDetail(userId, mediaId);

        return ApiResponse.onSuccess(response);
    }

    @PutMapping("/{media-id}/name")
    public ApiResponse<MediaResponse> updateMediaName( Long userId,
                                                       @PathVariable("media-id") Long mediaId,
                                                       @RequestBody Map<String, String> request) {
        userId = 1L;
        String newName = request.get("fileName");

        if (newName == null || newName.isBlank()) {
            throw new CustomException(ErrorCode.INVALID_INPUT_VALUE);
        }

        MediaResponse response = mediaService.updateMediaName(userId, mediaId, newName);

        return ApiResponse.onSuccess(response);
    }

    @DeleteMapping("/{media-id}")
    public ApiResponse<?> deleteMedia( Long userId,
                                       @PathVariable("media-id") Long mediaId) {
        userId = 1L;
        mediaService.deleteMedia(userId, mediaId);

        return ApiResponse.onSuccess();
    }

    @PostMapping("/ai-callback")
    public ApiResponse<?> handelCallback(@RequestHeader("X-AI-Token") String token,
                                         @RequestBody AICallbackRequest request) {
        mediaService.handleAICallback(token, request);

        return ApiResponse.onSuccess(HttpStatus.CREATED, null);
    }
}
