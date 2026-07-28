package com.example.newsAIAgents.controller;

import com.example.newsAIAgents.domain.NewsEntity;
import com.example.newsAIAgents.service.NewsInferenceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "뉴스 AI 추론 API", description = "Neo4j 지식 그래프 및 LLM 기반 뉴스 추론/주간 브리핑 API")
@RestController
@RequestMapping("/api/news")
@RequiredArgsConstructor
public class NewsInferenceController {

    private final NewsInferenceService newsInferenceService;


    @Operation(summary = "주간 주식 브리핑 보고서 생성", description = "지식 그래프 정보를 바탕으로 주간 시장/주식 브리핑 보고서를 생성합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "브리핑 생성 성공", content = @Content(schema = @Schema(implementation = String.class)))
    })
    @GetMapping(value = "/briefing", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getWeeklyBriefing() {
        String briefingResult = newsInferenceService.generateWeeklyBriefingWithoutAlgorithm();
        return ResponseEntity.ok(briefingResult);
    }

    @Operation(summary = "종목별 뉴스 상세 목록 조회", description = "특정 주식코드와 연관된 뉴스 기사 상세 리스트를 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "뉴스 리스트 조회 성공", content = @Content(array = @ArraySchema(schema = @Schema(implementation = NewsEntity.class))))
    })
    @GetMapping("/list/{stockCode}")
    public ResponseEntity<List<NewsEntity>> getNewsDetailsByStockCode(
            @Parameter(description = "주식 티커 코드 (예: AAPL, NVDA, 005930)", example = "AAPL")
            @PathVariable("stockCode") String stockCode) {
        List<NewsEntity> newsList = newsInferenceService.getNewsDetailsByStockCode(stockCode);
        return ResponseEntity.ok(newsList);
    }

    @Operation(summary = "관심 종목 뉴스 목록 조회", description = "여러 관심 주식코드 쿼리 파라미터 리스트와 연관된 뉴스 기사 상세 리스트를 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "뉴스 리스트 조회 성공", content = @Content(array = @ArraySchema(schema = @Schema(implementation = NewsEntity.class))))
    })
    @GetMapping({"/api/v1/users/favorite/stock/newsList"})
    public ResponseEntity<List<NewsEntity>> getFavoriteStockNewsList(
            @Parameter(description = "주식 티커 코드 리스트 (쉼표 구문)", example = "AAPL,NVDA")
            @RequestParam(value = "stockCodes", required = false) List<String> stockCodes) {
        List<NewsEntity> newsList = newsInferenceService.getNewsDetailsByStockCodes(stockCodes);
        return ResponseEntity.ok(newsList);
    }

    @Operation(summary = "다중 종목 뉴스 상세 목록 조회 (POST)", description = "여러 주식코드 리스트와 연관된 뉴스 기사 상세 리스트를 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "뉴스 리스트 조회 성공", content = @Content(array = @ArraySchema(schema = @Schema(implementation = NewsEntity.class))))
    })
    @PostMapping("/list/batch")
    public ResponseEntity<List<NewsEntity>> getNewsDetailsByStockCodes(
            @RequestBody List<String> stockCodes) {
        List<NewsEntity> newsList = newsInferenceService.getNewsDetailsByStockCodes(stockCodes);
        return ResponseEntity.ok(newsList);
    }
}
