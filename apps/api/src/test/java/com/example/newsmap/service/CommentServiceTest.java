package com.example.newsmap.service;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.example.auth.domain.User;
import com.example.auth.repository.UserRepository;
import com.example.newsmap.domain.Comment;
import com.example.newsmap.repository.CommentRepository;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CommentServiceTest {

    @Mock
    private CommentRepository commentRepository;

    @Mock
    private UserRepository userRepository;

    private CommentService commentService;

    @BeforeEach
    void setUp() {
        commentService = new CommentService(commentRepository, userRepository);
    }

    private static Comment commentOwnedBy(String loginId) {
        User owner = User.builder().id(1L).loginId(loginId).username("작성자").build();
        return Comment.builder().id(5L).newsId("news-1").user(owner).content("본문").build();
    }

    @Test
    void deletesCommentWhenRequesterIsAuthor() {
        Comment comment = commentOwnedBy("author123");
        when(commentRepository.findById(5L)).thenReturn(Optional.of(comment));

        commentService.deleteComment(5L, "author123");

        verify(commentRepository).delete(comment);
    }

    @Test
    void rejectsDeleteWhenRequesterIsNotAuthor() {
        Comment comment = commentOwnedBy("author123");
        when(commentRepository.findById(5L)).thenReturn(Optional.of(comment));

        assertThatThrownBy(() -> commentService.deleteComment(5L, "someone-else"))
                .isInstanceOf(IllegalArgumentException.class);

        verifyNoInteractions(userRepository);
    }
}
