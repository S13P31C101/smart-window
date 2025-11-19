package com.lumiscape.smartwindow.media.service;

import com.lumiscape.smartwindow.global.infra.S3Service;
import com.lumiscape.smartwindow.global.util.FileNameUtils;
import com.lumiscape.smartwindow.media.domain.Media;
import com.lumiscape.smartwindow.media.domain.MediaOrigin;
import com.lumiscape.smartwindow.media.dto.AIRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AIService {

    private final WebClient aiWebClient;
    private final S3Service s3Service;

    @Value("${app.ai.server-url}")
    private String aiServerUrl;

    @Async("taskExecutor")
    public void requestAIGeneration(Media originMedia, Long deviceId) {
        String presignedDownloadUrl = s3Service.generatePresignedUrlForDownload(originMedia.getFileUrl());

        // TODO improve music part
        callAiServer(originMedia.getId(), "/api/v1/ai/recommend-music",
                new AIRequest(originMedia.getId(), presignedDownloadUrl, deviceId.toString(), "MUSIC"));

        List<MediaOrigin> aiTypesToGenerate = List.of(
                MediaOrigin.AI_RP,
                MediaOrigin.AI_SUNSET,
                MediaOrigin.AI_DAWN,
                MediaOrigin.AI_AFTERNOON,
                MediaOrigin.AI_NIGHT
        );

        aiTypesToGenerate.forEach(aiType -> {
            String suffix = "_AI_" + aiType.name().replace("AI_", "");
            String targetAiS3Key = FileNameUtils.addSuffixBeforeExtension(originMedia.getFileUrl(), suffix);
            String endpoint;
            AIRequest aiRequest;

            switch (aiType) {
                case AI_RP:
                    endpoint = "/api/v1/ai/remove-person";
                    aiRequest = new AIRequest(originMedia.getId(), presignedDownloadUrl, targetAiS3Key, null);
                    break;

                case AI_SUNSET:
                case AI_DAWN:
                case AI_AFTERNOON:
                case AI_NIGHT:
                    endpoint = "/api/v1/ai/scene-blend";
                    String sceneType = aiType.name().replace("AI_", "").toLowerCase();
                    aiRequest = new AIRequest(originMedia.getId(), presignedDownloadUrl, targetAiS3Key, sceneType);
                    break;

                default:
                    log.warn("[ AI ] 지원하지 않는 AI 생성 타입입니다. Type: {}", aiType);
                    return;
            }

            callAiServer(originMedia.getId(), endpoint, aiRequest);
        });
    }

    private void callAiServer(Long mediaId, String endpoint, AIRequest aiRequest) {
        try {
            log.info("[ AI ] 서버에 이미지 생성을 요청합니다. Media ID: {}, Type: {}", mediaId, aiRequest.sceneType());

            aiWebClient.post()
                    .uri(aiServerUrl + endpoint)
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .bodyValue(aiRequest)
                    .retrieve()
                    .bodyToMono(String.class)
                    .subscribe(
                            response -> log.info("[ AI ] 서버에 성공적으로 요청했습니다. Media ID: {}, Type: {}", mediaId, aiRequest.sceneType()),
                            error -> log.error("[ AI ] 서버 요청 실패. Media ID: {}, Type: {}", mediaId, aiRequest.sceneType(), error)
                    );

        } catch (Exception e) {
            log.error("[ AI ] 서버 요청 실패. Media ID: {}, Type: {}", mediaId, aiRequest.sceneType(), e);
        }
    }
}