package com.example.scrap.controller;

import com.example.auth.domain.User;
import com.example.auth.repository.UserRepository;
import com.example.scrap.response.FavoriteStockResponse;
import com.example.scrap.response.ScrapNewsResponse;
import com.example.scrap.service.ScrapService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/scraps")
@RequiredArgsConstructor
public class ScrapController {

    private final ScrapService scrapService;
    private final UserRepository userRepository;


    // ===================== 뉴스 =====================

    @PostMapping("/news/{newsId}")
    public Map<String, Boolean> addScrap(
            Authentication authentication,
            @PathVariable String newsId
    ) {

        String loginId = authentication.getName();

        User user = userRepository.findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        scrapService.addScrap(user.getId(), newsId);

        return Map.of("scrapped", true);
    }


    @DeleteMapping("/news/{newsId}")
    public Map<String, Boolean> deleteScrap(
            Authentication authentication,
            @PathVariable String newsId
    ) {

        String loginId = authentication.getName();

        User user = userRepository.findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        scrapService.deleteScrap(user.getId(), newsId);

        return Map.of("scrapped", false);
    }


    @GetMapping("/news")
    public List<ScrapNewsResponse> getMyScraps(
            Authentication authentication
    ) {

        String loginId = authentication.getName();

        User user = userRepository.findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        return scrapService.getMyScraps(user.getId());
    }


    // ===================== 관심 종목 =====================

    @PostMapping("/stocks/{symbol}")
    public Map<String, Boolean> addFavoriteStock(
            Authentication authentication,
            @PathVariable String symbol
    ) {

        String loginId = authentication.getName();

        User user = userRepository.findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        scrapService.addFavoriteStock(user.getId(), symbol);

        return Map.of("starred", true);
    }


    @DeleteMapping("/stocks/{symbol}")
    public Map<String, Boolean> removeFavoriteStock(
            Authentication authentication,
            @PathVariable String symbol
    ) {

        String loginId = authentication.getName();

        User user = userRepository.findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        scrapService.removeFavoriteStock(user.getId(), symbol);

        return Map.of("starred", false);
    }


    @GetMapping("/stocks")
    public List<FavoriteStockResponse> getFavoriteStocks(
            Authentication authentication
    ) {

        String loginId = authentication.getName();

        User user = userRepository.findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        return scrapService.getFavoriteStocks(user.getId());
    }

}