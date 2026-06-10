package com.first.demo.controller;

import com.first.demo.client.FootballApiClient;
import com.first.demo.entity.SavedMatch;
import com.first.demo.repository.SavedMatchRepository;
import com.first.demo.service.FootballService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import com.first.demo.repository.UserSubscriptionRepository;
import com.first.demo.entity.UserSubscription;

@RestController
@RequestMapping("/api/v1/football")
@CrossOrigin(origins = "http://localhost:3000") // Note: SecurityConfig will override this if configured properly
public class FootballController {

    // 1. Initialize the Logger
    private static final Logger log = LoggerFactory.getLogger(FootballController.class);

    @Autowired
    private FootballApiClient footballApiClient;

    @Autowired
    private SavedMatchRepository savedMatchRepository;

    private final FootballService footballService;
    
    @Autowired
    private UserSubscriptionRepository subscriptionRepository;

    // Constructor injection for FootballService
    public FootballController(FootballService footballService) {
        this.footballService = footballService;
    }

    @GetMapping("/ai-sentiment")
    public ResponseEntity<?> getSentiment(@AuthenticationPrincipal Jwt jwt) {
        String email = jwt.getClaim("email"); 
        
        // Check database for Pro status
        UserSubscription sub = subscriptionRepository.findById(email).orElse(null);
        if (sub == null || !sub.isPro()) {
            return ResponseEntity.status(403).body("Upgrade to Pro to access AI Sentiment Analysis.");
        }

        // If Pro, proceed with n8n/AI logic
        return ResponseEntity.ok("Successful AI Analysis Data");
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
        try {
            String userEmail = jwt.getClaim("email");
            if (savedMatchRepository.existsByFixtureIdAndUserEmail(match.getFixtureId(), userEmail)) {
                return ResponseEntity.badRequest().body("Already in your watchlist!");
            }
            match.setUserEmail(userEmail); 
            return ResponseEntity.ok(savedMatchRepository.save(match));
        } catch (Exception e) {
            // Added fail-safe logging for saving matches just in case the DB connection drops
            log.error("INGESTION_FAILURE: Could not save match to watchlist", e);
            throw new RuntimeException("Failed to save favorite match", e);
        }
    }

    @DeleteMapping("/favorites/{id}")
    public ResponseEntity<Void> deleteFavorite(@PathVariable("id") Long id) {
        try {
            footballService.deleteFavorite(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            // 2. Fire the tripwire for Google Cloud -> n8n -> Discord
            log.error("INGESTION_FAILURE: Could not delete favorite match with ID {}", id, e);
            
            // 3. Re-throw to ensure the React frontend knows it failed
            throw new RuntimeException("Failed to delete favorite match", e);
        }
    }
}