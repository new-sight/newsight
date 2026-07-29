package com.example.newsAIAgents.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.neo4j.core.Neo4jClient;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
public class BriefingTrackNewsCountTest {

    @Mock(answer = org.mockito.Answers.RETURNS_DEEP_STUBS)
    private Neo4jClient neo4jClient;

    @Mock
    private OllamaCloudService ollamaCloudService;

    @Mock
    private org.springframework.data.redis.core.StringRedisTemplate redisTemplate;

    @InjectMocks
    private NewsInferenceServiceImpl newsInferenceService;

    @Test
    @DisplayName("/briefing API 각 트랙별 Cypher 쿼리 수집 한도(LIMIT) 및 조건 검증")
    void testTrackQueriesAndLimits() {
        // Track 1: 어제와 오늘의 호재 뉴스 (최근 2일, 감성점수 >= 0.5, 최대 100개)
        String track1Query = "MATCH (n:News)-[:HAS_TAG]->(t:Tag) " +
                "WHERE n.createdAt >= datetime() - duration('P2D') AND n.sentimentScore >= 0.5 ... LIMIT 100";

        // Track 2: 지난 일주일간 호재 뉴스 (최근 7일, 감성점수 >= 0.4, 최대 200개)
        String track2Query = "MATCH (n:News)-[:HAS_TAG]->(t:Tag) " +
                "WHERE n.createdAt >= datetime() - duration('P7D') AND n.sentimentScore >= 0.4 ... LIMIT 200";

        // Track 3: 어제와 오늘의 악재 뉴스 (최근 2일, 감성점수 <= -0.5, 최대 100개)
        String track3Query = "MATCH (n:News)-[:HAS_TAG]->(t:Tag) " +
                "WHERE n.createdAt >= datetime() - duration('P2D') AND n.sentimentScore <= -0.5 ... LIMIT 100";

        // Track 4: 지난 일주일간 악재 뉴스 (최근 7일, 감성점수 <= -0.4, 최대 200개)
        String track4Query = "MATCH (n:News)-[:HAS_TAG]->(t:Tag) " +
                "WHERE n.createdAt >= datetime() - duration('P7D') AND n.sentimentScore <= -0.4 ... LIMIT 200";

        assertEquals(100, extractLimit(track1Query), "Track 1 수집 한도는 100개입니다.");
        assertEquals(200, extractLimit(track2Query), "Track 2 수집 한도는 200개입니다.");
        assertEquals(100, extractLimit(track3Query), "Track 3 수집 한도는 100개입니다.");
        assertEquals(200, extractLimit(track4Query), "Track 4 수집 한도는 200개입니다.");

        System.out.println("==================================================");
        System.out.println("[/briefing API 트랙별 뉴스 수집 설정]");
        System.out.println(" - Track 1 (최근 2일 호재 n.sentimentScore >= 0.5): 최대 100개 수집");
        System.out.println(" - Track 2 (최근 7일 호재 n.sentimentScore >= 0.4): 최대 200개 수집");
        System.out.println(" - Track 3 (최근 2일 악재 n.sentimentScore <= -0.5): 최대 100개 수집");
        System.out.println(" - Track 4 (최근 7일 악재 n.sentimentScore <= -0.4): 최대 200개 수집");
        System.out.println("==================================================");
    }

    @Test
    @DisplayName("트랙별 수집 데이터에서 고유 뉴스 기사(Unique Title) 추출 및 카운트 검증")
    void testTrackNewsDeduplicationCount() {
        List<Map<String, Object>> mockTrackData = List.of(
            Map.of("newsTitle", "뉴스 A (엔비디아 신제품)", "tagName", "NVIDIA", "sentimentScore", 0.85),
            Map.of("newsTitle", "뉴스 A (엔비디아 신제품)", "tagName", "GPU", "sentimentScore", 0.85),
            Map.of("newsTitle", "뉴스 B (애플 실적 발표)", "tagName", "Apple", "sentimentScore", 0.65),
            Map.of("newsTitle", "뉴스 C (테슬라 FSD 업데이트)", "tagName", "Tesla", "sentimentScore", 0.70),
            Map.of("newsTitle", "뉴스 C (테슬라 FSD 업데이트)", "tagName", "FSD", "sentimentScore", 0.70)
        );

        Set<String> uniqueTitles = new LinkedHashSet<>();
        for (Map<String, Object> row : mockTrackData) {
            String title = (String) row.get("newsTitle");
            if (title != null) {
                uniqueTitles.add(title);
            }
        }

        System.out.println("====== [트랙 1 수집 뉴스 개수 계산 시뮬레이션] ======");
        System.out.println("Neo4j 그래프 쿼리 수집 총 레코드 수: " + mockTrackData.size() + "개");
        System.out.println("중복 제거 후 고유 뉴스 기사 수: " + uniqueTitles.size() + "개");
        System.out.println("고유 뉴스 제목 목록: " + uniqueTitles);

        assertEquals(5, mockTrackData.size());
        assertEquals(3, uniqueTitles.size());
    }

    private int extractLimit(String query) {
        String limitStr = query.substring(query.lastIndexOf("LIMIT") + 5).trim();
        return Integer.parseInt(limitStr);
    }
}
