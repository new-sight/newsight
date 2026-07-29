# 1단계: React / Vite 정적 파일 빌드
FROM node:20-alpine AS builder
WORKDIR /app

# 패키지 의존성 파일 복사 및 설치
COPY package.json package-lock.json ./
RUN npm ci

# 전체 웹 소스코드 복사 및 빌드 (dist 생성)
COPY . .
RUN npm run build

# 2단계: Nginx 실행 환경 구성 (SSL + Reverse Proxy + SPA 지원)
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# OpenSSL 설치 및 자체 서명 임시 SSL 인증서 생성
RUN apk add --no-cache openssl && \
    mkdir -p /etc/nginx/ssl

RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/server.key \
    -out /etc/nginx/ssl/server.crt \
    -subj "/C=KR/ST=Seoul/L=Seoul/O=NewsAIAgents/OU=IT/CN=localhost"

# 빌드 결과물(dist) 및 nginx.conf 복사
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

# 외부 노출 포트
EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
