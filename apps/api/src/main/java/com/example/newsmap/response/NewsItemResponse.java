package com.example.newsmap.response;

import com.example.newsmap.domain.Category;
import com.example.newsmap.domain.Country;
import com.example.newsmap.domain.NewsArticle;
import java.time.LocalDateTime;

public record NewsItemResponse(
        String newsId,
        String title,
        String source,
        Country country,
        Category category,
        LocalDateTime publishedAt,
        String link
) {
    public static NewsItemResponse from(NewsArticle article) {
        return new NewsItemResponse(
                article.getId(),
                article.getTitle(),
                article.getSource(),
                article.getCountry(),
                article.getCategory(),
                article.getPublishedAt(),
                article.getLink()
        );
    }
}
