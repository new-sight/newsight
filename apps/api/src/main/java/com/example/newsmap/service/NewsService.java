package com.example.newsmap.service;

import com.example.auth.domain.User;
import com.example.auth.repository.UserRepository;
import com.example.newsmap.domain.Category;
import com.example.newsmap.domain.Country;
import com.example.newsmap.domain.NewsArticle;
import com.example.newsmap.repository.CommentRepository;
import com.example.newsmap.repository.NewsArticleRepository;
import com.example.newsmap.repository.NewsIdCount;
import com.example.newsmap.repository.NewsLikeRepository;
import com.example.newsmap.response.NewsItemResponse;
import com.example.newsmap.response.NewsListResponse;
import java.util.List;
import java.util.Map;
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
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;

    public NewsListResponse getNewsList(Country country, Category category, int page, int size, String loginId) {
        Page<NewsArticle> result = newsArticleRepository.findByFilters(country, category, PageRequest.of(page, size));
        List<String> newsIds = result.getContent().stream().map(NewsArticle::getId).toList();

        if (newsIds.isEmpty()) {
            return new NewsListResponse(List.of(), page, size, result.getTotalElements());
        }

        Map<String, Long> likeCounts = toCountMap(newsLikeRepository.countGroupByNewsIdIn(newsIds));
        Map<String, Long> commentCounts = toCountMap(commentRepository.countGroupByNewsIdIn(newsIds));
        Set<String> likedNewsIds = resolveLikedNewsIds(loginId, newsIds);

        List<NewsItemResponse> news = result.getContent().stream()
                .map(article -> NewsItemResponse.from(
                        article,
                        likeCounts.getOrDefault(article.getId(), 0L),
                        commentCounts.getOrDefault(article.getId(), 0L),
                        likedNewsIds.contains(article.getId())
                ))
                .toList();

        return new NewsListResponse(news, page, size, result.getTotalElements());
    }

    private Set<String> resolveLikedNewsIds(String loginId, List<String> newsIds) {
        if (loginId == null) {
            return Set.of();
        }
        return userRepository.findByLoginId(loginId)
                .map(User::getId)
                .map(userId -> newsLikeRepository.findLikedNewsIds(userId, newsIds))
                .orElse(Set.of());
    }

    private Map<String, Long> toCountMap(List<NewsIdCount> counts) {
        return counts.stream().collect(Collectors.toMap(NewsIdCount::getNewsId, NewsIdCount::getCnt));
    }
}
