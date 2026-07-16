package com.example.newsAIAgents.service;

import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class OllamaCloudService {

    @Value("${ollama.cloud.url}")
    private String cloudUrl;

    @Value("${ollama.cloud.api-key}")
    private String apiKey;

    @Value("${ollama.cloud.model}")
    private String modelName;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public String queryGemma4ForReasoning(String prompt) {
        log.info("[Ollama Cloud] Gemma 4 기반 사용자 추론 요청 송신");
        
        if (cloudUrl == null || apiKey == null || modelName == null) {
            log.error("[Ollama Cloud] Configuration properties are missing! cloudUrl: {}, apiKey: {}, model: {}", cloudUrl, apiKey, modelName);
            return "Ollama Cloud 설정 정보가 누락되었습니다. application.properties를 확인해 주세요.";
        }

        WebClient webClient = WebClient.builder()
                .baseUrl(cloudUrl)
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .build();

        Map<String, Object> requestBody = new java.util.HashMap<>();
        requestBody.put("model", modelName);
        requestBody.put("messages", List.of(Map.of("role", "user", "content", prompt)));
        requestBody.put("stream", false);
        requestBody.put("format", "json");
        requestBody.put("options", Map.of("temperature", 0.1));

        try {
            Map<String, Object> response = webClient.post()
                    .uri("/api/chat")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {
                    })
                    .block();

            log.debug("[Ollama Cloud] Response received: {}", response);

            if (response == null || !response.containsKey("message") || response.get("message") == null) {
                log.warn("[Ollama Cloud] Response does not contain a valid message: {}", response);
                return "Ollama Cloud로부터 유효한 응답 메시지를 수신하지 못했습니다.";
            }

            Map<String, Object> message = objectMapper.convertValue(response.get("message"),
                    new TypeReference<Map<String, Object>>() {
                    });
            
            if (message == null || !message.containsKey("content") || message.get("content") == null) {
                log.warn("[Ollama Cloud] Message content is empty or null: {}", message);
                return "Ollama Cloud로부터 빈 내용(content)을 수신했습니다.";
            }

            return message.get("content").toString().trim();
        } catch (Exception e) {
            log.error("[Gemma 4 Error] 추론 질의 도중 예외가 발생했습니다.", e);
            return "추론 질의 실패 (Gemma 4 API 통신 장애): " + e.getMessage();
        }
    }
}