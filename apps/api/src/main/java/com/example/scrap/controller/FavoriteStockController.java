package com.example.scrap.controller;

import com.example.auth.domain.User;
import com.example.auth.repository.UserRepository;
import com.example.scrap.response.FavoriteStockResponse;
import com.example.scrap.service.FavoriteStockService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/scraps/stocks")
@RequiredArgsConstructor
public class FavoriteStockController {

    private final FavoriteStockService favoriteStockService;
    private final UserRepository userRepository;

    // 관심 주식 추가
    @PostMapping("/{stockCode}")
    public Map<String, Boolean> addFavoriteStock(
            Authentication authentication,
            @PathVariable String stockCode
    ) {
        User user = getUser(authentication);
        favoriteStockService.addFavoriteStock(user.getId(), stockCode);
        return Map.of("favorite", true);
    }

    // 관심 주식 삭제
    @DeleteMapping("/{stockCode}")
    public Map<String, Boolean> deleteFavoriteStock(
            Authentication authentication,
            @PathVariable String stockCode
    ) {
        User user = getUser(authentication);
        favoriteStockService.deleteFavoriteStock(user.getId(), stockCode);
        return Map.of("favorite", false);
    }

    // 내 관심 주식 목록 조회
    @GetMapping
    public List<FavoriteStockResponse> getMyFavoriteStocks(
            Authentication authentication
    ) {
        User user = getUser(authentication);
        return favoriteStockService.getMyFavoriteStocks(user.getId());
    }

    // 관심 주식 여부 확인
    @GetMapping("/{stockCode}/check")
    public Map<String, Boolean> checkFavoriteStock(
            Authentication authentication,
            @PathVariable String stockCode
    ) {
        User user = getUser(authentication);
        boolean isFavorite = favoriteStockService.isFavoriteStock(user.getId(), stockCode);
        return Map.of("favorite", isFavorite);
    }

    private User getUser(Authentication authentication) {
        String loginId = authentication.getName();
        return userRepository.findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
    }
}
