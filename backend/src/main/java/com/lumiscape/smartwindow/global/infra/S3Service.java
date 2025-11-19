package com.lumiscape.smartwindow.global.infra;

import com.lumiscape.smartwindow.global.exception.CustomException;
import com.lumiscape.smartwindow.global.exception.ErrorCode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import software.amazon.awssdk.services.s3.S3Client;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.net.URL;
import java.time.Duration;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class S3Service {

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;

    @Value("${cloud.aws.s3.bucket}")
    private String bucket;

    private static final Duration MEDIA_URL_EXPIRATION = Duration.ofMinutes(30);

    public String generatePresignedUrlForUpload(String s3ObjectKey) {
        try {
            PutObjectRequest objectRequest = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(s3ObjectKey)
                    .build();

            PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                    .signatureDuration(MEDIA_URL_EXPIRATION)
                    .putObjectRequest(objectRequest)
                    .build();

            PresignedPutObjectRequest presignedPutObjectRequest = s3Presigner.presignPutObject(presignRequest);

            URL url = presignedPutObjectRequest.url();

            log.info("S3 업로드용 URL 생성 완료 : {} - {}", s3ObjectKey, url);

            return url.toString();
        } catch (Exception e) {
            log.error("S3 업로드용 URL 생성 실패 : {}", e.getMessage(), e);

            throw new CustomException(ErrorCode.MEDIA_UPLOAD_FAILED);
        }
    }

    public String generatePresignedUrlForDownload(String s3ObjectKey) {
        if (s3ObjectKey == null || s3ObjectKey.isBlank()) {
            return null;
        }

        try {
            GetObjectRequest objectRequest = GetObjectRequest.builder()
                    .bucket(bucket)
                    .key(s3ObjectKey)
                    .build();

            GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                    .signatureDuration(MEDIA_URL_EXPIRATION)
                    .getObjectRequest(objectRequest)
                    .build();

            PresignedGetObjectRequest presignedGetObjectRequest = s3Presigner.presignGetObject(presignRequest);

            URL url = presignedGetObjectRequest.url();

            log.info("S3 다운로드용 URL 생성 완료 : {} - {}",  s3ObjectKey, url);

            return url.toString();
        } catch (Exception e) {
            log.error("S3 다운로드용 URL 생성 실패 : {}", e.getMessage(), e);

            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }

    public void deleteObject(String s3ObjectKey) {
        if (s3ObjectKey == null || s3ObjectKey.isBlank()) {
            return;
        }

        try {
            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(bucket)
                    .key(s3ObjectKey)
                    .build();

            s3Client.deleteObject(deleteObjectRequest);

            log.info("S3 파일 삭제 완료 : {}", s3ObjectKey);
        } catch (Exception e) {
            log.error("S3 파일 삭제 실패 : {}", s3ObjectKey, e);
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
