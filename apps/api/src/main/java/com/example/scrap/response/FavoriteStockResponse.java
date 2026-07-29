package com.example.scrap.response;

import lombok.*;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FavoriteStockResponse {

    private Long id;
    private String stockCode;
    private String createdAt;
}
