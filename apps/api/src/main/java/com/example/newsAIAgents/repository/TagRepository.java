package com.example.newsAIAgents.repository;

/*
import com.example.newsAIAgents.domain.TagNode;

import java.util.Optional;

import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TagRepository extends Neo4jRepository<TagNode, String> {

    // Neo4j 상에서 대소문자 차이를 완전히 무시하고 기존 등록된 태그 노드를 식별합니다.
    @Query("MATCH (t:Tag) WHERE toLower(t.name) = toLower($name) RETURN t LIMIT 1")
    Optional<TagNode> findByNameIgnoreCase(@Param("name") String name);
}
*/
