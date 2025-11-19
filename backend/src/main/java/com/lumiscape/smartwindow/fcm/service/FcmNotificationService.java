package com.lumiscape.smartwindow.fcm.service;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import com.lumiscape.smartwindow.fcm.repository.FcmTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class FcmNotificationService {

    private final FirebaseMessaging firebaseMessaging;
    private final FcmTokenRepository fcmTokenRepository;

    // 이 메소드를 다른 서비스에서 호출하여 사용합니다.
    public void sendNotification(Long userId, String title, String body) {
        fcmTokenRepository.findByUserId(userId).ifPresent(fcmToken -> {
            Notification notification = Notification.builder()
                    .setTitle(title)
                    .setBody(body)
                    .build();

            Message message = Message.builder()
                    .setToken(fcmToken.getToken())
                    .setNotification(notification)
                    // 여기에 'event:power_status' 같은 커스텀 데이터를 추가할 수 있습니다.
                    // .putData("event", "power_status") 
                    .build();
            try {
                firebaseMessaging.send(message);
                log.info("Successfully sent FCM message to user: {}", userId);
            } catch (Exception e) {
                log.error("Failed to send FCM message to user: {}", userId, e);
            }
        });
    }
}