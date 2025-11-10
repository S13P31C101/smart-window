package com.lumiscape.smartwindow.alarm.controller;

import com.lumiscape.smartwindow.alarm.dto.AlarmCreateRequest;
import com.lumiscape.smartwindow.alarm.dto.AlarmResponse;
import com.lumiscape.smartwindow.alarm.dto.AlarmUpdateRequest;
import com.lumiscape.smartwindow.alarm.service.AlarmService;
import com.lumiscape.smartwindow.global.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class AlarmController {

    private final AlarmService alarmService;

    @GetMapping("/alarms")
    public ApiResponse<List<AlarmResponse>> getAllUserAlarms( Long userId) {
        List<AlarmResponse> responses = alarmService.getAllUserAlarms(userId);

        return ApiResponse.onSuccess(responses);
    }

    @PostMapping("/alarms")
    public ApiResponse<AlarmResponse> createAlarm(Long userId, @RequestBody AlarmCreateRequest request) {
        AlarmResponse newAlarm = alarmService.createAlarm(userId, request);

        return ApiResponse.onSuccess(HttpStatus.CREATED, newAlarm);
    }

    @GetMapping("/alarms/{alarm-id}")
    public ApiResponse<AlarmResponse> getAlarmById( Long userId, @PathVariable("alarm-id") Long alarmId) {
        AlarmResponse response = alarmService.getAlarmById(userId, alarmId);

        return ApiResponse.onSuccess(response);
    }

    @PatchMapping("/alarms/{alarm-id}")
    public ApiResponse<AlarmResponse> updateAlarm(Long userId, @PathVariable("alarm-id") Long alarmId, @RequestBody AlarmUpdateRequest request) {
        AlarmResponse response = alarmService.updateAlarm(userId, alarmId, request);

        return ApiResponse.onSuccess(response);
    }

    @DeleteMapping("/alarms/{alarm-id}")
    public ApiResponse<?> deleteAlarm( Long userId, @PathVariable("alarm-id") Long alarmId) {
        alarmService.deleteAlarm(userId, alarmId);

        return ApiResponse.onSuccess();
    }

    @GetMapping("/devices/{device-id}/alarms")
    public ApiResponse<List<AlarmResponse>> getAlarmsByDevice( Long userId, @PathVariable("device-id") Long deviceId) {
        List<AlarmResponse> responses = alarmService.getAlarmsByDevice(userId, deviceId);

        return ApiResponse.onSuccess(responses);
    }
}
