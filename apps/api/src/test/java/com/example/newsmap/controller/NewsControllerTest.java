package com.example.newsmap.controller;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.newsmap.domain.Category;
import com.example.newsmap.domain.Country;
import com.example.newsmap.response.CommentResponse;
import com.example.newsmap.response.LikeToggleResponse;
import com.example.newsmap.response.NewsItemResponse;
import com.example.newsmap.response.NewsListResponse;
import com.example.newsmap.response.ScrapToggleResponse;
import com.example.newsmap.service.CommentService;
import com.example.newsmap.service.NewsLikeService;
import com.example.newsmap.service.NewsScrapService;
import com.example.newsmap.service.NewsService;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringBootConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
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

    @MockitoBean
    private CommentService commentService;

    @MockitoBean
    private NewsLikeService newsLikeService;

    @MockitoBean
    private NewsScrapService newsScrapService;

    @Test
    void passesCountryAndCategoryQueryParamsToService() throws Exception {
        when(newsService.getNewsList(List.of(Country.JAPAN), List.of(Category.BUSINESS), 0, 20, null)).thenReturn(
                new NewsListResponse(List.of(
                        new NewsItemResponse("e38acf8c-03ee-5c32-8bbe-c73f124ca383", "title", "source", Country.JAPAN,
                                Category.BUSINESS, LocalDateTime.parse("2026-07-21T10:06:00"),
                                "https://example.com/news/1", List.of("Samsung Electronics", "SK Hynix"),
                                0, 0, false, false)
                ), 0, 20, 1)
        );

        mockMvc.perform(get("/api/news/list").param("country", "JAPAN").param("category", "BUSINESS"))
                .andExpect(status().isOk());

        verify(newsService).getNewsList(List.of(Country.JAPAN), List.of(Category.BUSINESS), 0, 20, null);
    }

    @Test
    void passesMultipleCountryAndCategoryQueryParamsToService() throws Exception {
        when(newsService.getNewsList(List.of(Country.JAPAN, Country.KOREA), List.of(Category.BUSINESS, Category.TECHNOLOGY), 0, 20, null))
                .thenReturn(new NewsListResponse(List.of(), 0, 20, 0));

        mockMvc.perform(get("/api/news/list")
                        .param("country", "JAPAN", "KOREA")
                        .param("category", "BUSINESS", "TECHNOLOGY"))
                .andExpect(status().isOk());

        verify(newsService).getNewsList(List.of(Country.JAPAN, Country.KOREA), List.of(Category.BUSINESS, Category.TECHNOLOGY), 0, 20, null);
    }

    @Test
    void allowsMissingFiltersToPassNulls() throws Exception {
        when(newsService.getNewsList(null, null, 0, 20, null)).thenReturn(new NewsListResponse(List.of(), 0, 20, 0));

        mockMvc.perform(get("/api/news/list")).andExpect(status().isOk());

        verify(newsService).getNewsList(null, null, 0, 20, null);
    }

    @Test
    void getCommentsReturnsListFromService() throws Exception {
        when(commentService.getComments("news-1", null)).thenReturn(List.of());

        mockMvc.perform(get("/api/news/news-1/comments")).andExpect(status().isOk());

        verify(commentService).getComments("news-1", null);
    }

    @Test
    void postCommentUsesAuthenticatedLoginId() throws Exception {
        when(commentService.addComment("news-1", "hong123", "good article")).thenReturn(
                new CommentResponse(1L, "홍길동", "good article", LocalDateTime.parse("2026-07-27T10:00:00"), true)
        );

        try {
            SecurityContextHolder.getContext().setAuthentication(
                    new UsernamePasswordAuthenticationToken("hong123", null, List.of()));

            mockMvc.perform(post("/api/news/news-1/comments")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"content\":\"good article\"}"))
                    .andExpect(status().isCreated());
        } finally {
            SecurityContextHolder.clearContext();
        }

        verify(commentService).addComment("news-1", "hong123", "good article");
    }

    @Test
    void toggleLikeUsesAuthenticatedLoginId() throws Exception {
        when(newsLikeService.toggleLike("news-1", "hong123")).thenReturn(new LikeToggleResponse(true, 3));

        try {
            SecurityContextHolder.getContext().setAuthentication(
                    new UsernamePasswordAuthenticationToken("hong123", null, List.of()));

            mockMvc.perform(post("/api/news/news-1/like")).andExpect(status().isOk());
        } finally {
            SecurityContextHolder.clearContext();
        }

        verify(newsLikeService).toggleLike("news-1", "hong123");
    }

    @Test
    void deleteCommentUsesAuthenticatedLoginId() throws Exception {
        try {
            SecurityContextHolder.getContext().setAuthentication(
                    new UsernamePasswordAuthenticationToken("hong123", null, List.of()));

            mockMvc.perform(delete("/api/news/news-1/comments/5")).andExpect(status().isNoContent());
        } finally {
            SecurityContextHolder.clearContext();
        }

        verify(commentService).deleteComment(5L, "hong123");
    }

    @Test
    void toggleScrapUsesAuthenticatedLoginId() throws Exception {
        when(newsScrapService.toggleScrap("news-1", "hong123")).thenReturn(new ScrapToggleResponse(true));

        try {
            SecurityContextHolder.getContext().setAuthentication(
                    new UsernamePasswordAuthenticationToken("hong123", null, List.of()));

            mockMvc.perform(post("/api/news/news-1/scrap")).andExpect(status().isOk());
        } finally {
            SecurityContextHolder.clearContext();
        }

        verify(newsScrapService).toggleScrap("news-1", "hong123");
    }
}
