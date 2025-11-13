package com.lumiscape.smartwindow.media.controller;

import com.lumiscape.smartwindow.global.common.ApiResponse;
import com.lumiscape.smartwindow.global.exception.CustomException;
import com.lumiscape.smartwindow.global.exception.ErrorCode;
import com.lumiscape.smartwindow.media.dto.*;
import com.lumiscape.smartwindow.media.service.MediaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/media")
@RequiredArgsConstructor
public class MediaController {

    private final MediaService mediaService;

    @GetMapping
    public ApiResponse<List<MediaResponse>> getMyMedia(@AuthenticationPrincipal Long userId) {
        List<MediaResponse> responses = mediaService.getMyMedia(userId);

        return ApiResponse.onSuccess(responses);
    }

    @PostMapping("/upload-url")
    public ApiResponse<MediaUploadResponse> getUploadUrl(@AuthenticationPrincipal Long userId,
                                                         @RequestBody MediaUploadRequest request) {
        MediaUploadResponse response = mediaService.getUploadUrl(userId, request);

        return ApiResponse.onSuccess(response);
    }

    @PostMapping("/upload")
    public ApiResponse<MediaResponse> registerMedia(@AuthenticationPrincipal Long userId,
                                                    @RequestBody MediaRegisterRequest request) {
        MediaResponse response = mediaService.registerMedia(userId, request);

        return ApiResponse.onSuccess(response);
    }

    @GetMapping("/{media-id}")
    public ApiResponse<MediaResponse> getMediaDetail(@AuthenticationPrincipal Long userId,
                                                      @PathVariable("media-id") Long mediaId) {
        MediaResponse response = mediaService.getMediaDetail(userId, mediaId);

        return ApiResponse.onSuccess(response);
    }

    @PutMapping("/{media-id}/name")
    public ApiResponse<MediaResponse> updateMediaName(@AuthenticationPrincipal Long userId,
                                                       @PathVariable("media-id") Long mediaId,
                                                       @RequestBody Map<String, String> request) {
        String newName = request.get("fileName");

        if (newName == null || newName.isBlank()) {
            throw new CustomException(ErrorCode.INVALID_INPUT_VALUE);
        }

        MediaResponse response = mediaService.updateMediaName(userId, mediaId, newName);

        return ApiResponse.onSuccess(response);
    }

    @DeleteMapping("/{media-id}")
    public ApiResponse<?> deleteMedia(@AuthenticationPrincipal Long userId,
                                       @PathVariable("media-id") Long mediaId) {
        mediaService.deleteMedia(userId, mediaId);

        return ApiResponse.onSuccess();
    }

    @PostMapping("/ai-upload-url")
    public ApiResponse<MediaUploadResponse> getAIUploadUrl(@RequestBody AIUploadUrlRequest request) {
        MediaUploadResponse response = mediaService.getAIUploadUrl(request);

        return ApiResponse.onSuccess(response);
    }

    @PostMapping("/ai-callback")
    public ApiResponse<?> handelCallback(@RequestBody AICallbackRequest request) {
        mediaService.handleAICallback(request);

        return ApiResponse.onSuccess(HttpStatus.CREATED, null);
    }
}
