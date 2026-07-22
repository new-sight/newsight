package com.example.newsAIAgents;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@ComponentScan(basePackages = {"com.example.newsAIAgents", "com.example.newsmap"})
@EntityScan(basePackages = {"com.example.newsAIAgents", "com.example.newsmap"})
@EnableJpaRepositories(basePackages = {"com.example.newsAIAgents", "com.example.newsmap"})
public class NewsAiAgentsApplication {

	public static void main(String[] args) {
		SpringApplication.run(NewsAiAgentsApplication.class, args);
	}

}