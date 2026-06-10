package com.first.demo.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import org.springframework.stereotype.Repository;

import com.first.demo.entity.SavedMatch;

@Repository
public interface SavedMatchRepository extends JpaRepository<SavedMatch, Long> {
    // Check if THIS specific user already saved THIS specific match
    boolean existsByFixtureIdAndUserEmail(Long fixtureId, String userEmail);
    
    // Fetch only the matches belonging to this user
    List<SavedMatch> findByUserEmail(String userEmail);
}