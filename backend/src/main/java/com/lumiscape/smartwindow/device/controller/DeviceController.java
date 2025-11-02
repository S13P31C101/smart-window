package com.lumiscape.smartwindow.device.controller;

import com.lumiscape.smartwindow.device.dto.DeviceControlRequestDto;
import com.lumiscape.smartwindow.device.dto.DeviceDetailResponseDto;
import com.lumiscape.smartwindow.device.dto.DeviceRegisterRequestDto;
import com.lumiscape.smartwindow.device.dto.DeviceUpdateRequestDto;
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
    private Long getMockUserId() {
        return 1L;
    }

    @GetMapping
    public ApiResponse<List<DeviceDetailResponseDto>> getMyDevices() {
        Long userId = getMockUserId();
        List<DeviceDetailResponseDto> devices = deviceService.getMyDevice(userId);

        return ApiResponse.onSuccess(devices);
    }

    @PostMapping
    public ApiResponse<DeviceDetailResponseDto> registerDevice(@RequestBody DeviceRegisterRequestDto request) {
        Long userId = getMockUserId();
        DeviceDetailResponseDto newDevice = deviceService.registerDevice(userId, request);

        return ApiResponse.onSuccess(HttpStatus.CREATED, newDevice);
    }

    @GetMapping("/{device-id}")
    public ApiResponse<DeviceDetailResponseDto> getDeviceDetail(@PathVariable("device-id") Long deviceId) {
        Long userId = getMockUserId();
        DeviceDetailResponseDto device = deviceService.getDeviceDetail(userId, deviceId);

        return ApiResponse.onSuccess(device);
    }

    @PatchMapping("/{device-id}")
    public ApiResponse<DeviceDetailResponseDto> updateDeviceName(@PathVariable("device-id") Long deviceId,
                                                                 @RequestBody DeviceUpdateRequestDto request) {
        Long userId = getMockUserId();
        DeviceDetailResponseDto updatedDevice = deviceService.updateDeviceName(userId, deviceId, request);

        return ApiResponse.onSuccess(updatedDevice);
    }

    @DeleteMapping("/{device-id}")
    public ApiResponse<?> deleteDevice(@PathVariable("device-id") Long deviceId) {
        Long userId = getMockUserId();
        deviceService.deleteDevice(userId, deviceId);

        return ApiResponse.onSuccess();
    }

    @PutMapping("/{device-id}/power")
    public ApiResponse<DeviceDetailResponseDto> controlPower(@PathVariable("device-id") Long deviceId,
                                                             @RequestBody DeviceControlRequestDto request) {
        Long userId = getMockUserId();
        DeviceDetailResponseDto updatedDevice = deviceService.controlPower(userId, deviceId, request);

        return ApiResponse.onSuccess(updatedDevice);
    }

    @PutMapping("/{device-id}/open")
    public ApiResponse<DeviceDetailResponseDto> controlOpen(@PathVariable("device-id") Long deviceId,
                                                             @RequestBody DeviceControlRequestDto request) {
        Long userId = getMockUserId();
        DeviceDetailResponseDto updatedDevice = deviceService.controlOpen(userId, deviceId, request);

        return ApiResponse.onSuccess(updatedDevice);
    }

    @PatchMapping("/{device-id}/mode")
    public ApiResponse<DeviceDetailResponseDto> controlMode(@PathVariable("device-id") Long deviceId,
                                                            @RequestBody DeviceControlRequestDto request) {
        Long userId = getMockUserId();
        DeviceDetailResponseDto updatedDevice = deviceService.controlMode(userId, deviceId, request);

        return ApiResponse.onSuccess(updatedDevice);
    }
}
