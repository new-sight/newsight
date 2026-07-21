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
    private NewsInferenceServiceImpl newsInferenceService;

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

        when(neo4jClient.query(contains("sentimentScore >= 0.5")).fetch().all())
                .thenReturn(List.of(mockRow));
        when(neo4jClient.query(contains("sentimentScore >= 0.4")).fetch().all())
                .thenReturn(Collections.emptyList());
        when(neo4jClient.query(contains("sentimentScore <= -0.5")).fetch().all())
                .thenReturn(Collections.emptyList());
        when(neo4jClient.query(contains("sentimentScore <= -0.4")).fetch().all())
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
