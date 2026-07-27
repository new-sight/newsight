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
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
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

@Tag(name = "뉴스 조회 API", description = "국가별/카테고리별 뉴스 목록 및 페이징 조회 API")
@RestController
@RequestMapping("/api/news")
@RequiredArgsConstructor
public class NewsController {

    private final NewsService newsService;
    private final CommentService commentService;
    private final NewsLikeService newsLikeService;
    private final NewsScrapService newsScrapService;

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
