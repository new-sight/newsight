package com.example.demo.mapnews;

import java.util.List;

public record NewsListResponse(
        int collectedToday,
        int analyzedToday,
        List<NewsItemResponse> news
) {
}
