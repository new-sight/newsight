package com.example.newsmap.service;

import com.example.auth.domain.User;
import com.example.auth.repository.UserRepository;
import com.example.newsmap.domain.NewsScrap;
import com.example.newsmap.repository.NewsScrapRepository;
import com.example.newsmap.response.ScrapToggleResponse;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NewsScrapService {

    private final NewsScrapRepository newsScrapRepository;
    private final UserRepository userRepository;

    @Transactional
    public ScrapToggleResponse toggleScrap(String newsId, String loginId) {
        User user = userRepository.findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        Optional<NewsScrap> existing = newsScrapRepository.findByNewsIdAndUser_Id(newsId, user.getId());
        if (existing.isPresent()) {
            newsScrapRepository.delete(existing.get());
            return new ScrapToggleResponse(false);
        }
        newsScrapRepository.save(NewsScrap.builder().newsId(newsId).user(user).build());
        return new ScrapToggleResponse(true);
    }
}
