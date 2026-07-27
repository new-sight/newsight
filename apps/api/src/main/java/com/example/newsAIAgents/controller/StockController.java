package com.example.newsAIAgents.controller;

import com.example.newsAIAgents.service.StockService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@Tag(name = "주식 정보 API", description = "Yahoo Finance 연동 주식 기본 정보 및 차트 데이터 API")
@RestController
@RequiredArgsConstructor
public class StockController {

    private final StockService stockService;

    @Operation(summary = "주식 기본 정보 조회", description = "Yahoo Finance API를 통해 특정 주식 티커의 요약 시세 및 기업 정보를 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "주식 정보 조회 성공")
    })
    @GetMapping("/api/stock/info/{stockCode}")
    public Map<String, Object> getStockInfo(
            @Parameter(description = "주식 티커 코드 (예: AAPL, NVDA, TSLA)", example = "AAPL")
            @PathVariable String stockCode) {
        return stockService.getStockInfo(stockCode);
    }

    @Operation(summary = "주식 차트 시세 데이터 조회", description = "조회 기간 및 간격 조건에 맞춰 주식 차트용 과거 시세 데이터를 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "차트 데이터 조회 성공")
    })
    @GetMapping("/api/stock/info/chart/{stockCode}")
    public Map<String, Object> getStockChart(
            @Parameter(description = "주식 티커 코드 (예: AAPL, TSLA)", example = "AAPL")
            @PathVariable String stockCode,
            @Parameter(description = "조회 기간 (예: 1d, 5d, 1mo, 6mo, 1y, ytd)", example = "1mo")
            @RequestParam(value = "range", defaultValue = "1mo") String range,
            @Parameter(description = "데이터 간격 (예: 1m, 5m, 1d, 1wk)", example = "1d")
            @RequestParam(value = "interval", defaultValue = "1d") String interval) {
        return stockService.getStockChart(stockCode, range, interval);
    }
}
