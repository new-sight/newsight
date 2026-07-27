package com.example.scrap.controller;

import com.example.auth.domain.User;
import com.example.auth.repository.UserRepository;
import com.example.scrap.response.ScrapNewsResponse;
import com.example.scrap.service.ScrapService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/scraps")
@RequiredArgsConstructor
public class ScrapController {

    private final ScrapService scrapService;
    private final UserRepository userRepository;

    @PostMapping("/news/{newsId}")
    public void addScrap(
            Authentication authentication,
            @PathVariable String newsId
    ) {

        System.out.println("===== ScrapController 진입 =====");
        System.out.println(authentication);

        String loginId = authentication.getName();

        User user = userRepository.findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        scrapService.addScrap(user.getId(), newsId);
    }

    @DeleteMapping("/news/{newsId}")
    public void deleteScrap(
            Authentication authentication,
            @PathVariable String newsId
    ) {

        String loginId = authentication.getName();

        User user = userRepository.findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        scrapService.deleteScrap(user.getId(), newsId);
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
}