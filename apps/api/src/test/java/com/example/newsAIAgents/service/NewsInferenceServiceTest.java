package com.example.newsAIAgents.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.neo4j.core.Neo4jClient;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class NewsInferenceServiceTest {

    @Mock
    private OllamaCloudService ollamaCloudService;

    @Mock(answer = org.mockito.Answers.RETURNS_DEEP_STUBS)
    private Neo4jClient neo4jClient;

    @InjectMocks
    private NewsInferenceService newsInferenceService;

    @Mock
    private org.springframework.data.redis.core.StringRedisTemplate redisTemplate;

    @org.mockito.Spy
    private tools.jackson.databind.ObjectMapper objectMapper = new tools.jackson.databind.ObjectMapper();

    @Mock
    private org.springframework.data.redis.core.ValueOperations<String, String> valueOperations;

    @org.junit.jupiter.api.BeforeEach
    void setUp() {
        lenient().when(redisTemplate.opsForValue()).thenReturn(valueOperations);
    }

    @Test
    void testGenerateStockBriefing_whenAllTracksAreEmpty() throws Exception {
        // Stub for Track 1 (no bind)
        when(neo4jClient.query(anyString()).fetch().all())
                .thenReturn(Collections.emptyList());

        // Stub for Tracks 2, 3, 4 (with bind)
        when(neo4jClient.query(anyString())
                .bind(anyList()).to(anyString())
                .fetch().all())
                .thenReturn(Collections.emptyList());

        String result = newsInferenceService.generateStockBriefing();

        Map<String, Object> resultMap = objectMapper.readValue(result, Map.class);
        org.junit.jupiter.api.Assertions.assertNotNull(resultMap.get("created_at"));
        assertEquals(List.of(), resultMap.get("track1"));
        assertEquals(List.of(), resultMap.get("track2"));
        assertEquals(List.of(), resultMap.get("track3"));
        assertEquals(List.of(), resultMap.get("track4"));
        
        verify(ollamaCloudService, never()).queryGemma4ForReasoning(anyString());
    }

    @Test
    void testGenerateStockBriefing_withResults() {
        Map<String, Object> track1Stock = Map.of(
                "stockName", "Apple",
                "ticker", "AAPL",
                "totalScore", 5.0,
                "foreignNewsTitles", List.of("Apple Good News"),
                "domesticNewsTitles", List.of("애플 호재")
        );
        Map<String, Object> track2Stock = Map.of(
                "stockName", "Samsung",
                "ticker", "005930",
                "totalScore", 4.0,
                "uniqueTitles", List.of("Samsung Partner Good News")
        );
        Map<String, Object> track3Stock = Map.of(
                "stockName", "Tesla",
                "ticker", "TSLA",
                "totalScore", 6.0,
                "newsTitles", List.of("Tesla Bad News")
        );
        Map<String, Object> track4Stock = Map.of(
                "stockName", "Intel",
                "ticker", "INTC",
                "totalScore", 3.0,
                "uniqueTitles", List.of("Intel Industry Bad News")
        );

        // Track 1
        when(neo4jClient.query(contains("lang_code IN")).fetch().all())
                .thenReturn(List.of(track1Stock));

        // Track 2
        when(neo4jClient.query(contains("/* 경로 1: 산업 낙수효과 */"))
                .bind(anyList()).to(eq("excludeTickers"))
                .fetch().all())
                .thenReturn(List.of(track2Stock));

        // Track 3
        when(neo4jClient.query(contains("n.sentimentScore < -0.4"))
                .bind(anyList()).to(eq("excludeTickers"))
                .fetch().all())
                .thenReturn(List.of(track3Stock));

        // Track 4
        when(neo4jClient.query(contains("/* 경로 1: 산업 악재 낙수효과 */"))
                .bind(anyList()).to(eq("excludeTickers"))
                .fetch().all())
                .thenReturn(List.of(track4Stock));

        String expectedBriefing = "Mocked LLM Briefing Output";
        when(ollamaCloudService.queryGemma4ForReasoning(anyString())).thenReturn(expectedBriefing);

        String result = newsInferenceService.generateStockBriefing();

        assertEquals(expectedBriefing, result);
        
        verify(ollamaCloudService, times(1)).queryGemma4ForReasoning(argThat(prompt -> 
            prompt.contains("Apple") && prompt.contains("AAPL") &&
            prompt.contains("Samsung") && prompt.contains("005930") &&
            prompt.contains("Tesla") && prompt.contains("TSLA") &&
            prompt.contains("Intel") && prompt.contains("INTC") &&
            prompt.contains("track3") && prompt.contains("track4")
        ));
    }

    @Test
    void testGenerateStockBriefing_retrievesFromCache() throws Exception {
        String cachedJson = "{\"created_at\":\"" + java.time.LocalDateTime.now().toString() + "\",\"track1\":[],\"track2\":[],\"track3\":[],\"track4\":[]}";
        when(valueOperations.get(anyString())).thenReturn(cachedJson);

        String result = newsInferenceService.generateStockBriefing();

        assertEquals(cachedJson, result);
        verify(neo4jClient, never()).query(anyString());
        verify(ollamaCloudService, never()).queryGemma4ForReasoning(anyString());
    }

    @Test
    void testGenerateStockBriefing_regeneratesWhenCacheExpired() throws Exception {
        java.time.LocalDateTime expiredTime = java.time.LocalDateTime.now().minusMinutes(35);
        String cachedJson = "{\"created_at\":\"" + expiredTime.toString() + "\",\"track1\":[],\"track2\":[],\"track3\":[],\"track4\":[]}";
        
        when(valueOperations.get(anyString())).thenReturn(cachedJson);
        when(valueOperations.setIfAbsent(eq("stock_briefing:revalidating"), eq("true"), any(java.time.Duration.class))).thenReturn(true);

        when(neo4jClient.query(anyString()).fetch().all()).thenReturn(Collections.emptyList());
        when(neo4jClient.query(anyString()).bind(anyList()).to(anyString()).fetch().all()).thenReturn(Collections.emptyList());

        String result = newsInferenceService.generateStockBriefing();

        // Stale 캐시를 즉시 반환해야 함
        assertEquals(cachedJson, result);
        
        // 비동기 작업이 기동되어 결국 Neo4j 지식 그래프를 쿼리해야 함
        verify(neo4jClient, timeout(1000).atLeastOnce()).query(anyString());
    }

    @Test
    void testGenerateStockBriefing_cleansMarkdownWrappedJson() throws Exception {
        when(valueOperations.get(anyString())).thenReturn(null);

        Map<String, Object> track1Stock = Map.of(
                "stockName", "Apple",
                "ticker", "AAPL",
                "totalScore", 5.0,
                "foreignNewsTitles", List.of("Apple Good News"),
                "domesticNewsTitles", List.of("애플 호재")
        );

        when(neo4jClient.query(contains("lang_code IN")).fetch().all()).thenReturn(List.of(track1Stock));
        when(neo4jClient.query(contains("/* 경로 1: 산업 낙수효과 */")).bind(anyList()).to(eq("excludeTickers")).fetch().all()).thenReturn(Collections.emptyList());
        when(neo4jClient.query(contains("n.sentimentScore < -0.4")).bind(anyList()).to(eq("excludeTickers")).fetch().all()).thenReturn(Collections.emptyList());
        when(neo4jClient.query(contains("/* 경로 1: 산업 악재 낙수효과 */")).bind(anyList()).to(eq("excludeTickers")).fetch().all()).thenReturn(Collections.emptyList());

        String llmOutput = "```json\n{\n  \"track1\": [{\"stock\": \"Apple(AAPL)\", \"reason\": \"good\"}],\n  \"track2\": [],\n  \"track3\": [],\n  \"track4\": []\n}\n```";
        when(ollamaCloudService.queryGemma4ForReasoning(anyString())).thenReturn(llmOutput);

        String result = newsInferenceService.generateStockBriefing();

        Map<String, Object> resultMap = objectMapper.readValue(result, Map.class);
        org.junit.jupiter.api.Assertions.assertNotNull(resultMap.get("created_at"));
        
        List<?> track1List = (List<?>) resultMap.get("track1");
        org.junit.jupiter.api.Assertions.assertEquals(1, track1List.size());
        Map<?, ?> stockMap = (Map<?, ?>) track1List.get(0);
        assertEquals("Apple(AAPL)", stockMap.get("stock"));
        assertEquals("good", stockMap.get("reason"));
    }

    @Test
    void testGenerateWeeklyBriefingWithoutAlgorithm_whenEmpty() throws Exception {
        when(neo4jClient.query(anyString()).fetch().all())
                .thenReturn(Collections.emptyList());

        String result = newsInferenceService.generateWeeklyBriefingWithoutAlgorithm();

        Map<String, Object> resultMap = objectMapper.readValue(result, Map.class);
        org.junit.jupiter.api.Assertions.assertNotNull(resultMap.get("created_at"));
        assertEquals(List.of(), resultMap.get("track1"));
        assertEquals(List.of(), resultMap.get("track2"));
        assertEquals(List.of(), resultMap.get("track3"));
        assertEquals(List.of(), resultMap.get("track4"));

        verify(ollamaCloudService, never()).queryGemma4ForReasoning(anyString());
    }

    @Test
    void testGenerateWeeklyBriefingWithoutAlgorithm_withResults() throws Exception {
        Map<String, Object> mockRow = new java.util.HashMap<>();
        mockRow.put("newsTitle", "NVIDIA M4 Competitor");
        mockRow.put("newsSummary", "NVIDIA introduces new chip to compete with Apple");
        mockRow.put("sentimentScore", 0.85);
        mockRow.put("tagName", "NVIDIA");
        mockRow.put("relationType", "COMPETE_WITH");
        mockRow.put("relatedTagName", "Apple");
        mockRow.put("stockName", "NVIDIA Corp");
        mockRow.put("stockTicker", "NVDA");

        when(neo4jClient.query(contains("duration('P1D')")).fetch().all())
                .thenReturn(List.of(mockRow));
        when(neo4jClient.query(contains("duration('P7D')")).fetch().all())
                .thenReturn(Collections.emptyList());

        String expectedLlmResponse = "{\n" +
                "  \"track1\": [{\"stock\": \"NVIDIA Corp(NVDA)\", \"reason\": \"nvda details\"}],\n" +
                "  \"track2\": [],\n" +
                "  \"track3\": [],\n" +
                "  \"track4\": []\n" +
                "}";

        when(ollamaCloudService.queryGemma4ForReasoning(anyString())).thenReturn(expectedLlmResponse);

        String result = newsInferenceService.generateWeeklyBriefingWithoutAlgorithm();

        Map<String, Object> resultMap = objectMapper.readValue(result, Map.class);
        org.junit.jupiter.api.Assertions.assertNotNull(resultMap.get("created_at"));

        List<?> track1List = (List<?>) resultMap.get("track1");
        org.junit.jupiter.api.Assertions.assertEquals(1, track1List.size());
        Map<?, ?> stockMap = (Map<?, ?>) track1List.get(0);
        assertEquals("NVIDIA Corp(NVDA)", stockMap.get("stock"));
        assertEquals("nvda details", stockMap.get("reason"));

        verify(ollamaCloudService, times(1)).queryGemma4ForReasoning(argThat(prompt ->
                prompt.contains("NVIDIA M4 Competitor") &&
                prompt.contains("COMPETE_WITH") &&
                prompt.contains("NVDA")
        ));
    }
}
