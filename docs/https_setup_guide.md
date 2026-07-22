# Docker Compose 기반 HTTPS(SSL/TLS) 설정 및 자동 갱신 가이드

이 문서는 Docker Compose 환경에서 Nginx와 Certbot(Let's Encrypt)을 연동하여 HTTPS 보안 통신을 구성하는 방법과 인증서 자동 갱신을 적용하는 과정을 설명합니다.

---

## 1. 개요 및 전체 흐름

우리는 단일 컨테이너 내부의 **Nginx(리버스 프록시)**와 **Spring Boot(API 서버)** 구성을 유지하면서, **Certbot**을 Docker Compose 독립 서비스로 분리하여 Let's Encrypt 인증서를 발급 및 관리합니다.

- **HTTP 챌린지 (ACME Challenge)**: 인증서 발급/갱신 시 Let's Encrypt 서버가 지정한 토큰을 읽어가며 도메인 소유권을 확인하는 절차입니다. 이를 위해 Nginx와 Certbot 컨테이너가 특정 웹 디렉토리(`/var/www/certbot`)를 공유 볼륨으로 매핑해야 합니다.
- **인증서 경로 공유**: 발급된 인증서는 Nginx가 참조할 수 있도록 볼륨(`certbot-etc`)을 통해 공유합니다.

---

## 2. 환경별 세팅 및 구동 방법

### 1) 로컬 개발 환경 (Local Environment)
로컬 개발 환경(`localhost`)에서는 Let's Encrypt 인증서를 발급받을 수 없으므로, 기본적으로 이미지 빌드 시 생성되는 **자체 서명(Self-signed) 인증서**를 사용하도록 되어 있습니다.

#### [자체 서명 인증서 테스트]
1. `docker-compose.yml`에서 HTTPS 관련 볼륨 설정이 기본 활성화되어 있다면, 볼륨 매핑을 로컬 인증서 주입 방식으로 바꿉니다.
   ```yaml
   # docker-compose.yml 예시
   services:
     api:
       # ...
       volumes:
         # 로컬에서는 기본적으로 컨테이너 자체 서명 인증서(/etc/nginx/ssl)를 사용하며,
         # 만약 호스트 브라우저에서 '신뢰할 수 없음' 경고를 없애고 싶다면 mkcert를 사용해 로컬 볼륨 마운트 가능
         # - ./certs/localhost.crt:/etc/nginx/ssl/server.crt:ro
         # - ./certs/localhost.key:/etc/nginx/ssl/server.key:ro
   ```
2. 컨테이너 빌드 및 구동:
   ```bash
   docker compose up --build -d
   ```
3. 브라우저에서 `https://localhost/` 또는 `https://localhost/api/...` 접속 테스트 (자체 서명 인증서 경고 화면에서 "고급 -> localhost로 이동" 클릭).

---

### 2) 실서버 운영 환경 (Production Environment)
실제 도메인(예: `api.yourdomain.com`)을 소유하고 있으며 DNS가 AWS EC2의 퍼블릭 IP를 가리키고 있어야 합니다.

#### [Step 1: 보안 그룹(인바운드 규칙) 포트 개방]
AWS EC2 보안 그룹에서 다음 포트를 추가로 개방합니다:
- **HTTP (80)** -> 인증서 발급(챌린지) 및 HTTPS 리다이렉트용
- **HTTPS (443)** -> 보안 통신용

#### [Step 2: Nginx 설정 업데이트 (`nginx.conf`)]
`apps/api/nginx.conf` 내의 `server_name` 설정을 로컬 호스트에서 실제 도메인명으로 변경합니다.
```nginx
server {
    listen 80;
    server_name api.yourdomain.com; # 도메인으로 교체
    ...
}
server {
    listen 443 ssl;
    server_name api.yourdomain.com; # 도메인으로 교체
    ...
}
```

#### [Step 3: 최초 1회 인증서 수동 발급 (Bootstrap)]
도커 컴포즈 최초 구동 시 인증서 볼륨에 아무 파일도 없으면 Nginx가 SSL 설정 오류(`server.crt not found`)로 실행을 멈추게 됩니다. 이를 방지하기 위한 안전한 발급 절차입니다.

1. **임시 컨테이너 구동 또는 자체서명 모드로 우선 시작**:
   먼저 Nginx를 기동하여 HTTP(80) 인증 챌린지 경로를 활성화합니다.
   (이미 `api` 컨테이너 빌드 단계에서 자체서명 `/etc/nginx/ssl/server.crt`를 생성하므로, 운영 환경 볼륨 마운트를 비활성화한 상태로 먼저 띄웁니다.)
2. **Certbot을 이용한 인증서 수동 발급**:
   ```bash
   # 도메인 정보와 이메일을 입력하여 인증서 발급 (웹루트 방식)
   docker compose run --rm --entrypoint \
     "certbot certonly --webroot -w /var/www/certbot \
      -d api.yourdomain.com \
      --email your-email@example.com --agree-tos --no-eff-email" certbot
   ```
3. **볼륨 디렉토리 매핑 및 인증서 교체 적용**:
   인증서가 발급되면 호스트 디렉토리 `/var/lib/docker/volumes/...` 또는 도커 볼륨 내부 `/etc/letsencrypt/live/api.yourdomain.com/` 경로에 키 파일들이 저장됩니다.
   
   이 인증서 파일들을 Nginx에 안정적으로 매핑하기 위해 `docker-compose.yml`에서 호스트 경로 직접 매핑 방식을 사용하는 것을 권장합니다:
   ```yaml
   # docker-compose.yml (운영 환경 추천 설정)
   services:
     api:
       volumes:
         # Let's Encrypt에서 생성한 도메인 인증서를 Nginx의 기본 SSL 경로로 직접 오버레이 매핑
         - /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem:/etc/nginx/ssl/server.crt:ro
         - /etc/letsencrypt/live/api.yourdomain.com/privkey.pem:/etc/nginx/ssl/server.key:ro
         - certbot-var:/var/www/certbot:ro
   ```

---

## 3. 인증서 자동 갱신 및 Nginx Reload 설정

Let's Encrypt 인증서는 유효기간이 90일로 짧아 자동 갱신 설정이 필수적입니다.
`docker-compose.yml`에 포함된 `certbot` 서비스는 12시간마다 `certbot renew`를 실행하여 만료일이 30일 이하로 남았을 때 자동으로 갱신을 수행합니다.

### Nginx 자동 재로드(Reload)
인증서 파일이 갱신되어도 메모리에 올라간 Nginx 서버가 즉시 이를 인식하지 못합니다. 따라서 인증서 갱신 후 반드시 Nginx 설정을 재로드(`nginx -s reload`) 해야 합니다.

가장 단순하고 안정적인 방법은 **호스트 환경의 Cron(크론탭)**을 이용하여 주기적으로 갱신 체크를 수행하고 갱신 후 Nginx 컨테이너를 재로드하는 스크립트를 돌리는 것입니다.

#### [추천: 호스트 크론탭 쉘 스크립트 등록]
1. EC2 호스트에 `/home/ubuntu/renew_cert.sh` 파일을 생성합니다.
   ```bash
   nano /home/ubuntu/renew_cert.sh
   ```
2. 아래 내용을 작성합니다.
   ```bash
   #!/bin/bash
   # 1. Certbot 인증서 갱신 시도
   docker compose -f /home/ubuntu/newsAIAgents/docker-compose.yml run --rm certbot renew
   
   # 2. 갱신된 인증서를 적용하기 위해 Nginx 컨테이너 재로드
   docker compose -f /home/ubuntu/newsAIAgents/docker-compose.yml exec api nginx -s reload
   ```
3. 실행 권한 부여:
   ```bash
   chmod +x /home/ubuntu/renew_cert.sh
   ```
4. 크론탭 주기 등록:
   ```bash
   sudo crontab -e
   ```
   매일 새벽 3시에 갱신 검사 및 Nginx 재로드를 수행하도록 한 줄 추가합니다.
   ```text
   0 3 * * * /home/ubuntu/renew_cert.sh >> /home/ubuntu/renew.log 2>&1
   ```

---

## 4. 프론트엔드 연동 관련 주의사항
백엔드가 HTTPS로 배포된 경우, 프론트엔드 앱(`apps/web`)에서도 반드시 백엔드 엔드포인트 URL 프로토콜을 `http://`가 아닌 **`https://`**로 명시해야 합니다. 
만약 프론트엔드는 HTTP인데 백엔드는 HTTPS이거나 혹은 그 반대인 경우 브라우저 보안 정책상 **Mixed Content(혼합 콘텐츠) 오류**가 발생하여 통신이 거부됩니다.

- **프론트엔드 `.env.local` 또는 배포 설정**:
  ```env
  VITE_API_URL=https://api.yourdomain.com
  ```
