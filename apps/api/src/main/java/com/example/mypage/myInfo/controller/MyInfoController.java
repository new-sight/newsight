package com.example.mypage.myInfo.controller;

import com.example.mypage.myInfo.dto.MyInfoResponse;
import com.example.mypage.myInfo.service.MyInfoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Slf4j
public class MyInfoController {

    private final MyInfoService myInfoService;

    @GetMapping({"/myInfo"})
    public ResponseEntity<MyInfoResponse> getMyInfo(
            @RequestParam(value = "username", required = false) String username,
            Authentication authentication
    ) {
        String targetUser = username;
        if (targetUser == null || targetUser.isBlank() || "사용자".equals(targetUser)) {
            if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getName())) {
                targetUser = authentication.getName();
            }
        }
        log.info("[MyInfoController] getMyInfo requested - targetUser: {} (param: {}, auth: {})", 
                targetUser, username, authentication != null ? authentication.getName() : "null");
        
        MyInfoResponse response = myInfoService.getMyInfoByUsername(targetUser);
        return ResponseEntity.ok(response);
    }
}
