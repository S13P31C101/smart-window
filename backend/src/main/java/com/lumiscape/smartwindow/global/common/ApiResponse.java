package com.lumiscape.smartwindow.global.common;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@JsonPropertyOrder({"status", "data"})
public class ApiResponse<T> {

    private final int status;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private final T data;

    private ApiResponse(int status, T data) {
        this.status = status;
        this.data = data;
    }

    public static <T> ApiResponse<T> onSuccess(T data) {
        return new ApiResponse<>(HttpStatus.OK.value(), data);
    }

    public static <T> ApiResponse<T> onSuccess(HttpStatus status, T data) {
        return new ApiResponse<>(status.value(), data);
    }

    public static <T> ApiResponse<T> onSuccess() {
        return new ApiResponse<>(HttpStatus.OK.value(), null);
    }
}
