package com.example.newsmap.response;

import com.example.newsmap.domain.Comment;
import java.time.LocalDateTime;

public record CommentResponse(
        Long id,
        String username,
        String content,
        LocalDateTime createdAt,
        boolean mine
) {
    public static CommentResponse from(Comment comment, boolean mine) {
        return new CommentResponse(
                comment.getId(),
                comment.getUser().getUsername(),
                comment.getContent(),
                comment.getCreatedAt(),
                mine
        );
    }
}
