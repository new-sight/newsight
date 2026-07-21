package com.example.demo.mapnews;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/mapnews")
@RequiredArgsConstructor
public class MapNewsController {

    private final MapNewsApiClient mapNewsApiClient;

    @GetMapping("/briefing")
    public BriefingResponse getBriefing() {
        return mapNewsApiClient.getBriefing();
    }
}
