package com.lumiscape.smartwindow.media.service;

import com.lumiscape.smartwindow.global.exception.CustomException;
import com.lumiscape.smartwindow.global.exception.ErrorCode;
import com.lumiscape.smartwindow.global.infra.S3Service;
import com.lumiscape.smartwindow.fcm.service.FcmNotificationService;
import com.lumiscape.smartwindow.global.util.FileNameUtils;
import com.lumiscape.smartwindow.media.domain.Media;
import com.lumiscape.smartwindow.media.domain.MediaOrigin;
import com.lumiscape.smartwindow.media.dto.*;
import com.lumiscape.smartwindow.media.event.MediaDeletedEvent;
import com.lumiscape.smartwindow.media.event.MediaUploadEvent;
import com.lumiscape.smartwindow.media.repository.MediaRepository;
import com.lumiscape.smartwindow.user.domain.entity.User;

import com.lumiscape.smartwindow.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MediaService {

    private final MediaRepository mediaRepository;
    private final UserService userService;
    private final S3Service s3Service;
    private final FcmNotificationService fcmNotificationService;
    private final AIService aiService;

    private final ApplicationEventPublisher eventPublisher;

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
        String s3ObjectKey = createS3ObjectKey(request.fileName());
        String uploadUrl = s3Service.generatePresignedUrlForUpload(s3ObjectKey);

        return new MediaUploadResponse(s3ObjectKey, uploadUrl);
    }

    public MediaUploadResponse getAIUploadUrl(AIUploadUrlRequest request) {
        String s3ObjectKey = request.s3ObjectKey();
        String uploadUrl = s3Service.generatePresignedUrlForUpload(s3ObjectKey);

        return new MediaUploadResponse(s3ObjectKey, uploadUrl);
    }

    @Transactional
    public MediaResponse registerMedia(Long userId, MediaRegisterRequest request) {
        if (mediaRepository.existsByFileUrl(request.s3ObjectKey())) {
            log.warn("이미 존재하는 파일입니다..{}", request.s3ObjectKey());

            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
        }

        User userReference = userService.getUserReference(userId);

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

        // TODO remove deviceId
        aiService.requestAIGeneration(savedMedia, request.deviceId());

        eventPublisher.publishEvent(new MediaUploadEvent(
                userId,
                request.deviceId(),
                savedMedia.getId()
        ));

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

        eventPublisher.publishEvent(new MediaDeletedEvent(userId, mediaId));

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
    public void handleAICallback(AICallbackRequest request) {
        Media parentMedia = mediaRepository.findById(request.parentMediaId())
                .orElseThrow(() -> new CustomException(ErrorCode.IMAGE_NOT_FOUND));

        String type = FileNameUtils.extractAITypeFromKey(request.s3ObjectKey());
        if (type == null || type.isEmpty()) {
            log.error("[ AI ] 지원하지 않는 AI 생성 타입입니다. Type: {}", request.s3ObjectKey());
            return;
        }

        MediaOrigin originType;
        try {
            originType = MediaOrigin.valueOf("AI_" + type);
        } catch (IllegalArgumentException e) {
            log.error("[ AI ] 지원하지 않는 AI 생성 타입입니다. Type: {}", type);
            return;
        }

        String aiFileName = FileNameUtils.addSuffixBeforeExtension(parentMedia.getFileName(), "(" + type + ")");

        Media aiMedia = Media.builder()
                .user(parentMedia.getUser())
                .fileName(aiFileName)
                .fileUrl(request.s3ObjectKey())
                .fileType(request.fileType())
                .fileSize(request.fileSize())
                .resolution(request.resolution())
                .originType(originType)
                .parentMedia(parentMedia)
                .build();

        mediaRepository.save(aiMedia);

        // TODO FCM Push
//        fcmNotificationService.sendNotificationToUser(parentMedia.getUser(), " New AI ", " " + parentMedia.getFileName() + " 의 " + type + " 감성을 살린 AI 이미지가 생성되었습니다.");
    }

    public Media findMediaByUser(Long mediaId, Long userId) {
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
