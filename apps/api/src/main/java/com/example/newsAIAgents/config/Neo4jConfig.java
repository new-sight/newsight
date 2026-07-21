package com.example.newsAIAgents.config;

import org.neo4j.driver.Driver;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.neo4j.core.transaction.Neo4jTransactionManager;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.transaction.PlatformTransactionManager;
import jakarta.persistence.EntityManagerFactory;

@Configuration
// @org.springframework.data.neo4j.repository.config.EnableNeo4jRepositories(
//     basePackages = "com.example.newsAIAgents.repository",
//     transactionManagerRef = "neo4jTransactionManager"
// )
public class Neo4jConfig {

    @Bean(name = "neo4jTransactionManager")
    public PlatformTransactionManager neo4jTransactionManager(Driver driver) {
        return new Neo4jTransactionManager(driver);
    }

    @Bean(name = "transactionManager")
    @Primary
    public PlatformTransactionManager transactionManager(EntityManagerFactory entityManagerFactory) {
        return new JpaTransactionManager(entityManagerFactory);
    }
}
