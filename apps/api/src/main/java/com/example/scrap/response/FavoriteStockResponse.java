package com.example.scrap.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class FavoriteStockResponse {
    private String stockCode;
    private String korName;
    private String companyName;
    private String createdAt;
}
