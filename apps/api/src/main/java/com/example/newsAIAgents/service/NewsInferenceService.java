package com.example.newsAIAgents.service;

import java.util.List;
import com.example.newsAIAgents.domain.NewsEntity;

public interface NewsInferenceService {

    /**
     * Neo4j 지식 그래프에서 최근 뉴스의 태그 매핑 데이터를 조회하고, 
     * 이를 LLM(Gemma 4)의 지식 컨텍스트로 전달하여 지능형 추론 결과를 생성합니다.
     */
    String inferRecentNewsTrend(String userQuery);

    /**
     * Neo4j 지식 그래프에서 최근 7일(일주일) 동안 수집된 모든 뉴스, 관련 태그, 태그 간의 연결(관계), 
     * 그리고 관련 주식 데이터를 조회하여 Ollama LLM을 통해 기존 4개 트랙 형식의 브리핑 보고서를 생성합니다.
     */
    String generateWeeklyBriefingWithoutAlgorithm();


    /**
     * 특정 주식코드와 관련된 뉴스 ID 리스트를 Neo4j에서 조회합니다.
     */
    List<String> getNewsIdsByStockCode(String stockCode);

    /**
     * 특정 주식코드와 관련된 뉴스 목록을 Neo4j에서 ID로 찾은 후, PostgreSQL(JPA)에서 세부 정보를 조회합니다.
     */
    List<NewsEntity> getNewsDetailsByStockCode(String stockCode);
}
