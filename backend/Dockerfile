# Deprecated....
# FROM openjdk:17-jdk-slim
FROM amazoncorretto:17-alpine

WORKDIR /app

COPY build/libs/*.jar ./app.jar

ENTRYPOINT ["java", "-jar", "app.jar"]