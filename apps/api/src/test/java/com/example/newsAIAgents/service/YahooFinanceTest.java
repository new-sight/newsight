package com.example.newsAIAgents.service;

import org.junit.jupiter.api.Test;
import yahoofinance.Stock;
import yahoofinance.YahooFinance;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

public class YahooFinanceTest {

    @Test
    void testLibraryYahooFinance() {
        System.out.println("========== [1] Library Yahoo Finance Test ==========");
        try {
            System.setProperty("yahoofinance.useragent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
            Stock stock = YahooFinance.get("AAPL");
            if (stock != null) {
                System.out.println("Apple Price: " + stock.getQuote().getPrice());
                System.out.println("Apple Market Cap: " + stock.getStats().getMarketCap());
            }
        } catch (Exception e) {
            System.out.println("Library approach failed: " + e.getMessage());
        }
        System.out.println("====================================================");
    }

    @Test
    void testRawHttpYahooFinance() {
        System.out.println("========== [2] Raw HTTP Yahoo Finance Test ==========");
        String[] tickers = {"AAPL", "005930.KS", "7203.T"};
        
        for (String ticker : tickers) {
            try {
                String urlStr = "https://query1.finance.yahoo.com/v7/finance/quote?symbols=" + ticker;
                URL url = java.net.URI.create(urlStr).toURL();
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("GET");
                
                // 브라우저처럼 보이도록 헤더 설정
                conn.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
                conn.setRequestProperty("Accept", "application/json, text/plain, */*");
                conn.setRequestProperty("Accept-Language", "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7");
                conn.setRequestProperty("Origin", "https://finance.yahoo.com");
                conn.setRequestProperty("Referer", "https://finance.yahoo.com");
                
                int responseCode = conn.getResponseCode();
                System.out.println("[" + ticker + "] HTTP Response Code: " + responseCode);
                
                if (responseCode == 200) {
                    BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                    String inputLine;
                    StringBuilder response = new StringBuilder();
                    while ((inputLine = in.readLine()) != null) {
                        response.append(inputLine);
                    }
                    in.close();
                    
                    // JSON 응답의 앞 부분 200자만 출력하여 확인
                    String json = response.toString();
                    System.out.println("[" + ticker + "] Response (Preview): " + json.substring(0, Math.min(json.length(), 200)) + "...");
                } else {
                    BufferedReader in = new BufferedReader(new InputStreamReader(conn.getErrorStream()));
                    String inputLine;
                    StringBuilder response = new StringBuilder();
                    while ((inputLine = in.readLine()) != null) {
                        response.append(inputLine);
                    }
                    in.close();
                    System.out.println("[" + ticker + "] Error Output: " + response.toString());
                }
            } catch (Exception e) {
                System.out.println("[" + ticker + "] Request failed: " + e.getMessage());
            }
        }
        System.out.println("====================================================");
    }
}
