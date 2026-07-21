package com.example.newsAIAgents.service;

public interface OllamaCloudService {
    /**
     * Ollama Cloud (Gemma 4) API를 호출하여 지능형 추론 결과를 생성합니다.
     */
    String queryGemma4ForReasoning(String prompt);
}