package com.example.newsAIAgents.service;

import org.junit.jupiter.api.Test;
import tools.jackson.databind.ObjectMapper;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Map;

public class AlphaVantageTest {

    @Test
    void testAlphaVantageOverview() throws Exception {
        System.out.println("========== Alpha Vantage API Test ==========");
        
        // 데모 키(apikey=demo)는 공식적으로 IBM 티커를 지원합니다.
        String ticker = "IBM";
        String urlStr = "https://www.alphavantage.co/query?function=OVERVIEW&symbol=" + ticker + "&apikey=demo";
        
        URL url = java.net.URI.create(urlStr).toURL();
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        conn.setRequestProperty("Accept", "application/json");
        
        int responseCode = conn.getResponseCode();
        System.out.println("HTTP Response Code: " + responseCode);
        
        if (responseCode == 200) {
            BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
            String inputLine;
            StringBuilder response = new StringBuilder();
            while ((inputLine = in.readLine()) != null) {
                response.append(inputLine);
            }
            in.close();
            
            String json = response.toString();
            ObjectMapper mapper = new ObjectMapper();
            Map<String, Object> map = mapper.readValue(json, new tools.jackson.core.type.TypeReference<Map<String, Object>>() {});
            
            System.out.println("주식 심볼 (Symbol): " + map.get("Symbol"));
            System.out.println("회사명 (Name): " + map.get("Name"));
            System.out.println("통화 (Currency): " + map.get("Currency"));
            System.out.println("시가총액 (MarketCapitalization): " + map.get("MarketCapitalization"));
            System.out.println("주식수 (SharesOutstanding): " + map.get("SharesOutstanding"));
        } else {
            System.out.println("API 호출 실패");
        }
        
        System.out.println("============================================");
    }
}
