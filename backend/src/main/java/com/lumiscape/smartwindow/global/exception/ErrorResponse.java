package com.lumiscape.smartwindow.global.exception;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@JsonPropertyOrder({"status", "code", "message"})
public class ErrorResponse {

    private final int status;
    private final String code;
    private final String message;

    private ErrorResponse(ErrorCode errorCode) {
        this.status = errorCode.getStatus().value();
        this.code = errorCode.getCode();
        this.message = errorCode.getMessage();
    }

    private ErrorResponse(int status, String code, String message) {
        this.status = status;
        this.code = code;
        this.message = message;
    }

    public static ErrorResponse of(ErrorCode errorCode) {
        return new ErrorResponse(errorCode);
    }

    public static ErrorResponse of(HttpStatus status, String message) {
        return new ErrorResponse(
                status.value(),
                String.valueOf(status.value()),
                message
        );
    }
}