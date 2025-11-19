package com.lumiscape.smartwindow.device.controller;

import com.lumiscape.smartwindow.alarm.dto.AlarmResponse;
import com.lumiscape.smartwindow.alarm.service.AlarmService;
import com.lumiscape.smartwindow.device.dto.*;
import com.lumiscape.smartwindow.device.service.DeviceService;
import com.lumiscape.smartwindow.global.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/devices")
@RequiredArgsConstructor
public class DeviceController {

    private final DeviceService deviceService;
    private final AlarmService alarmService;

    @GetMapping
    public ApiResponse<List<DeviceDetailResponse>> getMyDevices(@AuthenticationPrincipal Long userId) {
        List<DeviceDetailResponse> responses = deviceService.getMyDevice(userId);

        return ApiResponse.onSuccess(responses);
    }

    @PostMapping
    public ApiResponse<DeviceDetailResponse> registerDevice(@AuthenticationPrincipal Long userId,
                                                            @RequestBody DeviceRegisterRequest request) {
        DeviceDetailResponse newDevice = deviceService.registerDevice(userId, request);

        return ApiResponse.onSuccess(HttpStatus.CREATED, newDevice);
    }

    @GetMapping("/{device-id}")
    public ApiResponse<DeviceDetailResponse> getDeviceDetail(@AuthenticationPrincipal Long userId,
                                                             @PathVariable("device-id") Long deviceId) {
        DeviceDetailResponse response = deviceService.getDeviceDetail(userId, deviceId);

        return ApiResponse.onSuccess(response);
    }

    @PatchMapping("/{device-id}")
    public ApiResponse<DeviceDetailResponse> updateDeviceName(@AuthenticationPrincipal Long userId,
                                                              @PathVariable("device-id") Long deviceId,
                                                              @RequestBody DeviceUpdateNameRequest request) {
        DeviceDetailResponse response = deviceService.updateDeviceName(userId, deviceId, request);

        return ApiResponse.onSuccess(response);
    }

    @DeleteMapping("/{device-id}")
    public ApiResponse<?> deleteDevice(@AuthenticationPrincipal Long userId,
                                       @PathVariable("device-id") Long deviceId) {
        deviceService.deleteDevice(userId, deviceId);

        return ApiResponse.onSuccess();
    }

    @GetMapping("/{device-id}/power")
    public ApiResponse<DeviceStatusResponse> getPowerStatus(@AuthenticationPrincipal Long userId,
                                                            @PathVariable("device-id") Long deviceId) {
        DeviceStatusResponse response = deviceService.getPowerStatus(userId, deviceId);

        return ApiResponse.onSuccess(response);
    }

    @PatchMapping("/{device-id}/power")
    public ApiResponse<DeviceStatusResponse> controlPower(@AuthenticationPrincipal Long userId,
                                                          @PathVariable("device-id") Long deviceId,
                                                          @RequestBody DeviceStatusRequest request) {
        DeviceStatusResponse response = deviceService.controlPower(userId, deviceId, request);

        return ApiResponse.onSuccess(response);
    }

    @GetMapping("/{device-id}/open")
    public ApiResponse<DeviceStatusResponse> getOpenStatus(@AuthenticationPrincipal Long userId,
                                                           @PathVariable("device-id") Long deviceId) {
        DeviceStatusResponse response = deviceService.getOpenStatus(userId, deviceId);

        return ApiResponse.onSuccess(response);
    }

    @PatchMapping("/{device-id}/open")
    public ApiResponse<DeviceStatusResponse> controlOpen(@AuthenticationPrincipal Long userId,
                                                         @PathVariable("device-id") Long deviceId,
                                                         @RequestBody DeviceStatusRequest request) {
        DeviceStatusResponse response = deviceService.controlOpen(userId, deviceId, request);

        return ApiResponse.onSuccess(response);
    }

    @PatchMapping("/{device-id}/opacity")
    public ApiResponse<DeviceStatusResponse> controlOpacity(@AuthenticationPrincipal Long userId,
                                                            @PathVariable("device-id") Long deviceId,
                                                            @RequestBody DeviceStatusRequest request) {
        DeviceStatusResponse response = deviceService.controlOpacity(userId, deviceId, request);

        return ApiResponse.onSuccess(response);
    }

    @PatchMapping("/{device-id}/mode/status")
    public ApiResponse<DeviceModeStatusResponse> controlModeStatus(@AuthenticationPrincipal Long userId,
                                                                   @PathVariable("device-id") Long deviceId,
                                                                   @RequestBody DeviceModeStatusRequest request) {
        DeviceModeStatusResponse response = deviceService.controlModeStatus(userId, deviceId, request);

        return ApiResponse.onSuccess(response);
    }

    @PatchMapping("/{device-id}/mode/settings")
    public ApiResponse<DeviceModeSettingsResponse> controlModeSettings(@AuthenticationPrincipal Long userId,
                                                                       @PathVariable("device-id") Long deviceId,
                                                                       @RequestBody DeviceModeSettingsRequest request) {
        DeviceModeSettingsResponse response = deviceService.controlModeSettings(userId, deviceId, request);

        return ApiResponse.onSuccess(response);
    }

    @PatchMapping("/{device-id}/media")
    public ApiResponse<DeviceDetailResponse> updateDeviceMedia(@AuthenticationPrincipal Long userId,
                                                               @PathVariable("device-id") Long deviceId,
                                                               @RequestBody DeviceMediaUpdateRequest request) {
        DeviceDetailResponse response = deviceService.updateDeviceMedia(userId, deviceId, request.mediaId());

        return ApiResponse.onSuccess(response);
    }

    @PatchMapping("/{device-id}/music")
    public ApiResponse<DeviceDetailResponse> updateDeviceMusic(@AuthenticationPrincipal Long userId,
                                                               @PathVariable("device-id") Long deviceId,
                                                               @RequestBody DeviceMusicRequest request) {
        DeviceDetailResponse response = deviceService.updateDeviceMusic(userId, deviceId, request.musicId());

        return ApiResponse.onSuccess(response);
    }

    @GetMapping("/{device-id}/alarms")
    public ApiResponse<List<AlarmResponse>> getAlarmsByDevice(@AuthenticationPrincipal Long userId,
                                                              @PathVariable("device-id") Long deviceId) {
        List<AlarmResponse> responses = alarmService.getAlarmsByDevice(userId, deviceId);

        return ApiResponse.onSuccess(responses);
    }
}
