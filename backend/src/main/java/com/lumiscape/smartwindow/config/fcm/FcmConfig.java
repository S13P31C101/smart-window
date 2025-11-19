package com.lumiscape.smartwindow.config.fcm;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.messaging.FirebaseMessaging;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

@Slf4j
@Configuration
public class FcmConfig {

//    @Value("${fcm.key.path}")
    @Value("${fcm.key.content}")
    private String fcmKeyPath;

    private FirebaseApp firebaseApp;

    @Bean
    public FirebaseApp firebaseApp() throws Exception {
//        ClassPathResource resource = new ClassPathResource(fcmKeyPath);
//
//        if (!resource.exists()) {
//            throw new IOException("Can't Find Key" + fcmKeyPath);
//        }

//        InputStream serviceAccount = resource.getInputStream();

        InputStream serviceAccount = new ByteArrayInputStream(fcmKeyPath.getBytes(StandardCharsets.UTF_8));

        FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                .build();

        if (FirebaseApp.getApps().isEmpty()) {
            log.info("FirebaseApp initialization complete.");
            return FirebaseApp.initializeApp(options);
        } else {
            log.info("FirebaseApp already initialized.");
            return FirebaseApp.getInstance();
        }
    }

    @Bean
    public FirebaseMessaging firebaseMessaging(FirebaseApp firebaseApp) {

        return FirebaseMessaging.getInstance(firebaseApp);
    }
}