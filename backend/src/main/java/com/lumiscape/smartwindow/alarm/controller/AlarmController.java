package com.lumiscape.smartwindow.alarm.controller;

import com.lumiscape.smartwindow.alarm.dto.AlarmCreateRequest;
import com.lumiscape.smartwindow.alarm.dto.AlarmResponse;
import com.lumiscape.smartwindow.alarm.dto.AlarmUpdateRequest;
import com.lumiscape.smartwindow.alarm.service.AlarmService;
import com.lumiscape.smartwindow.global.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/alarms")
@RequiredArgsConstructor
public class AlarmController {

    private final AlarmService alarmService;

    @GetMapping
    public ApiResponse<List<AlarmResponse>> getAllUserAlarms(@AuthenticationPrincipal Long userId) {
        List<AlarmResponse> responses = alarmService.getAllUserAlarms(userId);

        return ApiResponse.onSuccess(responses);
    }

    @PostMapping
    public ApiResponse<AlarmResponse> createAlarm(@AuthenticationPrincipal Long userId,
                                                  @RequestBody AlarmCreateRequest request) {
        AlarmResponse newAlarm = alarmService.createAlarm(userId, request);

        return ApiResponse.onSuccess(HttpStatus.CREATED, newAlarm);
    }

    @GetMapping("/{alarm-id}")
    public ApiResponse<AlarmResponse> getAlarmById(@AuthenticationPrincipal Long userId,
                                                   @PathVariable("alarm-id") Long alarmId) {
        AlarmResponse response = alarmService.getAlarmById(userId, alarmId);

        return ApiResponse.onSuccess(response);
    }

    @PatchMapping("/{alarm-id}")
    public ApiResponse<AlarmResponse> updateAlarm(@AuthenticationPrincipal Long userId,
                                                  @PathVariable("alarm-id") Long alarmId,
                                                  @RequestBody AlarmUpdateRequest request) {
        AlarmResponse response = alarmService.updateAlarm(userId, alarmId, request);

        return ApiResponse.onSuccess(response);
    }

    @DeleteMapping("/{alarm-id}")
    public ApiResponse<?> deleteAlarm(@AuthenticationPrincipal Long userId,
                                      @PathVariable("alarm-id") Long alarmId) {
        alarmService.deleteAlarm(userId, alarmId);

        return ApiResponse.onSuccess();
    }
}
