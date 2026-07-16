package com.example.newsAIAgents.domain;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Relationship;

import java.util.HashSet;
import java.util.Set;

@Node("Tag")
@Getter
@Setter
@NoArgsConstructor
public class TagNode {

    @Id
    private String name;
    private boolean isMaster;

    // 동의어 관계 (예: MS - SYNONYM_OF -> Microsoft)
    @Relationship(type = "SYNONYM_OF", direction = Relationship.Direction.OUTGOING)
    private TagNode masterTag;

    // 태그 간 연관/유사 관계 (예: AI - RELATED_TO -> GPU)
    @Relationship(type = "RELATED_TO", direction = Relationship.Direction.OUTGOING)
    private Set<TagNode> relatedTags = new HashSet<>();

    public TagNode(String name, boolean isMaster) {
        this.name = name;
        this.isMaster = isMaster;
    }

    public void addRelatedTag(TagNode tag) {
        if (this.relatedTags == null) {
            this.relatedTags = new HashSet<>();
        }
        if (!this.name.equalsIgnoreCase(tag.getName())) {
            this.relatedTags.add(tag);
        }
    }
}
