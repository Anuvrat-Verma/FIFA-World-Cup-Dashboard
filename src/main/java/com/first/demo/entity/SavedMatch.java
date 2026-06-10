package com.first.demo.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "saved_matches")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SavedMatch {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; 
    
    private String userEmail; // <--- The new "Owner" field
    private Long fixtureId; 
    private String homeTeam;
    private String awayTeam;
    private int homeGoals;
    private int awayGoals;
    private String homeLogo;
    private String awayLogo;
    private String venueName;

    // Keep your manual getter for now if Eclipse is still being moody
    public Long getFixtureId() { return this.fixtureId; }
}