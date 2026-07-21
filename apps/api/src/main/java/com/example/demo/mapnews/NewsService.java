package com.example.demo.mapnews;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NewsService {

    private final NewsArticleRepository newsArticleRepository;

    public NewsListResponse getNewsList(Country country, Category category) {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();

        List<NewsItemResponse> news = newsArticleRepository.findByFilters(country, category).stream()
                .map(NewsItemResponse::from)
                .toList();

        return new NewsListResponse(
                (int) newsArticleRepository.countByCollectedAtGreaterThanEqual(startOfDay),
                (int) newsArticleRepository.countByAnalyzedAtGreaterThanEqual(startOfDay),
                news
        );
    }
}
