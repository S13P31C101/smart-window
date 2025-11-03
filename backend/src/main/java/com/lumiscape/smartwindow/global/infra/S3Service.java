package com.lumiscape.smartwindow.global.infra;

import com.lumiscape.smartwindow.global.exception.CustomException;
import com.lumiscape.smartwindow.global.exception.ErrorCode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import software.amazon.awssdk.services.s3.S3Client;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.net.URL;
import java.time.Duration;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class S3Service {

    private final S3Presigner s3Presigner;

    @Value("${cloud.aws.s3.bucket}")
    private String bucket;

    public String generatePresignedUrlForUpload(String originalFileName) {

        String s3FileName = createS3FileName(originalFileName);

        try {
            PutObjectRequest objectRequest = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(s3FileName)
                    .build();

            Duration expiration = Duration.ofMinutes(10);

            PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                    .signatureDuration(expiration)
                    .putObjectRequest(objectRequest)
                    .build();

            PresignedPutObjectRequest presignedPutObjectRequest = s3Presigner.presignPutObject(presignRequest);

            URL url = presignedPutObjectRequest.url();

            log.info("S3 업로드용 URL 생성 완료 : {} - {}", originalFileName, url);

            return url.toString();
        } catch (Exception e) {
            log.error("S3 업로드용 URL 생성 실패 : {}", e.getMessage(), e);

            throw new CustomException(ErrorCode.MEDIA_UPLOAD_FAILED);
        }
    }

    private String createS3FileName(String originalFileName) {

        String ext = extractExtension(originalFileName);
        String uuid = UUID.randomUUID().toString();

        return "media/" + uuid + "_" + originalFileName.replaceAll("\\s", "_");
    }

    private String extractExtension(String originalFileName) {

        try {
            return originalFileName.substring(originalFileName.lastIndexOf("."));
        } catch (StringIndexOutOfBoundsException e) {
            log.warn("파일 확장자 확인 실패 : {}", originalFileName);

            throw new CustomException(ErrorCode.INVALID_MEDIA_TYPE);
        }
    }
}
