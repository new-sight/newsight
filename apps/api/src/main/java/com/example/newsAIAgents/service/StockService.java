package com.example.newsAIAgents.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import tools.jackson.databind.ObjectMapper;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.time.Duration;
import java.util.Map;

@Slf4j
@Service
public class StockService {

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    private static final String USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    private static final String REDIS_KEY_COOKIE = "yahoo:session:cookie";
    private static final String REDIS_KEY_CRUMB = "yahoo:session:crumb";
    private static final String REDIS_KEY_STOCK_PREFIX = "stock:info:";

    public StockService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    private static class YahooSession {
        String cookie;
        String crumb;

        YahooSession(String cookie, String crumb) {
            this.cookie = cookie;
            this.crumb = crumb;
        }
    }

    /**
     * Redis 캐시를 조회하여 야후 세션(쿠키 및 크럼)을 가져옵니다.
     * 캐시에 없으면 새로 생성하여 1시간 동안 저장합니다.
     */
    private YahooSession getYahooSession(boolean forceRefresh) {
        if (!forceRefresh) {
            String cachedCookie = redisTemplate.opsForValue().get(REDIS_KEY_COOKIE);
            String cachedCrumb = redisTemplate.opsForValue().get(REDIS_KEY_CRUMB);
            if (cachedCookie != null && cachedCrumb != null) {
                return new YahooSession(cachedCookie, cachedCrumb);
            }
        }

        log.info("[Stock Service] 야후 세션 캐시가 없거나 갱신이 필요하여 세션을 생성합니다.");
        try {
            // 1. fc.yahoo.com에 요청하여 A3 쿠키 획득
            URL fcUrl = java.net.URI.create("https://fc.yahoo.com").toURL();
            HttpURLConnection fcConn = (HttpURLConnection) fcUrl.openConnection();
            fcConn.setRequestMethod("GET");
            fcConn.setRequestProperty("User-Agent", USER_AGENT);
            fcConn.setInstanceFollowRedirects(false);
            
            String cookieHeader = fcConn.getHeaderField("Set-Cookie");
            String cookie = null;
            if (cookieHeader != null) {
                int semiColonIndex = cookieHeader.indexOf(";");
                if (semiColonIndex != -1) {
                    cookie = cookieHeader.substring(0, semiColonIndex);
                } else {
                    cookie = cookieHeader;
                }
            }
            fcConn.disconnect();

            if (cookie == null) {
                log.warn("[Stock Service] 야후 세션 쿠키 획득 실패");
                return null;
            }

            // 2. getcrumb 호출하여 crumb 획득
            URL crumbUrl = java.net.URI.create("https://query1.finance.yahoo.com/v1/test/getcrumb").toURL();
            HttpURLConnection crumbConn = (HttpURLConnection) crumbUrl.openConnection();
            crumbConn.setRequestMethod("GET");
            crumbConn.setRequestProperty("User-Agent", USER_AGENT);
            crumbConn.setRequestProperty("Cookie", cookie);
            
            String crumb = null;
            int responseCode = crumbConn.getResponseCode();
            if (responseCode == 200) {
                try (BufferedReader in = new BufferedReader(new InputStreamReader(crumbConn.getInputStream()))) {
                    crumb = in.readLine();
                }
            }
            crumbConn.disconnect();

            if (crumb == null) {
                log.warn("[Stock Service] 야후 크럼(Crumb) 획득 실패");
                return null;
            }
            
            // Redis에 1시간 동안 저장
            redisTemplate.opsForValue().set(REDIS_KEY_COOKIE, cookie, Duration.ofHours(1));
            redisTemplate.opsForValue().set(REDIS_KEY_CRUMB, crumb, Duration.ofHours(1));
            log.info("[Stock Service] 야후 신규 세션 캐싱 성공 (1시간 유효) - Cookie: {}, Crumb: {}", cookie, crumb);
            
            return new YahooSession(cookie, crumb);
        } catch (Exception e) {
            log.error("[Stock Service] 야후 세션 생성 중 예외 발생", e);
            return null;
        }
    }

    private void clearYahooSession() {
        redisTemplate.delete(REDIS_KEY_COOKIE);
        redisTemplate.delete(REDIS_KEY_CRUMB);
        log.info("[Stock Service] 만료되거나 유효하지 않은 야후 세션 캐시를 삭제했습니다.");
    }

    public Map<String, Object> getStockInfo(String symbol) {
        // 사용자가 .JP로 요청할 경우 .T로 자동 매핑합니다.
        String targetSymbol = symbol;
        if (targetSymbol != null && targetSymbol.toUpperCase().endsWith(".JP")) {
            targetSymbol = targetSymbol.substring(0, targetSymbol.length() - 3) + ".T";
            log.info("[Stock Service] 일본 주식 접미사 변환: {} -> {}", symbol, targetSymbol);
        }

        if (targetSymbol != null && !targetSymbol.contains(".")) {
            if (targetSymbol.matches("^[0-9].{3}$")) {
                targetSymbol = targetSymbol + ".T";
            } else if (targetSymbol.matches("^[0-9]{6}$")) {
                targetSymbol = targetSymbol + ".KS";
            }
        }

        final String finalSymbol = targetSymbol;
        String cacheKey = REDIS_KEY_STOCK_PREFIX + finalSymbol;

        // 1. Redis 캐시 확인 (현재가 갱신 주기인 10초 동안 캐싱)
        try {
            String cachedData = redisTemplate.opsForValue().get(cacheKey);
            if (cachedData != null) {
                log.info("[Stock Service] Redis 캐시 반환 - 티커: {}", finalSymbol);
                return objectMapper.readValue(cachedData, new tools.jackson.core.type.TypeReference<Map<String, Object>>() {});
            }
        } catch (Exception e) {
            log.warn("[Stock Service] Redis 캐시 읽기 실패", e);
        }

        // 2. 야후 파이낸스 세션 가져오기
        YahooSession session = getYahooSession(false);
        if (session == null) {
            return Map.of("error", "야후 파이낸스 세션 초기화 실패");
        }

        try {
            Map<String, Object> stockData = fetchQuoteWithRetry(finalSymbol, session, 0);
            if (stockData != null && !stockData.containsKey("error")) {
                // Redis에 10초 동안 저장하여 잦은 호출 방지 및 실시간성 보장
                redisTemplate.opsForValue().set(cacheKey, objectMapper.writeValueAsString(stockData), Duration.ofSeconds(10));
            }
            return stockData;
        } catch (Exception e) {
            log.error("[Stock Service] 주식 데이터 획득 실패 - 티커: {}", finalSymbol, e);
            return Map.of("error", "주식 정보 조회 실패: " + e.getMessage());
        }
    }

    /**
     * 야후 파이낸스 API 호출 및 만료된 세션(401 발생 시)에 대한 자동 갱신 재시도 처리
     */
    private Map<String, Object> fetchQuoteWithRetry(String symbol, YahooSession session, int retryCount) throws Exception {
        String urlStr = "https://query1.finance.yahoo.com/v7/finance/quote?symbols=" + symbol + "&crumb=" + session.crumb + "&lang=ko-KR&region=KR";
        URL url = java.net.URI.create(urlStr).toURL();
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        conn.setRequestProperty("User-Agent", USER_AGENT);
        conn.setRequestProperty("Cookie", session.cookie);
        conn.setRequestProperty("Accept", "application/json");
        conn.setRequestProperty("Accept-Language", "ko-KR,ko;q=0.9");

        int responseCode = conn.getResponseCode();
        
        // 401 Unauthorized인 경우 세션(크럼 토큰) 만료로 간주하여 세션 갱신 후 1회 재시도
        if (responseCode == 401 && retryCount < 1) {
            log.warn("[Stock Service] 크럼 토큰 만료 감지 (HTTP 401). 세션 초기화 후 재시도합니다.");
            clearYahooSession();
            YahooSession newSession = getYahooSession(true);
            if (newSession != null) {
                return fetchQuoteWithRetry(symbol, newSession, retryCount + 1);
            }
        }

        if (responseCode == 200) {
            try (BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()))) {
                StringBuilder response = new StringBuilder();
                String inputLine;
                while ((inputLine = in.readLine()) != null) {
                    response.append(inputLine);
                }
                return parseYahooQuoteResponse(response.toString());
            }
        } else {
            log.error("[Stock Service] 야후 API 응답 에러 코드: {}", responseCode);
            return Map.of("error", "야후 API 응답 실패 (HTTP " + responseCode + ")");
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> parseYahooQuoteResponse(String jsonResponse) {
        try {
            Map<String, Object> responseMap = objectMapper.readValue(jsonResponse, new tools.jackson.core.type.TypeReference<Map<String, Object>>() {});
            if (responseMap == null || !responseMap.containsKey("quoteResponse")) {
                return Map.of("error", "유효하지 않은 응답 데이터입니다.");
            }
            Map<String, Object> quoteResponse = (Map<String, Object>) responseMap.get("quoteResponse");
            java.util.List<Map<String, Object>> resultList = (java.util.List<Map<String, Object>>) quoteResponse.get("result");
            if (resultList == null || resultList.isEmpty()) {
                return Map.of("error", "주식 정보를 찾을 수 없습니다.");
            }
            Map<String, Object> quote = resultList.get(0);

            Map<String, Object> result = new java.util.LinkedHashMap<>();
            result.put("symbol", quote.get("symbol"));
            result.put("companyName", quote.getOrDefault("longName", quote.getOrDefault("shortName", "")));
            result.put("price", quote.get("regularMarketPrice"));
            result.put("change", quote.get("regularMarketChange"));
            result.put("changePercent", quote.get("regularMarketChangePercent"));
            result.put("previousClose", quote.get("regularMarketPreviousClose"));
            result.put("open", quote.get("regularMarketOpen"));
            result.put("volume", quote.get("regularMarketVolume"));
            result.put("currency", quote.get("currency"));
            result.put("marketCap", quote.get("marketCap"));
            result.put("fiftyTwoWeekHigh", quote.get("fiftyTwoWeekHigh"));
            result.put("fiftyTwoWeekLow", quote.get("fiftyTwoWeekLow"));
            result.put("trailingPE", quote.get("trailingPE"));
            result.put("forwardPE", quote.get("forwardPE"));
            result.put("priceToBook", quote.get("priceToBook"));
            result.put("epsTrailingTwelveMonths", quote.get("epsTrailingTwelveMonths"));
            result.put("sharesOutstanding", quote.get("sharesOutstanding"));
            result.put("dividendYield", quote.get("dividendYield"));
            result.put("exchangeName", quote.get("fullExchangeName"));

            return result;
        } catch (Exception e) {
            log.error("[Stock Service] 응답 파싱 중 오류 발생", e);
            return Map.of("error", "응답 데이터 분석 실패");
        }
    }
}
