package com.example.newsAIAgents.domain;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Relationship;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Node("News")
@Getter
@Setter
public class NewsNode {
    @Id
    private String id;
    private String title;
    private String summary;
    private String link; // 원본 뉴스 링크 필드
    private LocalDateTime createdAt;

    // 기사가 직접 갖는 태그들
    @Relationship(type = "HAS_TAG", direction = Relationship.Direction.OUTGOING)
    private Set<TagNode> tags = new HashSet<>();

    // 공통 태그를 매개로 연결되는 연관 뉴스 기사들
    @Relationship(type = "RELATED_NEWS", direction = Relationship.Direction.OUTGOING)

    private Set<NewsNode> relatedNews = new HashSet<>();

    public void addTag(TagNode tag) {
        if (this.tags == null) {
            this.tags = new HashSet<>();
        }
        this.tags.add(tag);
    }

    public void addRelatedNews(NewsNode otherNews) {
        if (this.relatedNews == null) {
            this.relatedNews = new HashSet<>();
        }
        if (!this.id.equals(otherNews.getId())) {
            this.relatedNews.add(otherNews);
        }
    }
}
