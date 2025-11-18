package com.lumiscape.smartwindow.device.listener;

import com.lumiscape.smartwindow.device.service.DeviceService;
import com.lumiscape.smartwindow.media.event.MediaUploadEvent;
import com.lumiscape.smartwindow.media.event.MediaDeletedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DeviceMediaUpdateListener {

    private final DeviceService deviceService;

    @Async
    @EventListener
    public void handleMediaUpload(MediaUploadEvent event) {
        try {
            if (event.deviceId() != null) {
                deviceService.updateDeviceMedia(event.userId(), event.deviceId(), event.mediaId());
                log.info("Successfully updated device media for deviceId : {}", event.deviceId());
            }
        } catch (Exception e) {
            log.error("Failed to update device media for deviceId : {}\n Error : {}", event.deviceId(), e.getMessage(), e);
        }
    }

    @Async
    @EventListener
    public void handleMediaDeleted(MediaDeletedEvent event) {
        try {
            if (event.mediaId() != null) {
                deviceService.deleteDevicesMedia(event.userId(), event.mediaId());
                log.info("Successfully deleted device media by mediaId : {}", event.mediaId());
            }
        } catch (Exception e) {
            log.error("Failed to delete device media by mediaId : {}\n Error : {}", event.mediaId(), e.getMessage(), e);
        }
    }
}