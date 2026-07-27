package com.example.newsmap.service;

import com.example.auth.domain.User;
import com.example.auth.repository.UserRepository;
import com.example.newsmap.domain.Comment;
import com.example.newsmap.repository.CommentRepository;
import com.example.newsmap.response.CommentResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final UserRepository userRepository;

    public List<CommentResponse> getComments(String newsId, String loginId) {
        return commentRepository.findByNewsIdOrderByCreatedAtDesc(newsId).stream()
                .map(comment -> CommentResponse.from(comment, isMine(comment, loginId)))
                .toList();
    }

    @Transactional
    public CommentResponse addComment(String newsId, String loginId, String content) {
        if (content == null || content.isBlank()) {
            throw new IllegalArgumentException("댓글 내용을 입력해주세요.");
        }
        User user = userRepository.findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        Comment comment = commentRepository.save(
                Comment.builder().newsId(newsId).user(user).content(content).build()
        );
        return CommentResponse.from(comment, true);
    }

    @Transactional
    public void deleteComment(Long commentId, String loginId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 댓글입니다."));
        if (!isMine(comment, loginId)) {
            throw new IllegalArgumentException("본인이 작성한 댓글만 삭제할 수 있습니다.");
        }
        commentRepository.delete(comment);
    }

    private boolean isMine(Comment comment, String loginId) {
        return loginId != null && comment.getUser().getLoginId().equals(loginId);
    }
}
