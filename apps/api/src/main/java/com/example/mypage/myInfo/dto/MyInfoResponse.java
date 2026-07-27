package com.example.mypage.myInfo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MyInfoResponse {
    private String loginId;
    private String username;
    private String email;
    private String phone;
    private String role;
    private String createdAt;
}
