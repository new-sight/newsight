package com.example.demo.mapnews;

import java.time.OffsetDateTime;
import java.util.List;

public record NewsItemResponse(
        Long newsId,
        String title,
        String source,
        Country country,
        String city,
        Category category,
        OffsetDateTime publishedAt,
        List<String> relatedStocks
) {
    static NewsItemResponse from(NewsArticle article) {
        return new NewsItemResponse(
                article.getId(),
                article.getTitle(),
                article.getSource(),
                article.getCountry(),
                article.getCity(),
                article.getCategory(),
                article.getPublishedAt(),
                article.getRelatedStocks()
        );
    }
}
