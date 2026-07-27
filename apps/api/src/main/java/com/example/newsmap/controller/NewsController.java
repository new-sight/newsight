package com.example.newsmap.controller;

import com.example.newsmap.domain.Category;
import com.example.newsmap.domain.Country;
import com.example.newsmap.response.NewsListResponse;
import com.example.newsmap.service.NewsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "뉴스 조회 API", description = "국가별/카테고리별 뉴스 목록 및 페이징 조회 API")
@RestController
@RequestMapping("/api/news")
@RequiredArgsConstructor
public class NewsController {

    private final NewsService newsService;

    @Operation(summary = "뉴스 목록 페이징 조회", description = "국가(country) 및 카테고리(category) 조건으로 뉴스 목록을 페이징 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "뉴스 목록 조회 성공")
    })
    @GetMapping("/list")
    public NewsListResponse getNewsList(
            @Parameter(description = "국가 필터 (예: KOREA, USA)", example = "KOREA")
            @RequestParam(required = false) Country country,
            @Parameter(description = "카테고리 필터 (예: TECHNOLOGY, BUSINESS)", example = "TECHNOLOGY")
            @RequestParam(required = false) Category category,
            @Parameter(description = "페이지 번호 (0부터 시작)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "페이지 당 항목 수", example = "20")
            @RequestParam(defaultValue = "20") int size
    ) {
        return newsService.getNewsList(country, category, page, size);
    }
}
