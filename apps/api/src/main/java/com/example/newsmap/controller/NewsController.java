package com.example.newsmap.controller;

import com.example.newsmap.domain.Category;
import com.example.newsmap.domain.Country;
import com.example.newsmap.response.CommentResponse;
import com.example.newsmap.response.LikeToggleResponse;
import com.example.newsmap.response.NewsListResponse;
import com.example.newsmap.response.ScrapToggleResponse;
import com.example.newsmap.service.CommentService;
import com.example.newsmap.service.NewsLikeService;
import com.example.newsmap.service.NewsScrapService;
import com.example.newsmap.service.NewsService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/news")
@RequiredArgsConstructor
public class NewsController {

    private final NewsService newsService;
    private final CommentService commentService;
    private final NewsLikeService newsLikeService;
    private final NewsScrapService newsScrapService;

    @GetMapping("/list")
    public NewsListResponse getNewsList(
            @RequestParam(required = false) Country country,
            @RequestParam(required = false) Category category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return newsService.getNewsList(country, category, page, size, currentLoginId());
    }

    @GetMapping("/{newsId}/comments")
    public List<CommentResponse> getComments(@PathVariable String newsId) {
        return commentService.getComments(newsId, currentLoginId());
    }

    @PostMapping("/{newsId}/comments")
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable String newsId,
            @RequestBody CommentRequest request
    ) {
        CommentResponse response = commentService.addComment(newsId, currentLoginId(), request.content());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/{newsId}/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable String newsId,
            @PathVariable Long commentId
    ) {
        commentService.deleteComment(commentId, currentLoginId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{newsId}/like")
    public LikeToggleResponse toggleLike(@PathVariable String newsId) {
        return newsLikeService.toggleLike(newsId, currentLoginId());
    }

    @PostMapping("/{newsId}/scrap")
    public ScrapToggleResponse toggleScrap(@PathVariable String newsId) {
        return newsScrapService.toggleScrap(newsId, currentLoginId());
    }


    private String currentLoginId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            return null;
        }
        return authentication.getName();
    }

    public record CommentRequest(String content) {
    }
}
