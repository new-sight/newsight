package com.example.newsAIAgents.controller;

import com.example.newsAIAgents.service.NewsInferenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/news")
@RequiredArgsConstructor
public class NewsInferenceController {

    private final NewsInferenceService newsInferenceService;

    /**
     * Neo4j 지식 그래프 정보를 LLM에 컨텍스트로 전달하여 지능형 추론 결과를 조회합니다.
     * 예: GET /api/news/inference?query=최근의 기술 트렌드와 반도체 동향을 요약하고 추론해줘.
     */
    @GetMapping("/inference")
    public ResponseEntity<String> getNewsInference(
            @RequestParam(value = "query", defaultValue = "최근 뉴스들의 지식 그래프 맥락을 기반으로 전반적인 주요 시장 트렌드와 전망을 추론해줘.") String query) {
        
        String inferenceResult = newsInferenceService.inferRecentNewsTrend(query);
        return ResponseEntity.ok(inferenceResult);
    }

    /**
     * Neo4j 지식 그래프의 알고리즘 A, B, C 분석을 기반으로 주식 브리핑 보고서를 생성하여 반환합니다.
     * 예: GET /api/news/briefing
     */
    @GetMapping(value = "/briefing", produces = org.springframework.http.MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getStockBriefing() {
        String briefingResult = newsInferenceService.generateStockBriefing();
        return ResponseEntity.ok(briefingResult);
    }
}
