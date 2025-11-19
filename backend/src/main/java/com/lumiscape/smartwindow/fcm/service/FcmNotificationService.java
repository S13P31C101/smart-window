package com.lumiscape.smartwindow.fcm.service;

import com.google.firebase.messaging.*;
import com.lumiscape.smartwindow.global.exception.CustomException;
import com.lumiscape.smartwindow.global.exception.ErrorCode;
import com.lumiscape.smartwindow.mobile.domain.Mobile;
import com.lumiscape.smartwindow.mobile.repository.MobileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class FcmNotificationService {

    private final FirebaseMessaging firebaseMessaging;
    private final MobileRepository mobileRepository;

    public void sendNotification(Long userId, String title, String body) {
        List<Mobile> mobiles = mobileRepository.findAllByUser_Id(userId);

        if (mobiles.isEmpty()) {
            throw new CustomException(ErrorCode.MOBILE_NOT_FOUND);
        }

        List<String> tokens = mobiles.stream()
                .map(Mobile::getToken)
                .toList();

        for (String token : tokens) {
            Message message = Message.builder()
                    .setToken(token)
                    .setNotification(Notification.builder()
                            .setTitle(title)
                            .setBody(body)
                            .build())
                    .build();

            try {
                String response = firebaseMessaging.send(message);

                log.info("[ FCM ] Send message Success, user : {}, {}", userId, response);
            } catch (FirebaseMessagingException e) {
                log.error("[ FCM ] Failed to send message, user : {}, token : {}", userId, token);
            }
        }

//        MulticastMessage message = MulticastMessage.builder()
//                .setNotification(Notification.builder()
//                        .setTitle(title)
//                        .setBody(body)
//                        .build())
//                .addAllTokens(tokens)
//                .build();
//
//        try {
//            firebaseMessaging.sendEachForMulticast(message);
//            log.info("[ FCM ] Send message Success, user = {}", userId);
//        } catch (FirebaseMessagingException e) {
//            log.error("[ FCM ] Failed to send messages, user = {}", userId);
//        }
    }
}