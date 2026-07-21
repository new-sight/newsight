package com.example.demo.mapnews;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class MapNewsApiClient {

    private final RestClient restClient;

    public MapNewsApiClient(@Value("${mapnews.api.base-url}") String baseUrl) {
        this.restClient = RestClient.builder().baseUrl(baseUrl).build();
    }

    public BriefingResponse getBriefing() {
        return restClient.get()
                .uri("/news/briefing")
                .retrieve()
                .body(BriefingResponse.class);
    }
}
