package com.example.scrap.repository;

import com.example.scrap.domain.FavoriteStock;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FavoriteStockRepository extends JpaRepository<FavoriteStock, Long> {
    List<FavoriteStock> findByUserId(Long userId);
    Optional<FavoriteStock> findByUserIdAndStockCode(Long userId, String stockCode);
    boolean existsByUserIdAndStockCode(Long userId, String stockCode);
    void deleteByUserId(Long userId);
}
