package com.example.scrap.domain;

import com.example.auth.domain.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "favorite_stocks", uniqueConstraints = @UniqueConstraint(name = "uk_user_stock", columnNames = {"user_id", "stock_code"}))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class FavoriteStock {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 관심 종목 등록한 사용자
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // STOCK 테이블의 stock_code(FK)
    @Column(name = "stock_code", nullable = false, length = 20)
    private String stockCode;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
