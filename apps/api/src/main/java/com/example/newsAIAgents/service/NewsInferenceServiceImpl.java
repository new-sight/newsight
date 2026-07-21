package com.example.newsAIAgents.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.data.redis.core.StringRedisTemplate;
import tools.jackson.databind.ObjectMapper;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class NewsInferenceServiceImpl implements NewsInferenceService {

    private final OllamaCloudService ollamaCloudService;
    private final org.springframework.data.neo4j.core.Neo4jClient neo4jClient;
    private final StringRedisTemplate redisTemplate;
    private final com.example.newsAIAgents.repository.NewsJpaRepository newsJpaRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String REDIS_KEY_WEEKLY_BRIEFING = "weekly_stock_briefing";

    @Override
    public String inferRecentNewsTrend(String userQuery) {
        log.info("[Graph RAG] Neo4j 지식 그래프 컨텍스트 조회 시작");
        
        // 1. Neo4j 에서 최근 3일간 수집된 뉴스와 연결된 태그 정보 조회
        String contextQuery = "MATCH (n:News) " +
                "WHERE n.createdAt >= datetime() - duration('P3D') " +
                "OPTIONAL MATCH (n)-[:HAS_TAG]->(t:Tag) " +
                "RETURN n.title AS title, n.summary AS summary, collect(t.name) AS tags " +
                "LIMIT 15";
        java.util.Collection<Map<String, Object>> graphContextRaw = neo4jClient.query(contextQuery)
                .fetch()
                .all();
        List<Map<String, Object>> graphContext = new java.util.ArrayList<>(graphContextRaw);
        
        if (graphContext == null || graphContext.isEmpty()) {
            log.warn("[Graph RAG] 최근 수집된 그래프 컨텍스트 데이터가 비어 있습니다.");
            return "최근 수집된 뉴스 데이터가 Neo4j 데이터베이스에 존재하지 않아 분석을 진행할 수 없습니다. 먼저 뉴스 수집 파이프라인을 실행해 주세요.";
        }

        // 2. 조회한 그래프 데이터를 LLM에 제공할 텍스트 포맷으로 포매팅
        StringBuilder contextBuilder = new StringBuilder();
        contextBuilder.append("=== [Neo4j 최근 뉴스 & 키워드 지식 그래프 컨텍스트] ===\n");
        
        for (int i = 0; i < graphContext.size(); i++) {
            Map<String, Object> node = graphContext.get(i);
            String title = (String) node.get("title");
            String summary = (String) node.get("summary");
            Object tagsObj = node.get("tags");
            
            contextBuilder.append(String.format("[%d] 뉴스 기사: %s\n", i + 1, title));
            contextBuilder.append(String.format("    - 요약: %s\n", summary));
            if (tagsObj instanceof List<?>) {
                contextBuilder.append(String.format("    - 연결된 그래프 마스터 태그: %s\n", tagsObj.toString()));
            }
            contextBuilder.append("\n");
        }

        // 3. 지식 그래프 컨텍스트와 사용자의 쿼리를 융합하여 추론용 최종 프롬프트 구성
        String prompt = String.format(
            "[System: You are an advanced AI News Analyst. Answer the user's inquiry based on the provided recent news knowledge graph context from Neo4j. Analyze the semantic relations between news articles and tags. Respond naturally and professionally in Korean.]\n\n" +
            "%s\n" +
            "[사용자 질문]\n" +
            "%s\n\n" +
            "위의 지식 그래프 데이터와 태그들의 연결 상태를 세밀히 분석하여, 단순한 나열이 아닌 기사들 간의 보이지 않는 인과관계, 시장 트렌드, 그리고 향후 영향에 대해 종합적으로 추론하여 상세한 분석 리포트 형식으로 답변해주세요.",
            contextBuilder.toString(),
            userQuery
        );

        log.info("[Graph RAG] Gemma 4 모델에 Graph RAG 추론 요청 전송");
        
        // 4. Ollama Cloud (Gemma 4) API 호출 및 결과 반환
        return ollamaCloudService.queryGemma4ForReasoning(prompt);
    }

    @Override
    public String generateWeeklyBriefingWithoutAlgorithm() {
        log.info("[Weekly LLM Briefing] Redis 캐시 확인 시도");
        String cachedBriefing = null;
        try {
            cachedBriefing = redisTemplate.opsForValue().get(REDIS_KEY_WEEKLY_BRIEFING);
            if (cachedBriefing != null) {
                log.info("[Weekly LLM Briefing] 유효한 Redis 캐시가 존재합니다. 캐시된 브리핑을 반환합니다.");
                return cachedBriefing;
            }
        } catch (Exception e) {
            log.warn("[Weekly LLM Briefing] Redis 캐시 읽기 실패", e);
        }

        log.info("[Weekly LLM Briefing] 각 트랙별 조건에 따른 Neo4j 지식 그래프 데이터 조회 시작");

        // 1. 쿼리 실행 및 데이터 수집
        // Track 1: 어제와 오늘의 호재 뉴스 (최근 2일 이내, 감성점수 >= 0.5)
        String track1Query = "MATCH (n:News)-[:HAS_TAG]->(t:Tag) " +
                "WHERE n.createdAt >= datetime() - duration('P2D') AND n.sentimentScore >= 0.5 " +
                "OPTIONAL MATCH (t)-[r:SUBSIDIARY_OF|SUPPLIES_TO|PARTNER_WITH|COMPETE_WITH|RELATED_TO]-(otherTag:Tag) " +
                "OPTIONAL MATCH (s:Stock) WHERE s.name = t.name OR s.kor_name = t.name OR s.name = otherTag.name OR s.kor_name = otherTag.name " +
                "RETURN n.title AS newsTitle, n.summary AS newsSummary, n.sentimentScore AS sentimentScore, " +
                "       t.name AS tagName, type(r) AS relationType, otherTag.name AS relatedTagName, " +
                "       coalesce(s.kor_name, s.name) AS stockName, s.ticker AS stockTicker " +
                "LIMIT 100";
        List<Map<String, Object>> track1Data = new java.util.ArrayList<>(neo4jClient.query(track1Query).fetch().all());

        // Track 2: 지난 일주일간 호재 뉴스 (최근 7일 이내, 감성점수 >= 0.4)
        String track2Query = "MATCH (n:News)-[:HAS_TAG]->(t:Tag) " +
                "WHERE n.createdAt >= datetime() - duration('P7D') AND n.sentimentScore >= 0.4 " +
                "OPTIONAL MATCH (t)-[r:SUBSIDIARY_OF|SUPPLIES_TO|PARTNER_WITH|COMPETE_WITH|RELATED_TO]-(otherTag:Tag) " +
                "OPTIONAL MATCH (s:Stock) WHERE s.name = t.name OR s.kor_name = t.name OR s.name = otherTag.name OR s.kor_name = otherTag.name " +
                "RETURN n.title AS newsTitle, n.summary AS newsSummary, n.sentimentScore AS sentimentScore, " +
                "       t.name AS tagName, type(r) AS relationType, otherTag.name AS relatedTagName, " +
                "       coalesce(s.kor_name, s.name) AS stockName, s.ticker AS stockTicker " +
                "LIMIT 100";
        List<Map<String, Object>> track2Data = new java.util.ArrayList<>(neo4jClient.query(track2Query).fetch().all());

        // Track 3: 어제와 오늘의 악재 뉴스 (최근 2일 이내, 감성점수 <= -0.5)
        String track3Query = "MATCH (n:News)-[:HAS_TAG]->(t:Tag) " +
                "WHERE n.createdAt >= datetime() - duration('P2D') AND n.sentimentScore <= -0.5 " +
                "OPTIONAL MATCH (t)-[r:SUBSIDIARY_OF|SUPPLIES_TO|PARTNER_WITH|COMPETE_WITH|RELATED_TO]-(otherTag:Tag) " +
                "OPTIONAL MATCH (s:Stock) WHERE s.name = t.name OR s.kor_name = t.name OR s.name = otherTag.name OR s.kor_name = otherTag.name " +
                "RETURN n.title AS newsTitle, n.summary AS newsSummary, n.sentimentScore AS sentimentScore, " +
                "       t.name AS tagName, type(r) AS relationType, otherTag.name AS relatedTagName, " +
                "       coalesce(s.kor_name, s.name) AS stockName, s.ticker AS stockTicker " +
                "LIMIT 100";
        List<Map<String, Object>> track3Data = new java.util.ArrayList<>(neo4jClient.query(track3Query).fetch().all());

        // Track 4: 지난 일주일간 악재 뉴스 (최근 7일 이내, 감성점수 <= -0.4)
        String track4Query = "MATCH (n:News)-[:HAS_TAG]->(t:Tag) " +
                "WHERE n.createdAt >= datetime() - duration('P7D') AND n.sentimentScore <= -0.4 " +
                "OPTIONAL MATCH (t)-[r:SUBSIDIARY_OF|SUPPLIES_TO|PARTNER_WITH|COMPETE_WITH|RELATED_TO]-(otherTag:Tag) " +
                "OPTIONAL MATCH (s:Stock) WHERE s.name = t.name OR s.kor_name = t.name OR s.name = otherTag.name OR s.kor_name = otherTag.name " +
                "RETURN n.title AS newsTitle, n.summary AS newsSummary, n.sentimentScore AS sentimentScore, " +
                "       t.name AS tagName, type(r) AS relationType, otherTag.name AS relatedTagName, " +
                "       coalesce(s.kor_name, s.name) AS stockName, s.ticker AS stockTicker " +
                "LIMIT 100";
        List<Map<String, Object>> track4Data = new java.util.ArrayList<>(neo4jClient.query(track4Query).fetch().all());

        if (track1Data.isEmpty() && track2Data.isEmpty() && track3Data.isEmpty() && track4Data.isEmpty()) {
            log.warn("[Weekly LLM Briefing] 모든 트랙의 그래프 컨텍스트 데이터가 비어 있습니다.");
            return saveAndReturnBriefing("{\n  \"track1\": [],\n  \"track2\": [],\n  \"track3\": [],\n  \"track4\": []\n}", REDIS_KEY_WEEKLY_BRIEFING);
        }

        // 2. 각 트랙 데이터를 LLM 포맷으로 변환 (중복 제거 및 크기 제어)
        StringBuilder contextBuilder = new StringBuilder();
        appendTrackContext(contextBuilder, "트랙 1: 어제와 오늘의 호재 뉴스 (감성점수 >= 0.5 기반 단기 모멘텀 분석)", track1Data);
        appendTrackContext(contextBuilder, "트랙 2: 지난 일주일간의 호재 뉴스 (감성점수 >= 0.4 기반 중장기/공급망 분석)", track2Data);
        appendTrackContext(contextBuilder, "트랙 3: 어제와 오늘의 악재 뉴스 (감성점수 <= -0.5 기반 단기 투자 위험 분석)", track3Data);
        appendTrackContext(contextBuilder, "트랙 4: 지난 일주일간의 악재 뉴스 (감성점수 <= -0.4 기반 장기 리스크/공급망 전이 분석)", track4Data);

        // 3. 프롬프트 작성
        String currentDateStr = java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyy년 M월 d일"));
        String prompt = String.format(
            "[System: You are an expert financial analyst. Analyze the provided Neo4j news and tag relations context categorized by tracks and return ONLY a valid JSON object matching the requested schema. No conversational text. Today's date is %s. " +
            "CRITICAL REQUIREMENT: For each recommended stock, you must analyze and explicitly predict the specific market and stock ramifications/impact (미칠 파장, e.g., short/long-term stock price movement, supply chain consequences, competitive advantages/disadvantages) of the underlying news, and detail these details inside the 'reason' field of each JSON item. " +
            "CRITICAL WARNING: You are highly encouraged to recommend any publicly traded companies mentioned anywhere in the context (such as in news titles, summaries, tags, or relationships, e.g., 'Apple', 'Tesla', 'TSMC', 'Microsoft', 'AMD', 'ASML', 'Google', etc.). If a company's ticker is not explicitly provided in the context, you must infer the correct ticker symbol (e.g., AAPL for Apple, TSLA for Tesla, MSFT for Microsoft) and format it as '주식이름(주식코드)' in the 'stock' field. Do NOT recommend companies that are not mentioned in the context at all.]\n\n" +
            "=== [Neo4j 트랙별 뉴스 및 태그/주식 연결 정보 컨텍스트] ===\n" +
            "%s\n\n" +
            "위 연결 데이터를 각 트랙별 조건에 따라 심도 있게 분석하여, 다음 4가지 투자 관점의 트랙에 맞는 종목들을 분류 및 선정하고, 각 종목의 선정 이유에는 **특정 뉴스가 해당 주가 및 시장에 미칠 파장(단기/장기 주가 영향, 공급망 영향, 경쟁 구도 변화 등)을 구체적으로 예측하여** 명시한 JSON 형식으로 응답해줘. 만약 조건에 해당하는 종목이 없다면 빈 리스트를 응답해줘.\n" +
            "반드시 다음 JSON 스키마 구조를 엄격하게 지켜서 응답해야 하며, 그 외의 다른 설명은 절대로 덧붙이지 마십시오:\n\n" +
            "{\n" +
            "  \"track1\": [\n" +
            "    {\n" +
            "      \"stock\": \"주식이름(주식코드)\",\n" +
            "      \"reason\": \"어제와 오늘의 호재 뉴스 내용 및 태그 연결성을 서술하고, 이 뉴스가 단기적으로 주가에 미칠 파장(상승 모멘텀, 단기 수급 등)을 예측하여 상세히 서술\"\n" +
            "    }\n" +
            "  ],\n" +
            "  \"track2\": [\n" +
            "    {\n" +
            "      \"stock\": \"주식이름(주식코드)\",\n" +
            "      \"reason\": \"지난 일주일간의 호재 뉴스 및 공급망/산업 관계를 서술하고, 이로 인해 중장기적으로 주가 및 산업 생태계에 미칠 파장(공급망 계약 효과, 시장 점유율 변화 등)을 예측하여 상세히 서술\"\n" +
            "    }\n" +
            "  ],\n" +
            "  \"track3\": [\n" +
            "    {\n" +
            "      \"stock\": \"주식이름(주식코드)\",\n" +
            "      \"reason\": \"어제와 오늘의 악재 뉴스 및 위험 요소를 서술하고, 이 뉴스가 단기적으로 주가에 미칠 파장(급락 위험, 신용 리스크 등)을 예측하여 상세히 서술\"\n" +
            "    }\n" +
            "  ],\n" +
            "  \"track4\": [\n" +
            "    {\n" +
            "      \"stock\": \"주식이름(주식코드)\",\n" +
            "      \"reason\": \"지난 일주일간의 악재 뉴스 및 경쟁사 호재로 인한 영향 등을 서술하고, 이 뉴스가 장기적으로 기업 가치 및 공급망 리스크에 미칠 파장(매출 타격, 제휴 해지 가능성 등)을 예측하여 상세히 서술\"\n" +
            "    }\n" +
            "  ]\n" +
            "}",
            currentDateStr,
            contextBuilder.toString()
        );

        log.info("[Weekly LLM Briefing] Gemma 4 기반 브리핑 리포트 생성 요청 송신");
        String rawBriefing = ollamaCloudService.queryGemma4ForReasoning(prompt);
        return saveAndReturnBriefing(rawBriefing, REDIS_KEY_WEEKLY_BRIEFING);
    }

    private void appendTrackContext(StringBuilder builder, String trackTitle, List<Map<String, Object>> data) {
        builder.append(String.format("=== [%s] ===\n", trackTitle));
        if (data == null || data.isEmpty()) {
            builder.append("- 해당 조건에 맞는 데이터가 존재하지 않습니다.\n\n");
            return;
        }

        // 중복 텍스트 제거를 위한 그룹화 자료구조
        Map<String, Map<String, Object>> uniqueNews = new java.util.LinkedHashMap<>();
        Map<String, Set<String>> newsTags = new java.util.HashMap<>();
        Map<String, Set<String>> newsRelations = new java.util.HashMap<>();
        Map<String, Set<String>> newsStocks = new java.util.HashMap<>();

        for (Map<String, Object> row : data) {
            String newsTitle = (String) row.get("newsTitle");
            if (newsTitle == null) continue;

            if (!uniqueNews.containsKey(newsTitle)) {
                uniqueNews.put(newsTitle, row);
                newsTags.put(newsTitle, new java.util.HashSet<>());
                newsRelations.put(newsTitle, new java.util.HashSet<>());
                newsStocks.put(newsTitle, new java.util.HashSet<>());
            }

            String tagName = (String) row.get("tagName");
            if (tagName != null && !tagName.isEmpty()) {
                Set<String> tags = newsTags.get(newsTitle);
                if (tags.size() < 8) {
                    tags.add(tagName);
                }
            }

            String relationType = (String) row.get("relationType");
            String relatedTagName = (String) row.get("relatedTagName");
            if (relationType != null && relatedTagName != null) {
                Set<String> rels = newsRelations.get(newsTitle);
                if (rels.size() < 5) {
                    rels.add(tagName + " --[" + relationType + "]--> " + relatedTagName);
                }
            }

            String stockName = (String) row.get("stockName");
            String stockTicker = (String) row.get("stockTicker");
            if (stockName != null && stockTicker != null) {
                Set<String> stocks = newsStocks.get(newsTitle);
                if (stocks.size() < 5) {
                    stocks.add(stockName + " (" + stockTicker + ")");
                }
            }
        }

        int index = 1;
        for (String newsTitle : uniqueNews.keySet()) {
            Map<String, Object> newsRow = uniqueNews.get(newsTitle);
            String newsSummary = (String) newsRow.get("newsSummary");
            Double sentimentScore = null;
            Object sentimentObj = newsRow.get("sentimentScore");
            if (sentimentObj instanceof Number) {
                sentimentScore = ((Number) sentimentObj).doubleValue();
            }

            builder.append(String.format("[%d] 뉴스: %s (감성 점수: %s)\n", index++, newsTitle, sentimentScore));
            builder.append(String.format("    - 요약: %s\n", newsSummary));

            Set<String> tags = newsTags.get(newsTitle);
            if (!tags.isEmpty()) {
                builder.append(String.format("    - 연결 태그: %s\n", String.join(", ", tags)));
            }

            Set<String> relations = newsRelations.get(newsTitle);
            if (!relations.isEmpty()) {
                builder.append("    - 태그 관계:\n");
                for (String rel : relations) {
                    builder.append(String.format("      * %s\n", rel));
                }
            }

            Set<String> stocks = newsStocks.get(newsTitle);
            if (!stocks.isEmpty()) {
                builder.append(String.format("    - 매칭 주식: %s\n", String.join(", ", stocks)));
            }
            builder.append("\n");
        }
    }

    private String saveAndReturnBriefing(String briefingJson, String redisKey) {
        String cleanedJson = cleanJsonString(briefingJson);
        log.info("[Briefing Service] 정제 전 원본 JSON 길이: {}, 정제 후 JSON: {}", 
                 briefingJson != null ? briefingJson.length() : 0, cleanedJson);
        String resultJson = cleanedJson;
        try {
            Map<String, Object> map = objectMapper.readValue(cleanedJson, new tools.jackson.core.type.TypeReference<Map<String, Object>>() {});
            map.put("created_at", LocalDateTime.now().toString());
            resultJson = objectMapper.writeValueAsString(map);
            
            redisTemplate.opsForValue().set(redisKey, resultJson);
            log.info("[Briefing Service] 새로운 브리핑을 Redis에 저장 완료했습니다.");
        } catch (Exception e) {
            log.error("[Briefing Service] 브리핑에 created_at 추가 및 Redis 저장 실패", e);
        }
        return resultJson;
    }

    @Override
    public java.util.List<String> getNewsIdsByStockCode(String stockCode) {
        String cypherQuery = "MATCH (s:Stock {ticker: $stockCode}) " +
                "MATCH (n:News)-[:HAS_TAG]->(t:Tag) " +
                "WHERE t.name = s.name OR t.name = s.kor_name OR t.name = s.ticker " +
                "   OR EXISTS { " +
                "       MATCH (t)-[:SYNONYM_OF]-(other:Tag) " +
                "       WHERE other.name = s.name OR other.name = s.kor_name OR other.name = s.ticker " +
                "   } " +
                "RETURN DISTINCT n.id AS newsId";
        
        java.util.Collection<Map<String, Object>> result = neo4jClient.query(cypherQuery)
                .bind(stockCode).to("stockCode")
                .fetch()
                .all();
        
        java.util.List<String> newsIds = new java.util.ArrayList<>();
        if (result != null) {
            for (Map<String, Object> record : result) {
                String newsId = (String) record.get("newsId");
                if (newsId != null) {
                    newsIds.add(newsId);
                }
            }
        }
        return newsIds;
    }

    @Override
    public java.util.List<com.example.newsAIAgents.domain.NewsEntity> getNewsDetailsByStockCode(String stockCode) {
        java.util.List<String> newsIds = getNewsIdsByStockCode(stockCode);
        if (newsIds == null || newsIds.isEmpty()) {
            return java.util.Collections.emptyList();
        }
        
        // Find entities in PostgreSQL database using JpaRepository.findAllById
        java.util.List<com.example.newsAIAgents.domain.NewsEntity> entities = newsJpaRepository.findAllById(newsIds);
        
        // Sort entities in publishedAt descending order to maintain consistency
        entities.sort((a, b) -> {
            LocalDateTime atA = a.getPublishedAt();
            LocalDateTime atB = b.getPublishedAt();
            if (atA == null && atB == null) return 0;
            if (atA == null) return 1;
            if (atB == null) return -1;
            return atB.compareTo(atA); // Descending order
        });
        
        return entities;
    }

    private String cleanJsonString(String rawJson) {
        if (rawJson == null) {
            return "";
        }
        String clean = rawJson.trim();
        // 백틱(`) 기호를 모두 삭제하여 마크다운 코드 블록이나 백틱으로 인한 파싱 에러를 사전에 차단합니다.
        clean = clean.replace("`", "");
        
        int firstBrace = clean.indexOf("{");
        int lastBrace = clean.lastIndexOf("}");
        if (firstBrace != -1 && lastBrace != -1 && lastBrace > firstBrace) {
            clean = clean.substring(firstBrace, lastBrace + 1);
        }
        return clean.trim();
    }
}
