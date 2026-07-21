package com.example.newsAIAgents.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "news")
@Getter
@Setter
@NoArgsConstructor
public class NewsEntity {

    @Id
    @Column(length = 36)
    private String id; // UUID String (Python에서 전달하는 ID와 동일하게 매핑)

    @Column(nullable = false, length = 500)
    private String title; // 번역된 한글 제목

    @Column(name = "original_title", length = 500)
    private String originalTitle; // 원본 RSS 뉴스 제목

    @Column(columnDefinition = "TEXT")
    private String summary; // 한글 요약문

    @Column(length = 1000)
    private String link; // 원본 기사 URL

    @com.fasterxml.jackson.annotation.JsonProperty("created_at")
    @Column(name = "created_at")
    private LocalDateTime createdAt; // 수집 및 분석 완료 생성 시간

    @Column(columnDefinition = "TEXT")
    private String tags; // 태그 목록 (쉼표 구분 문자열)

    @com.fasterxml.jackson.annotation.JsonProperty("published_at")
    @Column(name = "published_at")
    private LocalDateTime publishedAt; // 뉴스 발행일

    @com.fasterxml.jackson.annotation.JsonProperty("sentiment_score")
    @Column(name = "sentiment_score")
    private Double sentimentScore; // 감성 분석 점수

    @Column(length = 255)
    private String source; // 뉴스 출처

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
