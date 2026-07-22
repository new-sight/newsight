package com.example.newsmap.response;

import java.util.List;

public record NewsListResponse(
        List<NewsItemResponse> news,
        int page,
        int size,
        long totalCount
) {
}
