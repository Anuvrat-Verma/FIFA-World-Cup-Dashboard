package com.first.demo.controller;

import com.first.demo.client.FootballApiClient;
import com.first.demo.entity.SavedMatch;
import com.first.demo.repository.SavedMatchRepository;
import com.first.demo.service.FootballService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/football")
@CrossOrigin(origins = "http://localhost:3000")
public class FootballController {

    @Autowired
    private FootballApiClient footballApiClient;

    @Autowired
    private SavedMatchRepository savedMatchRepository;

    private final FootballService footballService;

    // Constructor injection for FootballService
    public FootballController(FootballService footballService) {
        this.footballService = footballService;
    }

    @GetMapping("/matches")
    public ResponseEntity<String> getMatches() {
        return ResponseEntity.ok(footballService.getUpcomingMatches());
    }

    @GetMapping("/predictions/{id}")
    public ResponseEntity<String> getPredictions(@PathVariable Long id) {
        return ResponseEntity.ok(footballService.getPredictions(id));
    }
    
    @GetMapping("/matches/{id}/events")
    public ResponseEntity<String> getMatchEvents(@PathVariable Long id) {
        String response = footballApiClient.fetchFromApi("/fixtures/events?fixture=" + id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/matches/{id}/lineups")
    public ResponseEntity<String> getMatchLineups(@PathVariable Long id) {
        return ResponseEntity.ok(footballService.getMatchLineups(id));
    }

    @GetMapping("/matches/{id}/players")
    public ResponseEntity<String> getMatchPlayers(@PathVariable Long id) {
        return ResponseEntity.ok(footballService.getMatchPlayers(id));
    }

    @GetMapping("/standings")
    public ResponseEntity<String> getStandings() {
        return ResponseEntity.ok(footballService.getStandings());
    }

    @GetMapping("/topscorers")
    public ResponseEntity<String> getTopScorers() {
        return ResponseEntity.ok(footballService.getTopScorers());
    }

    @GetMapping("/statistics")
    public ResponseEntity<String> getStats(@RequestParam int fixture) {
        return ResponseEntity.ok(footballService.getMatchStatistics(fixture));
    }

    // --- Watchlist / Favorites Section ---

    @GetMapping("/favorites")
    public ResponseEntity<List<SavedMatch>> getMyFavorites(@AuthenticationPrincipal Jwt jwt) {
        String userEmail = jwt.getClaim("email");
        return ResponseEntity.ok(savedMatchRepository.findByUserEmail(userEmail));
    }

    @PostMapping("/favorites")
    public ResponseEntity<?> saveMatch(@RequestBody SavedMatch match, @AuthenticationPrincipal Jwt jwt) {
        String userEmail = jwt.getClaim("email");
        if (savedMatchRepository.existsByFixtureIdAndUserEmail(match.getFixtureId(), userEmail)) {
            return ResponseEntity.badRequest().body("Already in your watchlist!");
        }
        match.setUserEmail(userEmail); 
        return ResponseEntity.ok(savedMatchRepository.save(match));
    }

    @DeleteMapping("/favorites/{id}")
    public ResponseEntity<Void> deleteFavorite(@PathVariable("id") Long id) {
        // FIXED: Using footballService which now contains the delete logic
        footballService.deleteFavorite(id);
        return ResponseEntity.noContent().build();
    }
}