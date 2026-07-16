package com.example.newsAIAgents;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class NewsAiAgentsApplication {

	public static void main(String[] args) {
		SpringApplication.run(NewsAiAgentsApplication.class, args);
	}

}