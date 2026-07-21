package com.example.newsAIAgents.service;

import java.util.Map;

public interface StockService {
    /**
     * 특정 주식 종목의 상세 정보(현재가, 등락률 등)를 조회합니다.
     */
    Map<String, Object> getStockInfo(String symbol);

    /**
     * 특정 주식 종목의 차트 데이터(시간대별 시세 리스트)를 조회합니다.
     */
    Map<String, Object> getStockChart(String symbol, String range, String interval);
}
