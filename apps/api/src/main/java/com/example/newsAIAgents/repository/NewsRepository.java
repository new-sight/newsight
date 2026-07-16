package com.example.newsAIAgents.repository;

import com.example.newsAIAgents.domain.NewsNode;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface NewsRepository extends Neo4jRepository<NewsNode, String> {
    /**
     * 신규 뉴스가 저장되는 즉시, 기존 뉴스들 중 1개 이상의 공통 마스터 태그를 공유하는
     * 모든 뉴스 기사들과 양방향 RELATED_NEWS 연관 관계를 자동 구축합니다.
     */
    @Query("MATCH (newNews:News {id: $newNewsId})-[:HAS_TAG]->(t:Tag)<-[:HAS_TAG]-(existingNews:News) " +
            "WHERE newNews <> existingNews " +
            "WITH existingNews, newNews, count(t) as commonCount " +
            "WHERE commonCount >= 1 " +
            "MERGE (newNews)-[:RELATED_NEWS]->(existingNews) " +
            "MERGE (existingNews)-[:RELATED_NEWS]->(newNews)")
    void connectRelatedNewsByCommonTags(@Param("newNewsId") String newNewsId);
}
