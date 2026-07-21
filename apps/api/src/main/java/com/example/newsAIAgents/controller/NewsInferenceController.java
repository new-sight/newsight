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

    /**
     * 캐시를 우회하고 Neo4j와 LLM을 즉시 호출하여 브리핑을 강제 생성 및 갱신한 결과를 즉시 반환합니다.
     * 예: GET /api/news/briefing/force
     */
    @GetMapping(value = "/briefing/force", produces = org.springframework.http.MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> forceGenerateStockBriefing() {
        String briefingResult = newsInferenceService.doGenerateBriefing();
        return ResponseEntity.ok(briefingResult);
    }

    /**
     * Neo4j에서 일주일치 연결된 데이터를 가져와 알고리즘 없이 Ollama를 통해 직접 4개 트랙 형식의 분석 보고서를 생성합니다.
     * 예: GET /api/news/briefing/weekly-llm
     */
    @GetMapping(value = "/briefing/weekly-llm", produces = org.springframework.http.MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getWeeklyBriefingWithoutAlgorithm() {
        String briefingResult = newsInferenceService.generateWeeklyBriefingWithoutAlgorithm();
        return ResponseEntity.ok(briefingResult);
    }

    /**
     * 특정 주식코드와 관련된 뉴스 ID 리스트를 Neo4j에서 조회합니다.
     * 예: GET /api/news/list/AAPL
     */
    @GetMapping("/list/{stockCode}")
    public ResponseEntity<java.util.List<String>> getNewsIdsByStockCode(
            @org.springframework.web.bind.annotation.PathVariable("stockCode") String stockCode) {
        java.util.List<String> newsIds = newsInferenceService.getNewsIdsByStockCode(stockCode);
        return ResponseEntity.ok(newsIds);
    }
}
