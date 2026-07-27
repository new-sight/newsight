package com.example.mypage.myInfo.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Schema(description = "내 정보 조회 응답 DTO")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MyInfoResponse {

    @Schema(description = "마스킹 처리된 로그인 아이디", example = "ho**")
    private String loginId;

    @Schema(description = "사용자 이름", example = "홍길동")
    private String username;

    @Schema(description = "이메일 주소", example = "hong@example.com")
    private String email;

    @Schema(description = "전화번호", example = "010-1234-5678")
    private String phone;

    @Schema(description = "사용자 권한/역할", example = "ROLE_USER")
    private String role;

    @Schema(description = "가입 일자 및 시간", example = "2026-07-27T09:54:43")
    private String createdAt;

    @Schema(description = "스크랩한 뉴스 ID 목록 (쉼표 구분)", example = "news123,news456")
    private String scrappedNewsIds;

    @Schema(description = "자주 찾는 주식 티커 목록 (쉼표 구분)", example = "AAPL,NVDA")
    private String favoriteStockTickers;
}
