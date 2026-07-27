package com.example.scrap.response;

import lombok.*;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScrapNewsResponse {

    private String id;
    private String title;
    private String link;
    private String source;
    private String tags;
    private String publishedAt;
    private String scrappedAt;
}