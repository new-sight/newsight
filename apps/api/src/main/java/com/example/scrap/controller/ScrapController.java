package com.example.scrap.controller;

import com.example.auth.domain.User;
import com.example.auth.repository.UserRepository;
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


    // 스크랩 추가
    @PostMapping("/news/{newsId}")
    public Map<String, Boolean> addScrap(
            Authentication authentication,
            @PathVariable String newsId
    ) {

        String loginId = authentication.getName();

        User user = userRepository.findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));


        scrapService.addScrap(user.getId(), newsId);


        return Map.of(
                "scrapped", true
        );
    }


    // 스크랩 삭제
    @DeleteMapping("/news/{newsId}")
    public Map<String, Boolean> deleteScrap(
            Authentication authentication,
            @PathVariable String newsId
    ) {

        String loginId = authentication.getName();

        User user = userRepository.findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));


        scrapService.deleteScrap(user.getId(), newsId);


        return Map.of(
                "scrapped", false
        );
    }


    // 내 스크랩 목록 조회
    @GetMapping("/news")
    public List<ScrapNewsResponse> getMyScraps(
            Authentication authentication
    ) {

        String loginId = authentication.getName();

        User user = userRepository.findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));


        return scrapService.getMyScraps(user.getId());
    }
}