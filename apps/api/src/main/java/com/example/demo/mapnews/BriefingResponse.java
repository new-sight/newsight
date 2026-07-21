package com.example.demo.mapnews;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;
import java.util.List;

public record BriefingResponse(
        List<BriefingItem> track1,
        List<BriefingItem> track2,
        List<BriefingItem> track3,
        List<BriefingItem> track4,
        @JsonProperty("created_at") LocalDateTime createdAt
) {
}
