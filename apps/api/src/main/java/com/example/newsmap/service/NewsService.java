package com.example.newsmap.service;

import com.example.newsmap.domain.Category;
import com.example.newsmap.domain.Country;
import com.example.newsmap.domain.NewsArticle;
import com.example.newsmap.repository.NewsArticleRepository;
import com.example.newsmap.response.NewsItemResponse;
import com.example.newsmap.response.NewsListResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NewsService {

    private final NewsArticleRepository newsArticleRepository;

    public NewsListResponse getNewsList(Country country, Category category, int page, int size) {
        Page<NewsArticle> result = newsArticleRepository.findByFilters(country, category, PageRequest.of(page, size));

        List<NewsItemResponse> news = result.getContent().stream()
                .map(NewsItemResponse::from)
                .toList();

        return new NewsListResponse(news, page, size, result.getTotalElements());
    }
}
