package com.first.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.first.demo.client.FootballApiClient;
import com.first.demo.repository.SavedMatchRepository; // FIXED: Matches your actual filename
@Service
public class FootballService {

    private final FootballApiClient apiClient;
    @Autowired
    private SavedMatchRepository savedMatchRepository;

    // The constructor handles Dependency Injection for your custom client
    public FootballService(FootballApiClient apiClient) {
        this.apiClient = apiClient;
    }

    public String getUpcomingMatches() {
        // League 1 is World Cup, Season 2022
        return apiClient.fetchFromApi("/fixtures?league=1&season=2022");
    }

    public String getMatchLineups(Long fixtureId) {
        return apiClient.fetchFromApi("/fixtures/lineups?fixture=" + fixtureId);
    }

    public String getMatchPlayers(Long fixtureId) {
        return apiClient.fetchFromApi("/fixtures/players?fixture=" + fixtureId);
    }

    public String getPredictions(Long fixtureId) {
        return apiClient.fetchFromApi("/predictions?fixture=" + fixtureId);
    }

    public String getStandings() {
        return apiClient.fetchFromApi("/standings?league=1&season=2022");
    }

    public String getTopScorers() {
        return apiClient.fetchFromApi("/players/topscorers?league=1&season=2022");
    }
    public void deleteFavorite(Long id) {
        if (savedMatchRepository.existsById(id)) {
            savedMatchRepository.deleteById(id);
        } else {
            // This will show up in your Spring Boot console
            System.out.println("Attempted to delete ID " + id + " but it doesn't exist in DB!");
            throw new RuntimeException("Match with ID " + id + " not found in database.");
        }
    }

    /**
     * Fetches match statistics (possession, shots, etc.)
     * This uses the existing FootballApiClient to avoid manual header management.
     */
    public String getMatchStatistics(int fixtureId) {
        return apiClient.fetchFromApi("/fixtures/statistics?fixture=" + fixtureId);
    }
}