package com.first.demo.config; // Ensure this matches your project structure

import java.util.Arrays;
import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

	@Bean
	public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
	    http
	        .cors(Customizer.withDefaults())
	        .csrf(csrf -> csrf.disable())
	        .authorizeHttpRequests(auth -> auth
	        	.requestMatchers("/api/v1/billing/webhook").permitAll() // IMPORTANT: Stripe can't login!
	            .requestMatchers("/api/v1/billing/checkout").authenticated()
	            .requestMatchers("/api/v1/football/ai-sentiment").authenticated()
	            // 1. Allow everyone to SEE the data (Matches, Standings, Scorers)
	            .requestMatchers(HttpMethod.GET, "/api/v1/football/**").permitAll()
	            
	            // 2. ONLY logged-in users can SAVE or VIEW their watchlist
	            .requestMatchers("/api/v1/football/favorites/**").authenticated()
	            
	            .anyRequest().authenticated()
	        )
	        .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()));

	    return http.build();
	}

    // This Bean allows your React app (on port 3000) to talk to this API
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000")); // Your React URL
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}