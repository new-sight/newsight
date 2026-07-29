package com.example.newsmap.repository;

import com.example.newsmap.domain.Category;
import com.example.newsmap.domain.Country;
import com.example.newsmap.domain.NewsArticle;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NewsArticleRepository extends JpaRepository<NewsArticle, String> {

    @Query("""
        SELECT n FROM NewsArticle n
        WHERE (:countries IS NULL OR n.country IN :countries)
          AND (:categories IS NULL OR n.category IN :categories)
        ORDER BY n.publishedAt DESC
        """)
    Page<NewsArticle> findByFilters(@Param("countries") List<Country> countries, @Param("categories") List<Category> categories, Pageable pageable);
}
