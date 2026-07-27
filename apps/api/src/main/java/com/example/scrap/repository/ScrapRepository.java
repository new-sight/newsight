package com.example.scrap.repository;

import com.example.scrap.domain.Scrap;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ScrapRepository extends JpaRepository<Scrap, Long> {

    List<Scrap> findByUserId(Long userId);

    Optional<Scrap> findByUserIdAndNewsArticleId(Long userId, String newsId);

    boolean existsByUserIdAndNewsArticleId(Long userId, String newsId);
}