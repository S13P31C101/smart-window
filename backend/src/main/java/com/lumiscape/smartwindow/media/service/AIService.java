package com.lumiscape.smartwindow.media.service;

import com.lumiscape.smartwindow.global.infra.S3Service;
import com.lumiscape.smartwindow.global.util.FileNameUtils;
import com.lumiscape.smartwindow.media.domain.Media;
import com.lumiscape.smartwindow.media.dto.AIRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Slf4j
@Service
@RequiredArgsConstructor
public class AIService {

    private final WebClient aiWebClient;
    private final S3Service s3Service;

    @Value("${app.ai.server-url}")
    private String aiServerUrl;

    @Async("taskExecutor")
    public void requestAIGeneration(Media originMedia) {
        String presignedDownloadUrl = s3Service.generatePresignedUrlForDownload(originMedia.getFileUrl());
        String targetAiS3Key = FileNameUtils.addSuffixBeforeExtension(originMedia.getFileUrl(), "_AI");

        AIRequest aiRequest = new AIRequest(originMedia.getId(), presignedDownloadUrl, targetAiS3Key);

        try {
            log.info("[ AI ] 서버에 이미지 생성을 요청합니다. Media ID: {}", originMedia.getId());

            aiWebClient.post()
                    .uri(aiServerUrl + "/api/v1/ai/remove-person")
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .bodyValue(aiRequest)
                    .retrieve()
                    .bodyToMono(String.class)
                    .subscribe(
                            response -> log.info("[ AI ] 서버에 성공적으로 요청했습니다. Media ID: {}", originMedia.getId()),
                            error -> log.error("[ AI ] 서버 요청 실패. Media ID: {}", originMedia.getId(), error)
                    );

        } catch (Exception e) {
            log.error("[ AI ] 서버 요청 실패. Media ID: {}", originMedia.getId(), e);
        }
    }
}
