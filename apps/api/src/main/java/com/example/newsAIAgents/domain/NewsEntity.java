package com.example.newsAIAgents.domain;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Schema(description = "뉴스 기사 정보 엔티티 DTO")
@Entity
@Table(name = "news")
@Getter
@Setter
@NoArgsConstructor
public class NewsEntity {

    @Schema(description = "뉴스 식별자 (UUID)", example = "a1b2c3d4-e5f6-7890-abcd-ef1234567890")
    @Id
    @Column(length = 36)
    private String id;

    @Schema(description = "번역된 한글 제목", example = "애플, 차세대 AI 칩셋 발표하며 주가 상승")
    @Column(nullable = false, length = 500)
    private String title;

    @Schema(description = "원본 뉴스 제목", example = "Apple Unveils Next-Gen AI Chipset, Stock Rallies")
    @Column(name = "original_title", length = 500)
    private String originalTitle;

    @Schema(description = "한글 요약문", example = "애플이 새로운 AI 칩셋을 공개하며 시장의 주목을 받고 있습니다.")
    @Column(columnDefinition = "TEXT")
    private String summary;

    @Schema(description = "원본 기사 URL", example = "https://example.com/news/12345")
    @Column(length = 1000)
    private String link;

    @Schema(description = "수집 및 분석 완료 생성 시간", example = "2026-07-27T10:00:00")
    @com.fasterxml.jackson.annotation.JsonProperty("created_at")
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Schema(description = "태그 목록 (쉼표 구분)", example = "Apple,AI,Stock")
    @Column(columnDefinition = "TEXT")
    private String tags;

    @Schema(description = "뉴스 발행 일시", example = "2026-07-27T09:30:00")
    @com.fasterxml.jackson.annotation.JsonProperty("published_at")
    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @Schema(description = "감성 분석 점수 (-1.0 ~ 1.0)", example = "0.85")
    @com.fasterxml.jackson.annotation.JsonProperty("sentiment_score")
    @Column(name = "sentiment_score")
    private Double sentimentScore;

    @Schema(description = "뉴스 출처", example = "Reuters")
    @Column(length = 255)
    private String source;

    @Schema(description = "발행 국가", example = "KOREA")
    @Column(length = 100)
    private String country;

    @Schema(description = "뉴스 카테고리", example = "TECHNOLOGY")
    @Column(length = 100)
    private String category;

    public NewsEntity(String id, String title, String originalTitle, String summary, String link, LocalDateTime createdAt, String tags, LocalDateTime publishedAt, Double sentimentScore, String source) {
        this.id = id;
        this.title = title;
        this.originalTitle = originalTitle;
        this.summary = summary;
        this.link = link;
        this.createdAt = createdAt;
        this.tags = tags;
        this.publishedAt = publishedAt;
        this.sentimentScore = sentimentScore;
        this.source = source;
    }
}
