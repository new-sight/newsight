package com.example.newsmap.service;

import com.example.auth.repository.UserRepository;
import com.example.newsmap.domain.Category;
import com.example.newsmap.domain.Country;
import com.example.newsmap.domain.NewsArticle;
import com.example.newsmap.repository.CommentRepository;
import com.example.newsmap.repository.NewsArticleRepository;
import com.example.newsmap.repository.NewsIdCount;
import com.example.newsmap.repository.NewsLikeRepository;
import com.example.newsmap.repository.NewsScrapRepository;
import com.example.newsmap.response.NewsItemResponse;
import com.example.newsmap.response.NewsListResponse;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NewsService {

    private final NewsArticleRepository newsArticleRepository;
    private final NewsLikeRepository newsLikeRepository;
    private final NewsScrapRepository newsScrapRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;

    public NewsListResponse getNewsList(Country country, Category category, int page, int size, String loginId) {
        Page<NewsArticle> result = newsArticleRepository.findByFilters(country, category, PageRequest.of(page, size));
        List<String> newsIds = result.getContent().stream()
                .filter(Objects::nonNull)
                .map(article -> article.getId())
                .filter(Objects::nonNull)
                .toList();

        if (newsIds.isEmpty()) {
            return new NewsListResponse(List.of(), page, size, result.getTotalElements());
        }

        Map<String, Long> likeCounts = toCountMap(newsLikeRepository.countGroupByNewsIdIn(newsIds));
        Map<String, Long> commentCounts = toCountMap(commentRepository.countGroupByNewsIdIn(newsIds));
        Long currentUserId = resolveUserId(loginId);
        Set<String> likedNewsIds = currentUserId == null
                ? Set.of() : newsLikeRepository.findLikedNewsIds(currentUserId, newsIds);
        Set<String> scrappedNewsIds = currentUserId == null
                ? Set.of() : newsScrapRepository.findScrappedNewsIds(currentUserId, newsIds);

        List<NewsItemResponse> news = result.getContent().stream()
                .map(article -> NewsItemResponse.from(
                        article,
                        likeCounts.getOrDefault(article.getId(), 0L),
                        commentCounts.getOrDefault(article.getId(), 0L),
                        likedNewsIds.contains(article.getId()),
                        scrappedNewsIds.contains(article.getId())
                ))
                .toList();

        return new NewsListResponse(news, page, size, result.getTotalElements());
    }

    private Long resolveUserId(String loginId) {
        if (loginId == null) {
            return null;
        }
        return userRepository.findByLoginId(loginId).map(user -> user.getId()).orElse(null);
    }

    private Map<String, Long> toCountMap(List<NewsIdCount> counts) {
        return counts.stream().collect(Collectors.toMap(c -> c.getNewsId(), c -> c.getCnt()));
    }
}
