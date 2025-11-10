package com.lumiscape.smartwindow.fcm.service;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import com.lumiscape.smartwindow.mobile.domain.Mobile;
import com.lumiscape.smartwindow.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class FcmNotificationService {

    public void sendNotificationToUser(User user, String title, String body) {
        List<Mobile> mobiles = user.getMobiles();

        if (mobiles.isEmpty()) {
            log.warn("사용자 ID '{}'에 대해 전송할 FCM 토큰이 없습니다.", user.getId());
            return;
        }

        for (Mobile mobile : mobiles) {
            String token = mobile.getToken();
            Notification notification = Notification.builder()
                    .setTitle(title)
                    .setBody(body)
                    .build();

            Message message = Message.builder()
                    .setToken(token)
                    .setNotification(notification)
                    .build();

            try {
                FirebaseMessaging.getInstance().send(message);
                log.info("사용자 ID '{}'에게 FCM 알림을 성공적으로 전송했습니다. (토큰: {})", user.getId(), token);
            } catch (FirebaseMessagingException e) {
                log.error("FCM 알림 전송에 실패했습니다. 토큰: {}", token, e);
                // 참고: 여기서 MessagingErrorCode가 'UNREGISTERED'인 경우,
                // 유효하지 않은 토큰이므로 DB에서 삭제하는 로직을 추가할 수 있습니다.
            }
        }
    }
}