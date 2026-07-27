package com.example.scrap.service;

import com.example.auth.domain.User;
import com.example.auth.repository.UserRepository;
import com.example.newsmap.domain.NewsArticle;
import com.example.newsmap.repository.NewsArticleRepository;
import com.example.scrap.domain.Scrap;
import com.example.scrap.repository.ScrapRepository;
import com.example.scrap.response.ScrapNewsResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ScrapService {

    private final ScrapRepository scrapRepository;
    private final UserRepository userRepository;
    private final NewsArticleRepository newsArticleRepository;

    public void addScrap(Long userId, String newsId) {

        if (scrapRepository.existsByUserIdAndNewsArticleId(userId, newsId)) {
            return;
        }

        User user = userRepository.findById(userId)
                .orElseThrow();

        NewsArticle news = newsArticleRepository.findById(newsId)
                .orElseThrow();

        Scrap scrap = Scrap.builder()
                .user(user)
                .newsArticle(news)
                .build();

        scrapRepository.save(scrap);
    }

    public void deleteScrap(Long userId, String newsId) {

        Scrap scrap = scrapRepository
                .findByUserIdAndNewsArticleId(userId, newsId)
                .orElseThrow();

        scrapRepository.delete(scrap);
    }

   public List<ScrapNewsResponse> getMyScraps(Long userId) {

    return scrapRepository.findByUserId(userId)
            .stream()
            .map(scrap -> ScrapNewsResponse.builder()
                    .id(scrap.getNewsArticle().getId())
                    .title(scrap.getNewsArticle().getTitle())
                    .link(scrap.getNewsArticle().getLink())
                    .source(scrap.getNewsArticle().getSource())
                    .tags(scrap.getNewsArticle().getTags())
                    .publishedAt(
                            scrap.getNewsArticle().getPublishedAt() == null
                                    ? null
                                    : scrap.getNewsArticle().getPublishedAt().toString()
                    )
                    .scrappedAt(
                            scrap.getCreatedAt() == null
                                    ? null
                                    : scrap.getCreatedAt().toString()
                    )
                    .build())
            .toList();
        }
}