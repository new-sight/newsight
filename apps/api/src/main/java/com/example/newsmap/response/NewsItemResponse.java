package com.example.newsmap.response;

import com.example.newsmap.domain.Category;
import com.example.newsmap.domain.Country;
import com.example.newsmap.domain.NewsArticle;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

public record NewsItemResponse(
        String newsId,
        String title,
        String source,
        Country country,
        Category category,
        LocalDateTime publishedAt,
        String link,
        List<String> tags
) {
    public static NewsItemResponse from(NewsArticle article) {
        return new NewsItemResponse(
                article.getId(),
                article.getTitle(),
                article.getSource(),
                article.getCountry(),
                article.getCategory(),
                article.getPublishedAt(),
                article.getLink(),
                splitTags(article.getTags())
        );
    }

    private static List<String> splitTags(String tags) {
        if (tags == null || tags.isBlank()) {
            return List.of();
        }
        return Arrays.stream(tags.split(","))
                .map(t -> t.trim())
                .filter(t -> !t.isEmpty())
                .toList();
    }
}
