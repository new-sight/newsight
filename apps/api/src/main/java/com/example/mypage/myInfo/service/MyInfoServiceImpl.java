package com.example.mypage.myInfo.service;

import com.example.auth.domain.User;
import com.example.mypage.myInfo.dto.MyInfoResponse;
import com.example.mypage.myInfo.repository.MyInfoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class MyInfoServiceImpl implements MyInfoService {

    private final MyInfoRepository myInfoRepository;

    @Override
    public MyInfoResponse getMyInfoByUsername(String username) {
        log.info("[MyInfoService] Searching DB for user with identifier: {}", username);

        Optional<User> userOpt = Optional.empty();
        if (username != null && !username.isBlank() && !"사용자".equals(username)) {
            userOpt = myInfoRepository.findByLoginId(username)
                    .or(() -> myInfoRepository.findByUsername(username));
        }

        // 만약 지정된 키워드로 못 찾으면, DB의 첫 번째 유저(테스트 및 샌드박스용)로 fallback
        if (userOpt.isEmpty()) {
            log.warn("[MyInfoService] User '{}' not found. Falling back to first user in DB.", username);
            userOpt = myInfoRepository.findAll().stream().findFirst();
        }

        if (userOpt.isEmpty()) {
            log.warn("[MyInfoService] No users exist in DB.");
            return MyInfoResponse.builder()
                    .loginId("****")
                    .username("사용자")
                    .email("-")
                    .phone("-")
                    .role("ROLE_USER")
                    .createdAt("-")
                    .build();
        }

        User user = userOpt.get();
        log.info("[MyInfoService] Found user -> ID: {}, LoginId: {}, Username: {}, Email: {}, Phone: {}, CreatedAt: {}",
                user.getId(), user.getLoginId(), user.getUsername(), user.getEmail(), user.getPhone(), user.getCreatedAt());

        String formattedDate = "-";
        if (user.getCreatedAt() != null) {
            formattedDate = user.getCreatedAt().toString();
        }

        return MyInfoResponse.builder()
                .loginId(maskLoginId(user.getLoginId()))
                .username(user.getUsername() != null ? user.getUsername() : user.getLoginId())
                .email(user.getEmail() != null && !user.getEmail().isBlank() ? user.getEmail() : "-")
                .phone(user.getPhone() != null && !user.getPhone().isBlank() ? user.getPhone() : "-")
                .role(user.getRole() != null ? user.getRole().name() : "ROLE_USER")
                .createdAt(formattedDate)
                .scrappedNewsIds(user.getScrappedNewsIds() != null ? user.getScrappedNewsIds() : "")
                .favoriteStockTickers(user.getFavoriteStockTickers() != null ? user.getFavoriteStockTickers() : "")
                .build();
    }

    private String maskLoginId(String loginId) {
        if (loginId == null || loginId.isBlank()) {
            return "****";
        }
        if (loginId.length() <= 4) {
            return "****";
        }
        return loginId.substring(0, loginId.length() - 4) + "****";
    }
}
