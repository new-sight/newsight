package com.example.newsAIAgents.repository;

import com.example.newsAIAgents.domain.NewsEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NewsJpaRepository extends JpaRepository<NewsEntity, String> {
    // 필요한 경우 커스텀 RDB 쿼리 정의 가능
}
