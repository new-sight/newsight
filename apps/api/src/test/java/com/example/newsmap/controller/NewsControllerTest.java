package com.example.newsmap.controller;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.newsmap.domain.Category;
import com.example.newsmap.domain.Country;
import com.example.newsmap.response.NewsItemResponse;
import com.example.newsmap.response.NewsListResponse;
import com.example.newsmap.service.NewsService;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringBootConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(NewsController.class)
class NewsControllerTest {

    @SpringBootConfiguration
    @ComponentScan
    static class TestConfig {
    }

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private NewsService newsService;

    @Test
    void passesCountryAndCategoryQueryParamsToService() throws Exception {
        when(newsService.getNewsList(Country.JAPAN, Category.BUSINESS, 0, 20)).thenReturn(
                new NewsListResponse(List.of(
                        new NewsItemResponse("e38acf8c-03ee-5c32-8bbe-c73f124ca383", "title", "source", Country.JAPAN,
                                Category.BUSINESS, LocalDateTime.parse("2026-07-21T10:06:00"),
                                "https://example.com/news/1")
                ), 0, 20, 1)
        );

        mockMvc.perform(get("/api/news/list").param("country", "JAPAN").param("category", "BUSINESS"))
                .andExpect(status().isOk());

        verify(newsService).getNewsList(Country.JAPAN, Category.BUSINESS, 0, 20);
    }

    @Test
    void allowsMissingFiltersToPassNulls() throws Exception {
        when(newsService.getNewsList(null, null, 0, 20)).thenReturn(new NewsListResponse(List.of(), 0, 20, 0));

        mockMvc.perform(get("/api/news/list")).andExpect(status().isOk());

        verify(newsService).getNewsList(null, null, 0, 20);
    }
}
