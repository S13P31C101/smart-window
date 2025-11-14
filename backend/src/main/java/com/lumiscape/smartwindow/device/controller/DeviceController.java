package com.lumiscape.smartwindow.device.controller;

import com.lumiscape.smartwindow.device.domain.Device;
import com.lumiscape.smartwindow.device.dto.*;
import com.lumiscape.smartwindow.device.service.DeviceService;
import com.lumiscape.smartwindow.global.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/devices")
@RequiredArgsConstructor
public class DeviceController {

    private final DeviceService deviceService;

    @GetMapping
    public ApiResponse<List<DeviceDetailResponse>> getMyDevices(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = Long.parseLong(userDetails.getUsername());
        List<DeviceDetailResponse> responses = deviceService.getMyDevice(userId);

        return ApiResponse.onSuccess(responses);
    }

    @PostMapping
    public ApiResponse<DeviceDetailResponse> registerDevice(@AuthenticationPrincipal UserDetails userDetails,
                                                            @RequestBody DeviceRegisterRequest request) {
        Long userId = Long.parseLong(userDetails.getUsername());
        DeviceDetailResponse newDevice = deviceService.registerDevice(userId, request);

        return ApiResponse.onSuccess(HttpStatus.CREATED, newDevice);
    }

    @GetMapping("/{device-id}")
    public ApiResponse<DeviceDetailResponse> getDeviceDetail(@AuthenticationPrincipal UserDetails userDetails,
                                                             @PathVariable("device-id") Long deviceId) {
        Long userId = Long.parseLong(userDetails.getUsername());
        DeviceDetailResponse response = deviceService.getDeviceDetail(userId, deviceId);

        return ApiResponse.onSuccess(response);
    }

    @PatchMapping("/{device-id}")
    public ApiResponse<DeviceDetailResponse> updateDeviceName(@AuthenticationPrincipal UserDetails userDetails,
                                                              @PathVariable("device-id") Long deviceId,
                                                              @RequestBody DeviceUpdateNameRequest request) {
        Long userId = Long.parseLong(userDetails.getUsername());
        DeviceDetailResponse response = deviceService.updateDeviceName(userId, deviceId, request);

        return ApiResponse.onSuccess(response);
    }

    @DeleteMapping("/{device-id}")
    public ApiResponse<?> deleteDevice(@AuthenticationPrincipal UserDetails userDetails,
                                       @PathVariable("device-id") Long deviceId) {
        Long userId = Long.parseLong(userDetails.getUsername());
        deviceService.deleteDevice(userId, deviceId);

        return ApiResponse.onSuccess();
    }

    @GetMapping("/{device-id}/power")
    public ApiResponse<DeviceStatusResponse> getPowerStatus(@AuthenticationPrincipal UserDetails userDetails,
                                                            @PathVariable("device-id") Long deviceId) {
        Long userId = Long.parseLong(userDetails.getUsername());
        DeviceStatusResponse response = deviceService.getPowerStatus(userId, deviceId);

        return ApiResponse.onSuccess(response);
    }

    @PutMapping("/{device-id}/power")
    public ApiResponse<DeviceStatusResponse> controlPower(@AuthenticationPrincipal UserDetails userDetails,
                                                          @PathVariable("device-id") Long deviceId,
                                                          @RequestBody DeviceStatusRequest request) {
        Long userId = Long.parseLong(userDetails.getUsername());
        DeviceStatusResponse response = deviceService.controlPower(userId, deviceId, request);

        return ApiResponse.onSuccess(response);
    }

    @GetMapping("/{device-id}/open")
    public ApiResponse<DeviceStatusResponse> getOpenStatus(@AuthenticationPrincipal UserDetails userDetails,
                                                           @PathVariable("device-id") Long deviceId) {
        Long userId = Long.parseLong(userDetails.getUsername());
        DeviceStatusResponse response = deviceService.getOpenStatus(userId, deviceId);

        return ApiResponse.onSuccess(response);
    }

    @PutMapping("/{device-id}/open")
    public ApiResponse<DeviceStatusResponse> controlOpen(@AuthenticationPrincipal UserDetails userDetails,
                                                         @PathVariable("device-id") Long deviceId,
                                                         @RequestBody DeviceStatusRequest request) {
        Long userId = Long.parseLong(userDetails.getUsername());
        DeviceStatusResponse response = deviceService.controlOpen(userId, deviceId, request);

        return ApiResponse.onSuccess(response);
    }

    @PutMapping("/{device-id}/mode/status")
    public ApiResponse<DeviceModeStatusResponse> controlModeStatus(@AuthenticationPrincipal UserDetails userDetails,
                                                                   @PathVariable("device-id") Long deviceId,
                                                                   @RequestBody DeviceModeStatusRequest request) {
        Long userId = Long.parseLong(userDetails.getUsername());
        DeviceModeStatusResponse response = deviceService.controlModeStatus(userId, deviceId, request);

        return ApiResponse.onSuccess(response);
    }

    @PutMapping("/{device-id}/mode/settings")
    public ApiResponse<DeviceModeSettingsResponse> controlModeSettings(@AuthenticationPrincipal UserDetails userDetails,
                                                                       @PathVariable("device-id") Long deviceId,
                                                                       @RequestBody DeviceModeSettingsRequest request) {
        Long userId = Long.parseLong(userDetails.getUsername());
        DeviceModeSettingsResponse response = deviceService.controlModeSettings(userId, deviceId, request);

        return ApiResponse.onSuccess(response);
    }

    @PutMapping("/{device-id}/media")
    public ApiResponse<DeviceDetailResponse> updateDeviceMedia(@AuthenticationPrincipal UserDetails userDetails,
                                                               @PathVariable("device-id") Long deviceId,
                                                               @RequestBody DeviceMediaUpdateRequest request) {
        Long userId = Long.parseLong(userDetails.getUsername());
        DeviceDetailResponse response = deviceService.updateDeviceMedia(userId, deviceId, request.mediaId());

        return ApiResponse.onSuccess(response);
    }
}
