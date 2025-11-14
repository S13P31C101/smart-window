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
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class AlarmController {

    private final AlarmService alarmService;

    @GetMapping("/alarms")
    public ApiResponse<List<AlarmResponse>> getAllUserAlarms(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = Long.parseLong(userDetails.getUsername());
        List<AlarmResponse> responses = alarmService.getAllUserAlarms(userId);

        return ApiResponse.onSuccess(responses);
    }

    @PostMapping("/alarms")
    public ApiResponse<AlarmResponse> createAlarm(@AuthenticationPrincipal UserDetails userDetails,
                                                  @RequestBody AlarmCreateRequest request) {
        Long userId = Long.parseLong(userDetails.getUsername());
        AlarmResponse newAlarm = alarmService.createAlarm(userId, request);

        return ApiResponse.onSuccess(HttpStatus.CREATED, newAlarm);
    }

    @GetMapping("/alarms/{alarm-id}")
    public ApiResponse<AlarmResponse> getAlarmById(@AuthenticationPrincipal UserDetails userDetails,
                                                   @PathVariable("alarm-id") Long alarmId) {
        Long userId = Long.parseLong(userDetails.getUsername());
        AlarmResponse response = alarmService.getAlarmById(userId, alarmId);

        return ApiResponse.onSuccess(response);
    }

    @PatchMapping("/alarms/{alarm-id}")
    public ApiResponse<AlarmResponse> updateAlarm(@AuthenticationPrincipal UserDetails userDetails,
                                                  @PathVariable("alarm-id") Long alarmId, @RequestBody AlarmUpdateRequest request) {
        Long userId = Long.parseLong(userDetails.getUsername());
        AlarmResponse response = alarmService.updateAlarm(userId, alarmId, request);

        return ApiResponse.onSuccess(response);
    }

    @DeleteMapping("/alarms/{alarm-id}")
    public ApiResponse<?> deleteAlarm(@AuthenticationPrincipal UserDetails userDetails,
                                      @PathVariable("alarm-id") Long alarmId) {
        Long userId = Long.parseLong(userDetails.getUsername());
        alarmService.deleteAlarm(userId, alarmId);

        return ApiResponse.onSuccess();
    }

    @GetMapping("/devices/{device-id}/alarms")
    public ApiResponse<List<AlarmResponse>> getAlarmsByDevice(@AuthenticationPrincipal UserDetails userDetails,
                                                              @PathVariable("device-id") Long deviceId) {
        Long userId = Long.parseLong(userDetails.getUsername());
        List<AlarmResponse> responses = alarmService.getAlarmsByDevice(userId, deviceId);

        return ApiResponse.onSuccess(responses);
    }
}
