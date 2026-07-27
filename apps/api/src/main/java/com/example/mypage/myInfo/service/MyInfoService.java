package com.example.mypage.myInfo.service;

import com.example.mypage.myInfo.dto.MyInfoResponse;

public interface MyInfoService {
    MyInfoResponse getMyInfoByUsername(String username);
}
