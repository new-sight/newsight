package com.example.demo.mapnews;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NewsArticleRepository extends JpaRepository<NewsArticle, Long> {

    @Query("""
        SELECT n FROM NewsArticle n
        WHERE (:country IS NULL OR n.country = :country)
          AND (:category IS NULL OR n.category = :category)
        ORDER BY n.publishedAt DESC
        """)
    List<NewsArticle> findByFilters(@Param("country") Country country, @Param("category") Category category);

    long countByCollectedAtGreaterThanEqual(LocalDateTime startOfDay);

    long countByAnalyzedAtGreaterThanEqual(LocalDateTime startOfDay);
}
