package com.example.scrap.repository;

import com.example.scrap.domain.FavoriteStock;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FavoriteStockRepository extends JpaRepository<FavoriteStock, Long> {

    boolean existsByUserIdAndStockCode(
            Long userId,
            String stockCode
    );

    Optional<FavoriteStock> findByUserIdAndStockCode(
            Long userId,
            String stockCode
    );

    List<FavoriteStock> findByUserId(
            Long userId
    );
}