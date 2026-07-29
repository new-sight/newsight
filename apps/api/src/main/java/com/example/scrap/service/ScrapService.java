package com.example.scrap.service;

import com.example.auth.domain.User;
import com.example.auth.repository.UserRepository;
import com.example.newsmap.domain.NewsArticle;
import com.example.newsmap.repository.NewsArticleRepository;
import com.example.scrap.domain.FavoriteStock;
import com.example.scrap.domain.Scrap;
import com.example.scrap.repository.FavoriteStockRepository;
import com.example.scrap.repository.ScrapRepository;
import com.example.scrap.response.FavoriteStockResponse;
import com.example.scrap.response.ScrapNewsResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ScrapService {

    private final ScrapRepository scrapRepository;
    private final FavoriteStockRepository favoriteStockRepository;
    private final UserRepository userRepository;
    private final NewsArticleRepository newsArticleRepository;

    // =========================
    // 뉴스 스크랩 추가
    // =========================
    public void addScrap(Long userId, String newsId) {
        if (scrapRepository.existsByUserIdAndNewsArticleId(userId, newsId)) {
            throw new IllegalArgumentException("이미 스크랩한 뉴스입니다.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        NewsArticle newsArticle = newsArticleRepository.findById(newsId)
                .orElseThrow(() -> new IllegalArgumentException("뉴스를 찾을 수 없습니다."));

        Scrap scrap = Scrap.builder()
                .user(user)
                .newsArticle(newsArticle)
                .build();

        scrapRepository.save(scrap);
    }

    // =========================
    // 뉴스 스크랩 삭제
    // =========================
    public void deleteScrap(Long userId, String newsId) {
        Scrap scrap = scrapRepository
                .findByUserIdAndNewsArticleId(userId, newsId)
                .orElseThrow(() -> new IllegalArgumentException("스크랩 정보가 없습니다."));

        scrapRepository.delete(scrap);
    }

    // =========================
    // 내 스크랩 뉴스 조회
    // =========================
    @Transactional(readOnly = true)
    public List<ScrapNewsResponse> getMyScraps(Long userId) {
        return scrapRepository.findByUserId(userId)
                .stream()
                .map(scrap ->
                        ScrapNewsResponse.builder()
                                .id(scrap.getNewsArticle().getId())
                                .title(scrap.getNewsArticle().getTitle())
                                .link(scrap.getNewsArticle().getLink())
                                .source(scrap.getNewsArticle().getSource())
                                .tags(scrap.getNewsArticle().getTags())
                                .publishedAt(
                                        scrap.getNewsArticle().getPublishedAt() != null
                                                ? scrap.getNewsArticle().getPublishedAt().toString()
                                                : null
                                )
                                .scrappedAt(
                                        scrap.getCreatedAt() != null
                                                ? scrap.getCreatedAt().toString()
                                                : null
                                )
                                .build()
                )
                .toList();
    }

    // =========================
    // 관심 종목 추가
    // =========================
    public void addFavoriteStock(Long userId, String stockCode) {
        if (favoriteStockRepository.existsByUserIdAndStockCode(userId, stockCode)) {
            throw new IllegalArgumentException("이미 등록한 종목입니다.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        FavoriteStock favoriteStock = FavoriteStock.builder()
                .user(user)
                .stockCode(stockCode)
                .build();

        favoriteStockRepository.save(favoriteStock);
    }

    // =========================
    // 관심 종목 삭제
    // =========================
    public void removeFavoriteStock(Long userId, String stockCode) {
        FavoriteStock favoriteStock = favoriteStockRepository
                .findByUserIdAndStockCode(userId, stockCode)
                .orElseThrow(() -> new IllegalArgumentException("관심 종목이 없습니다."));

        favoriteStockRepository.delete(favoriteStock);
    }

    // =========================
    // 관심 종목 조회
    // =========================
    @Transactional(readOnly = true)
    public List<FavoriteStockResponse> getFavoriteStocks(Long userId) {
        return favoriteStockRepository.findByUserId(userId)
                .stream()
                .map(stock ->
                        FavoriteStockResponse.builder()
                                .stockCode(stock.getStockCode())
                                .korName(stock.getStockCode())
                                .companyName(stock.getStockCode())
                                .createdAt(
                                        stock.getCreatedAt() != null
                                                ? stock.getCreatedAt().toString()
                                                : null
                                )
                                .build()
                )
                .toList();
    }
}