package com.example.newsmap.repository;

import com.example.newsmap.domain.Comment;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByNewsIdOrderByCreatedAtDesc(String newsId);

    @Query("SELECT c.newsId AS newsId, COUNT(c) AS cnt FROM Comment c WHERE c.newsId IN :newsIds GROUP BY c.newsId")
    List<NewsIdCount> countGroupByNewsIdIn(@Param("newsIds") List<String> newsIds);

    void deleteByUser_Id(Long userId);
}
