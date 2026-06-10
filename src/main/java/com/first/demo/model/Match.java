package com.first.demo.model;

import lombok.Data;

@Data // Keeps your getters/setters
public class Match {
    private Long id; 
    private String homeTeam;
    private String awayTeam;
    private String status;
    private Integer homeScore;
    private Integer awayScore;
    private String matchDate;
}