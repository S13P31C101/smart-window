package com.lumiscape.smartwindow.device.controller;

import com.lumiscape.smartwindow.device.domain.Device;
import com.lumiscape.smartwindow.device.dto.*;
import com.lumiscape.smartwindow.device.service.DeviceService;
import com.lumiscape.smartwindow.global.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/devices")
@RequiredArgsConstructor
public class DeviceController {

    private final DeviceService deviceService;

    // TODO
    // DELETE
    private Long getMockUserId() {
        return 1L;
    }

    @GetMapping
    public ApiResponse<List<DeviceDetailResponse>> getMyDevices() {
    // public ApiResponse<List<DeviceDetailResponse>> getMyDevices(@AuthenticationPrincipal Long userId) {
        Long userId = getMockUserId();
        List<DeviceDetailResponse> devices = deviceService.getMyDevice(userId);

        return ApiResponse.onSuccess(devices);
    }

    @PostMapping
    public ApiResponse<DeviceDetailResponse> registerDevice(@RequestBody DeviceRegisterRequest request) {
    // public ApiResponse<DeviceDetailResponse> registerDevice(@AuthenticationPrincipal Long userId, @RequestBody DeviceRegisterRequest request) {
        Long userId = getMockUserId();
        DeviceDetailResponse newDevice = deviceService.registerDevice(userId, request);

        return ApiResponse.onSuccess(HttpStatus.CREATED, newDevice);
    }

    @GetMapping("/{device-id}")
    public ApiResponse<DeviceDetailResponse> getDeviceDetail(@PathVariable("device-id") Long deviceId) {
    // public ApiResponse<DeviceDetailResponse> getDeviceDetail(@AuthenticationPrincipal @PathVariable("device-id") Long deviceId) {
        Long userId = getMockUserId();
        DeviceDetailResponse device = deviceService.getDeviceDetail(userId, deviceId);

        return ApiResponse.onSuccess(device);
    }

    @PatchMapping("/{device-id}")
    public ApiResponse<DeviceDetailResponse> updateDeviceName(@PathVariable("device-id") Long deviceId,
                                                              @RequestBody DeviceUpdateNameRequest request) {
        Long userId = getMockUserId();
        DeviceDetailResponse response = deviceService.updateDeviceName(userId, deviceId, request);

        return ApiResponse.onSuccess(response);
    }

    @DeleteMapping("/{device-id}")
    public ApiResponse<?> deleteDevice(@PathVariable("device-id") Long deviceId) {
        Long userId = getMockUserId();
        deviceService.deleteDevice(userId, deviceId);

        return ApiResponse.onSuccess();
    }

    @GetMapping("/{device-id}/power")
    public ApiResponse<DeviceStatusResponse> getPowerStatus(@PathVariable("device-id") Long deviceId) {
        Long userId = getMockUserId();
        DeviceStatusResponse response = deviceService.getPowerStatus(userId, deviceId);

        return ApiResponse.onSuccess(response);
    }

    @PutMapping("/{device-id}/power")
    public ApiResponse<DeviceStatusResponse> controlPower(@PathVariable("device-id") Long deviceId,
                                                          @RequestBody DeviceStatusRequest request) {
        Long userId = getMockUserId();
        DeviceStatusResponse response = deviceService.controlPower(userId, deviceId, request);

        return ApiResponse.onSuccess(response);
    }

    @GetMapping("/{device-id}/open")
    public ApiResponse<DeviceStatusResponse> getOpenStatus(@PathVariable("device-id") Long deviceId) {
        Long userId = getMockUserId();
        DeviceStatusResponse response = deviceService.getOpenStatus(userId, deviceId);

        return ApiResponse.onSuccess(response);
    }

    @PutMapping("/{device-id}/open")
    public ApiResponse<DeviceStatusResponse> controlOpen(@PathVariable("device-id") Long deviceId,
                                                         @RequestBody DeviceStatusRequest request) {
        Long userId = getMockUserId();
        DeviceStatusResponse response = deviceService.controlOpen(userId, deviceId, request);

        return ApiResponse.onSuccess(response);
    }

    @PutMapping("/{device-id}/mode/status")
    public ApiResponse<DeviceModeStatusResponse> controlModeStatus(@PathVariable("device-id") Long deviceId,
                                                                   @RequestBody DeviceModeStatusRequest request) {
        Long userId = getMockUserId();
        DeviceModeStatusResponse response = deviceService.controlModeStatus(userId, deviceId, request);

        return ApiResponse.onSuccess(response);
    }

    @PutMapping("/{device-id}/mode/settings")
    public ApiResponse<DeviceModeSettingsResponse> controlModeSettings(@PathVariable("device-id") Long deviceId,
                                                                       @RequestBody DeviceModeSettingsRequest request) {
        Long userId = getMockUserId();
        DeviceModeSettingsResponse response = deviceService.controlModeSettings(userId, deviceId, request);

        return ApiResponse.onSuccess(response);
    }
}
