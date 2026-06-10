package com.first.demo.client;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class FootballApiClient {

    private static final Logger log = LoggerFactory.getLogger(FootballApiClient.class);

    @Value("${api.football.key}")
    private String apiKey;

    private final String BASE_URL = "https://v3.football.api-sports.io";
    private final RestTemplate restTemplate;

    public FootballApiClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public String fetchFromApi(String endpoint) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("x-apisports-key", apiKey);
        headers.set("x-rapidapi-host", "v3.football.api-sports.io");
        
        HttpEntity<String> entity = new HttpEntity<>(headers);
        
        ResponseEntity<String> response = restTemplate.exchange(
            BASE_URL + endpoint,
            HttpMethod.GET,
            entity,
            String.class
        );
        
        String responseBody = response.getBody();
        
        if (responseBody != null && responseBody.contains("request limit")) {
            // ONLY LOG IT. Do not throw an exception here.
            log.error("INGESTION_FAILURE: Quota limit hit for endpoint {}", endpoint);
        }
        
        return responseBody;
    }
}