package com.lumiscape.smartwindow.global.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // 400 Bad Request
    INVALID_INPUT_VALUE(HttpStatus.BAD_REQUEST, "E-400-01", "입력 값이 올바르지 않습니다."),
    INVALID_MEDIA_TYPE(HttpStatus.BAD_REQUEST, "E-400-02", "지원하지 않는 미디어 파일입니다."),

    // 401 Unauthorized
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "E-401-01", "해당 토큰은 유효하지 않은 토큰입니다."),
    EXPIRED_TOKEN(HttpStatus.UNAUTHORIZED, "E-401-02", "해당 토큰은 만료된 토큰입니다."),

    // 403 Forbidden
    ACCESS_DENIED(HttpStatus.FORBIDDEN, "E-403-01", "접근 권한이 없습니다."),
    FORBIDDEN_DEVICE_ACCESS(HttpStatus.FORBIDDEN, "E-403-02", "해당 디바이스에 대한 접근 권한이 없습니다."),

    // 404 Not Found
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "E-404-01", "사용자를 찾을 수 없습니다."),
    DEVICE_NOT_FOUND(HttpStatus.NOT_FOUND, "E-404-02", "디바이스를 찾을 수 없습니다."),
    IMAGE_NOT_FOUND(HttpStatus.NOT_FOUND, "E-404-03", "이미지를 찾을 수 없습니다."),
    MUSIC_NOT_FOUND(HttpStatus.NOT_FOUND, "E-404-04", "음악을 찾을 수 없습니다."),
    ALARM_NOT_FOUND(HttpStatus.NOT_FOUND, "E-404-05", "알람을 찾을 수 없습니다."),

    // 409 Conflict
    DEVICE_ALREADY_EXISTS(HttpStatus.CONFLICT, "E-409-01", "이미 등록된 디바이스입니다."),

    // 500 Internal Server Error
    MEDIA_UPLOAD_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "E-500-01", "미디어 업로드에 실패하였습니다."),
    MQTT_PUBLISH_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "E-500-02", "명령어 전송에 실패하였습니다."),
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "E-500-99", "서버 내부 오류가 발생했습니다.");

    private final HttpStatus status;
    private final String code;
    private final String message;
}
