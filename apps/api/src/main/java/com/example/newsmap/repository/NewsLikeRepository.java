package com.example.newsmap.repository;

import com.example.newsmap.domain.NewsLike;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NewsLikeRepository extends JpaRepository<NewsLike, Long> {

    Optional<NewsLike> findByNewsIdAndUser_Id(String newsId, Long userId);

    long countByNewsId(String newsId);

    @Query("SELECT l.newsId AS newsId, COUNT(l) AS cnt FROM NewsLike l WHERE l.newsId IN :newsIds GROUP BY l.newsId")
    List<NewsIdCount> countGroupByNewsIdIn(@Param("newsIds") List<String> newsIds);

    @Query("SELECT l.newsId FROM NewsLike l WHERE l.user.id = :userId AND l.newsId IN :newsIds")
    Set<String> findLikedNewsIds(@Param("userId") Long userId, @Param("newsIds") List<String> newsIds);
}
