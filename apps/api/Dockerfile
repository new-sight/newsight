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

# 2단계: 실행 환경 구성 (Java + Nginx reverse proxy + SSL)
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Nginx, OpenSSL 및 실행에 필요한 도구 설치
RUN apk add --no-cache nginx openssl && \
    mkdir -p /run/nginx /etc/nginx/ssl

# 개발 환경을 위해 자체 서명(Self-signed) SSL 인증서 생성 (CN=localhost)
# 실제 운영 환경 인증서로 대체하려면 COPY 명령어로 덮어쓰거나 볼륨 마운트하면 됩니다.
RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/server.key \
    -out /etc/nginx/ssl/server.crt \
    -subj "/C=KR/ST=Seoul/L=Seoul/O=NewsAIAgents/OU=IT/CN=localhost"

# Nginx 설정 파일 및 빌드된 스프링 JAR 복사
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/build/libs/*.jar app.jar

# Nginx 및 Java 통합 실행 스크립트 복사 및 실행권한 부여
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# HTTP(80) 및 HTTPS(443) 포트 노출
EXPOSE 80 443

# 애플리케이션 통합 기동
ENTRYPOINT ["/app/entrypoint.sh"]
