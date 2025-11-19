package com.lumiscape.smartwindow.global.infra;

import com.lumiscape.smartwindow.alarm.service.AlarmService;
import com.lumiscape.smartwindow.config.mqtt.MqttConfig;
import com.lumiscape.smartwindow.device.service.DeviceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.integration.annotation.ServiceActivator;
import org.springframework.integration.mqtt.support.MqttHeaders;
import org.springframework.messaging.Message;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class MqttSubscribeService {

    private final @Lazy DeviceService deviceService;
    private final @Lazy AlarmService alarmService;
//    private final @Lazy FcmService fcmService;

    @ServiceActivator(inputChannel = MqttConfig.MQTT_STATUS_INPUT_CHANNEL)
    public void handleStatusMessage(Message<String> message) {
        String topic = (String) message.getHeaders().get(MqttHeaders.RECEIVED_TOPIC);
        String payload = message.getPayload();

        String[] parts = topic.split("/");
        if (parts.length != 5 || !parts[3].equals("status")) {
            log.warn("MQTT STATUS receive FAILED : {}", topic);
            return;
        }

        try {
            String deviceUniqueId = parts[2];
            String statusType = parts[4];

            deviceService.updateDeviceStatusFromMqtt(deviceUniqueId, statusType, payload);

            // TODO FCM
//            fcmService.notifyDeviceStatusChange(deviceUniqueId, statusType, payload);
        } catch (Exception e) {
            log.error("MQTT STATUS receive FAILED : {}", topic, e);
        }
    }

    @ServiceActivator(inputChannel = MqttConfig.MQTT_REQUEST_INPUT_CHANNEL)
    public void handleRequestMessage(Message<String> message) {
        String topic = (String) message.getHeaders().get(MqttHeaders.RECEIVED_TOPIC);
        String payload = message.getPayload();

        String[] parts = topic.split("/");
        if (parts.length != 5 || !parts[3].equals("request")) {
            log.warn("MQTT REQUEST receive FAILED : {}", topic);
            return;
        }

        try {
            String deviceUniqueId = parts[2];
            String requestType = parts[4];

            switch (requestType) {
                case "alarms":
                    alarmService.publishAlarmListToDevice(deviceUniqueId);
                    break;
                default:
                    log.warn("MQTT REQUEST receive FAILED : {}", requestType);
            }
        } catch (Exception e) {
            log.error("MQTT REQUEST receive FAILED : {}", topic, e);
        }
    }
}
