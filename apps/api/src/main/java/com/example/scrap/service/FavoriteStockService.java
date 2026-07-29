package com.example.scrap.service;

import com.example.auth.domain.User;
import com.example.auth.repository.UserRepository;
import com.example.scrap.domain.FavoriteStock;
import com.example.scrap.repository.FavoriteStockRepository;
import com.example.scrap.response.FavoriteStockResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FavoriteStockService {

    private final FavoriteStockRepository favoriteStockRepository;
    private final UserRepository userRepository;

    @Transactional
    public void addFavoriteStock(Long userId, String stockCode) {
        if (stockCode == null || stockCode.isBlank()) {
            throw new IllegalArgumentException("주식 코드가 유효하지 않습니다.");
        }

        String upperStockCode = stockCode.trim().toUpperCase();

        if (favoriteStockRepository.existsByUserIdAndStockCode(userId, upperStockCode)) {
            return;
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        FavoriteStock favoriteStock = FavoriteStock.builder()
                .user(user)
                .stockCode(upperStockCode)
                .build();

        favoriteStockRepository.save(favoriteStock);
    }

    @Transactional
    public void deleteFavoriteStock(Long userId, String stockCode) {
        if (stockCode == null || stockCode.isBlank()) {
            return;
        }

        String upperStockCode = stockCode.trim().toUpperCase();
        favoriteStockRepository.deleteByUserIdAndStockCode(userId, upperStockCode);
    }

    public List<FavoriteStockResponse> getMyFavoriteStocks(Long userId) {
        return favoriteStockRepository.findByUserId(userId)
                .stream()
                .map(fs -> FavoriteStockResponse.builder()
                        .stockCode(fs.getStockCode())
                        .createdAt(fs.getCreatedAt() != null ? fs.getCreatedAt().toString() : null)
                        .build())
                .toList();
    }

    public boolean isFavoriteStock(Long userId, String stockCode) {
        if (stockCode == null || stockCode.isBlank()) {
            return false;
        }
        return favoriteStockRepository.existsByUserIdAndStockCode(userId, stockCode.trim().toUpperCase());
    }
}
