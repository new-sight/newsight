package com.example.demo.mapnews;

import static org.assertj.core.api.Assertions.assertThat;

import tools.jackson.databind.json.JsonMapper;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;

class BriefingResponseJsonTest {

    private final JsonMapper jsonMapper = JsonMapper.builder().findAndAddModules().build();

    @Test
    void deserializesSnakeCaseCreatedAtAndTracks() throws Exception {
        String json = """
                {
                  "track1": [{"stock": "NVIDIA(NVDA)", "reason": "some reason"}],
                  "track2": [],
                  "track3": [],
                  "track4": [],
                  "created_at": "2026-07-21T06:18:47.041260933"
                }
                """;

        BriefingResponse response = jsonMapper.readValue(json, BriefingResponse.class);

        assertThat(response.createdAt()).isEqualTo(LocalDateTime.parse("2026-07-21T06:18:47.041260933"));
        assertThat(response.track1()).containsExactly(new BriefingItem("NVIDIA(NVDA)", "some reason"));
        assertThat(response.track2()).isEmpty();
    }
}
