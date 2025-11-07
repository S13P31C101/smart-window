package com.lumiscape.smartwindow.media.service;

import com.lumiscape.smartwindow.device.domain.Device;
import com.lumiscape.smartwindow.device.repository.DeviceRepository;
import com.lumiscape.smartwindow.device.service.DeviceService;
import com.lumiscape.smartwindow.global.exception.CustomException;
import com.lumiscape.smartwindow.global.exception.ErrorCode;
import com.lumiscape.smartwindow.global.infra.S3Service;
import com.lumiscape.smartwindow.media.domain.Media;
import com.lumiscape.smartwindow.media.domain.MediaOrigin;
import com.lumiscape.smartwindow.media.dto.*;
import com.lumiscape.smartwindow.media.repository.MediaRepository;
import com.lumiscape.smartwindow.user.domain.User;
import com.lumiscape.smartwindow.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MediaService {

    private final MediaRepository mediaRepository;
    private final DeviceRepository deviceRepository;
    private final UserRepository userRepository;
    private final S3Service s3Service;
    private final @Lazy DeviceService deviceService;
    private final RestTemplate restTemplate;

    @Value("${app.ai.secret}")
    private String aiCallbackSecret;

    @Value("${app.ai.server-url}")
    private String aiServerUrl;

    public List<MediaResponse> getMyMedia(Long userId) {
        List<Media> mediaList = mediaRepository.findAllByUserId(userId);

        return mediaList.stream()
                .map(this::mapToMediaResponse)
                .collect(Collectors.toList());
    }

    public MediaUploadResponse getUploadUrl(Long userId, MediaUploadRequest request) {
        userId = 1L;
        String s3ObjectKey = createS3ObjectKey(request.fileName());
        String uploadUrl = s3Service.generatePresignedUrlForUpload(s3ObjectKey);

        return new MediaUploadResponse(s3ObjectKey, uploadUrl);
    }

    public MediaUploadResponse getAIUploadUrl(String token, AIUploadUrlRequest request) {
        verifyAIToken(token);
        String s3ObjectKey = request.s3ObjectKey();
        String uploadUrl = s3Service.generatePresignedUrlForUpload(s3ObjectKey);
        return new MediaUploadResponse(s3ObjectKey, uploadUrl);
    }

    @Transactional
    public MediaResponse registerMedia(Long userId, MediaRegisterRequest request) {
        userId = 1L;
        if (mediaRepository.existsByFileUrl(request.s3ObjectKey())) {
            log.warn("이미 존재하는 파일입니다..{}", request.s3ObjectKey());

            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
        }

        User userReference = userRepository.getReferenceById(userId);

        Media media = Media.builder()
                .user(userReference)
                .fileName(request.fileName())
                .fileUrl(request.s3ObjectKey())
                .fileType(request.fileType())
                .fileSize(request.fileSize())
                .resolution(request.resolution())
                .originType(MediaOrigin.ORIGINAL)
                .build();

        Media savedMedia = mediaRepository.save(media);

        requestAIGeneration(savedMedia);

        return mapToMediaResponse(savedMedia);
    }

    public MediaResponse getMediaDetail(Long userId, Long mediaId) {
        Media media = findMediaByUser(mediaId, userId);

        return mapToMediaResponse(media);
    }

    @Transactional
    public MediaResponse updateMediaName(Long userId, Long mediaId, String newName) {
        Media media = findMediaByUser(mediaId, userId);

        media.updateName(newName);

        return mapToMediaResponse(media);
    }

    @Transactional
    public void deleteMedia(Long userId, Long mediaId) {
        Media mediaToDelete = findMediaByUser(mediaId, userId);

        List<Device> affectedDevices = deviceRepository.findAllByMedia(mediaToDelete);

        Media replacementMedia = (mediaToDelete.getOriginType() == MediaOrigin.AI_GENERATED && mediaToDelete.getParentMedia() != null)
                ? mediaToDelete.getParentMedia() : null;

        for (Device device : affectedDevices) {
            device.updateMedia(replacementMedia);

            deviceService.publishMediaUpdateToDevice(device);
        }

        if (mediaToDelete.getOriginType() == MediaOrigin.ORIGINAL) {
            List<Media> childrenMedia = mediaRepository.findAllByParentMediaId(mediaId);

            for (Media child : childrenMedia) {
                mediaRepository.delete(child);
                s3Service.deleteObject(child.getFileUrl());
            }
        }

        mediaRepository.delete(mediaToDelete);
        s3Service.deleteObject(mediaToDelete.getFileUrl());
    }

    @Transactional
    public void handleAICallback(String token, AICallbackRequest request) {
        verifyAIToken(token);

        Media parentMedia = mediaRepository.findById(request.parentMediaId())
                .orElseThrow(() -> new CustomException(ErrorCode.IMAGE_NOT_FOUND));

        String aiFileName = addSuffixBeforeExtension(parentMedia.getFileName(), "(AI)");

        Media aiMedia = Media.builder()
                .user(parentMedia.getUser())
                .fileName(aiFileName)
                .fileUrl(request.s3ObjectKey())
                .fileType(request.fileType())
                .fileSize(request.fileSize())
                .resolution(request.resolution())
                .originType(MediaOrigin.AI_GENERATED)
                .parentMedia(parentMedia)
                .build();

        mediaRepository.save(aiMedia);

        // TODO FCM Push
    }

    @Async("taskExecutor")
    public void requestAIGeneration(Media originMedia) {
        String presignedDownloadUrl = s3Service.generatePresignedUrlForDownload(originMedia.getFileUrl());
        String targetAiS3Key = addSuffixBeforeExtension(originMedia.getFileUrl(), "_AI");

        AIRequest aiRequest = new AIRequest(originMedia.getId(), presignedDownloadUrl, targetAiS3Key);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<AIRequest> requestEntity = new HttpEntity<>(aiRequest, headers);

        try {
            log.info("AI 서버에 이미지 생성을 요청합니다. Media ID: {}", originMedia.getId());
            restTemplate.postForEntity(aiServerUrl + "/api/ai/images", requestEntity, String.class);
            log.info("AI 서버에 성공적으로 요청했습니다. Media ID: {}", originMedia.getId());
        } catch (Exception e) {
            log.error("AI 서버 요청 실패. Media ID: {}", originMedia.getId(), e);
        }
    }

    private void verifyAIToken(String token) {
        if (aiCallbackSecret == null || aiCallbackSecret.isBlank() || !aiCallbackSecret.equals(token)) {
            log.warn("AI TOKEN 불일치 : {}", token);
            throw new CustomException(ErrorCode.ACCESS_DENIED);
        }
    }

    private String addSuffixBeforeExtension(String fileName, String suffix) {
        int dotIndex = fileName.lastIndexOf('.');
        if (dotIndex == -1) {
            return fileName + suffix;
        } else {
            String name = fileName.substring(0, dotIndex);
            String extension = fileName.substring(dotIndex);
            return name + suffix + extension;
        }
    }

    private Media findMediaByUser(Long mediaId, Long userId) {
        return mediaRepository.findByIdAndUserId(mediaId, userId)
                .orElseThrow(() -> new CustomException(ErrorCode.IMAGE_NOT_FOUND));
    }

    private MediaResponse mapToMediaResponse(Media media) {
        String downloadUrl = s3Service.generatePresignedUrlForDownload(media.getFileUrl());

        return MediaResponse.from(media, downloadUrl);
    }

    private String createS3ObjectKey(String originalFileName) {
        String uuid = UUID.randomUUID().toString();

        return String.format("media/%s_%s", uuid, originalFileName.replaceAll("\\s", "_"));
    }
}
