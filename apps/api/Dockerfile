# 1단계: 빌드 환경 구성
FROM gradle:8-jdk21-alpine AS builder
WORKDIR /app

# Gradle 래퍼 및 설정 파일 복사
COPY gradlew settings.gradle build.gradle gradle.properties ./
COPY gradle ./gradle

# gradlew 실행 권한 부여 및 의존성 캐싱을 위한 예비 작업
RUN chmod +x gradlew

# 소스코드 복사 및 빌드
COPY src ./src
RUN ./gradlew bootJar --no-daemon -x test

# 2단계: 실행 환경 구성
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# 빌드 결과물 복사
COPY --from=builder /app/build/libs/*.jar app.jar

# 8080 포트 노출
EXPOSE 8080

# 애플리케이션 실행
ENTRYPOINT ["java", "-jar", "app.jar"]
