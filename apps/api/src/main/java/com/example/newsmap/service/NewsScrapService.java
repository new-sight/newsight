package com.example.newsmap.service;

import com.example.auth.domain.User;
import com.example.auth.repository.UserRepository;
import com.example.newsmap.domain.NewsScrap;
import com.example.newsmap.repository.NewsScrapRepository;
import com.example.newsmap.repository.NewsArticleRepository;
import com.example.scrap.response.ScrapNewsResponse;
import java.util.List;
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
    private final NewsArticleRepository newsArticleRepository;

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

    @Transactional(readOnly = true)
    public List<ScrapNewsResponse> getMyScraps(String loginId) {
        User user = userRepository.findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        return newsScrapRepository.findByUser_IdOrderByCreatedAtDesc(user.getId()).stream()
                .flatMap(scrap -> newsArticleRepository.findById(scrap.getNewsId()).stream()
                        .map(article -> ScrapNewsResponse.builder()
                                .id(article.getId())
                                .title(article.getTitle())
                                .link(article.getLink())
                                .source(article.getSource())
                                .tags(article.getTags())
                                .publishedAt(article.getPublishedAt() != null ? article.getPublishedAt().toString() : null)
                                .scrappedAt(scrap.getCreatedAt() != null ? scrap.getCreatedAt().toString() : null)
                                .build()))
                .toList();
    }

    @Transactional
    public void removeScrap(String newsId, String loginId) {
        User user = userRepository.findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        NewsScrap scrap = newsScrapRepository.findByNewsIdAndUser_Id(newsId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("스크랩한 뉴스가 없습니다."));
        newsScrapRepository.delete(scrap);
    }
}
