package com.example.newsmap.repository;

import com.example.newsmap.domain.Category;
import com.example.newsmap.domain.Country;
import com.example.newsmap.domain.NewsArticle;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NewsArticleRepository extends JpaRepository<NewsArticle, String> {

    @Query("""
        SELECT n FROM NewsArticle n
        WHERE (:country IS NULL OR n.country = :country)
          AND (:category IS NULL OR n.category = :category)
        ORDER BY n.publishedAt DESC
        """)
    Page<NewsArticle> findByFilters(@Param("country") Country country, @Param("category") Category category, Pageable pageable);
}
