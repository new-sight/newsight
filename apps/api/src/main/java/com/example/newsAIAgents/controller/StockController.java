package com.example.newsAIAgents.controller;

import com.example.newsAIAgents.service.StockService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequiredArgsConstructor
public class StockController {

    private final StockService stockService;

    @GetMapping("/api/stock/info/{stockCode}")
    public Map<String, Object> getStockInfo(@PathVariable String stockCode) {
        return stockService.getStockInfo(stockCode);
    }
}
