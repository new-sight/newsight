package com.example.demo.mapnews;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/news")
@RequiredArgsConstructor
public class NewsController {

    private final NewsService newsService;

    @GetMapping("/list")
    public NewsListResponse getNewsList(
            @RequestParam(required = false) Country country,
            @RequestParam(required = false) Category category
    ) {
        return newsService.getNewsList(country, category);
    }
}
