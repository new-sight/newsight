package com.example.newsmap.repository;

import com.example.newsmap.domain.NewsScrap;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NewsScrapRepository extends JpaRepository<NewsScrap, Long> {

    Optional<NewsScrap> findByNewsIdAndUser_Id(String newsId, Long userId);

    List<NewsScrap> findByUser_IdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT s.newsId FROM NewsScrap s WHERE s.user.id = :userId AND s.newsId IN :newsIds")
    Set<String> findScrappedNewsIds(@Param("userId") Long userId, @Param("newsIds") List<String> newsIds);

    void deleteByUser_Id(Long userId);
}
