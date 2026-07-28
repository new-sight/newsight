package com.example.mypage.myInfo.controller;

import com.example.mypage.myInfo.dto.MyInfoResponse;
import com.example.mypage.myInfo.service.MyInfoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@Tag(name = "마이페이지 API", description = "내 정보 조회 및 마이페이지 프로필 관련 API")
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Slf4j
public class MyInfoController {

    private final MyInfoService myInfoService;

    @Operation(summary = "내 정보 조회", description = "현재 인증된 유저 또는 파라미터로 넘겨받은 유저의 프로필 및 마이페이지 정보를 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공", content = @Content(schema = @Schema(implementation = MyInfoResponse.class))),
            @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자", content = @Content),
            @ApiResponse(responseCode = "404", description = "사용자를 찾을 수 없음", content = @Content)
    })
    @GetMapping({"/myInfo"})
    public ResponseEntity<MyInfoResponse> getMyInfo(
            @Parameter(description = "조회 대상 사용자 이름 또는 아이디 (미입력 시 JWT 토큰 인증 유저 정보 사용)", example = "hong123")
            @RequestParam(value = "username", required = false) String username,
            @Parameter(hidden = true) Authentication authentication
    ) {
        String targetUser = null;

        // 1. JWT 인증 정보가 유효하면 로그인된 유저의 loginId 우선 사용
        if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getName())) {
            targetUser = authentication.getName();
        }

        // 2. 인증 정보가 없으면 쿼리 파라미터 사용
        if ((targetUser == null || targetUser.isBlank()) && username != null && !username.isBlank() && !"사용자".equals(username)) {
            targetUser = username;
        }

        log.info("[MyInfoController] getMyInfo requested - targetUser: {} (param: {}, auth: {})", 
                targetUser, username, authentication != null ? authentication.getName() : "null");
        
        MyInfoResponse response = myInfoService.getMyInfoByUsername(targetUser);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "회원 탈퇴", description = "현재 인증된 사용자의 계정과 관련 데이터(스크랩, 좋아요, 댓글)를 삭제합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "탈퇴 성공"),
            @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자", content = @Content)
    })
    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteMyAccount(@Parameter(hidden = true) Authentication authentication) {
        myInfoService.deleteAccount(authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
