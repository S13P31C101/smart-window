package com.lumiscape.smartwindow.global.infra;

import com.lumiscape.smartwindow.config.mqtt.MqttConfig;
import com.lumiscape.smartwindow.global.exception.CustomException;
import com.lumiscape.smartwindow.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.MessagingException;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class MqttPublishService {

    private final MqttConfig.MqttPublishGateway mqttGateway;

    public void publishCommand(String deviceUniqueId, String command, String payload) {
        String topic = String.format("/devices/%s/command/%s", deviceUniqueId, command);

        try {
            log.info("MQTT Publish : device = {}, command = {}, payload = {}", deviceUniqueId, command, payload);

            mqttGateway.publish(topic, payload);
        } catch (MessagingException e) {
            log.error("MQTT Publish Failed : device = {}, command = {}, payload = {}", deviceUniqueId,command, payload);

            throw new CustomException(ErrorCode.MQTT_PUBLISH_FAILED);
        }
    }
}
