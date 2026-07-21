package com.example.demo.mapnews;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.OffsetDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(NewsController.class)
class NewsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private NewsService newsService;

    @Test
    void passesCountryAndCategoryQueryParamsToService() throws Exception {
        when(newsService.getNewsList(Country.JAPAN, Category.BUSINESS)).thenReturn(
                new NewsListResponse(10, 10, List.of(
                        new NewsItemResponse(1234L, "title", "source", Country.JAPAN, "TOKYO",
                                Category.BUSINESS, OffsetDateTime.parse("2026-07-21T10:06:00+09:00"),
                                List.of("011200"))
                ))
        );

        mockMvc.perform(get("/api/news/list").param("country", "JAPAN").param("category", "BUSINESS"))
                .andExpect(status().isOk());

        verify(newsService).getNewsList(Country.JAPAN, Category.BUSINESS);
    }

    @Test
    void allowsMissingFiltersToPassNulls() throws Exception {
        when(newsService.getNewsList(null, null)).thenReturn(new NewsListResponse(0, 0, List.of()));

        mockMvc.perform(get("/api/news/list")).andExpect(status().isOk());

        verify(newsService).getNewsList(null, null);
    }
}
