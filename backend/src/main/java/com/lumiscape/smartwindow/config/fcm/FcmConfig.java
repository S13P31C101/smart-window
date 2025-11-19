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

import java.io.InputStream;

@Slf4j
@Configuration
public class FcmConfig {

    @Value("${fcm.key.path}")
    private String fcmKeyPath;

    private FirebaseApp firebaseApp;

    @PostConstruct
    public void initialize() {
        try {
            ClassPathResource resource = new ClassPathResource(fcmKeyPath);

            if (!resource.exists()) {
                log.error("Firebase service account key file not found at path: {}", fcmKeyPath);
                return;
            }

            InputStream serviceAccount = resource.getInputStream();

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();

            if (FirebaseApp.getApps().isEmpty()) {
                this.firebaseApp = FirebaseApp.initializeApp(options);
                log.info("FirebaseApp initialization complete.");
            } else {
                this.firebaseApp = FirebaseApp.getInstance();
                log.info("FirebaseApp already initialized.");
            }
        } catch (Exception e) {
            log.error("Error initializing Firebase Admin SDK", e);
        }
    }

    @Bean
    public FirebaseMessaging firebaseMessaging() {
        if (this.firebaseApp == null) {
            log.error("FirebaseApp has not been initialized. FirebaseMessaging bean cannot be created.");
            throw new IllegalStateException("FirebaseApp has not been initialized");
        }
        return FirebaseMessaging.getInstance(this.firebaseApp);
    }
}