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
	            // 1. PUBLIC ENDPOINTS (No login required)
	            .requestMatchers("/api/v1/billing/status").permitAll()
	            .requestMatchers("/api/v1/billing/webhook").permitAll()
	            .requestMatchers(HttpMethod.GET, "/api/v1/football/**").permitAll()
	        
	            
	            // 3. CATCH-ALL (Any other request requires authentication)
	            .anyRequest().authenticated()
	        )
	        .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()));

	    return http.build();
	}
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // UPDATE 1: Support both Create React App (3000) and Vite (5173) defaults
        configuration.setAllowedOrigins(List.of("http://localhost:3000", "http://localhost:5173")); 
        
        // UPDATE 2: Added PATCH just in case you need partial updates later
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        
        // UPDATE 3: Allow all headers. Restricting this often blocks valid JWT / Trace headers
        configuration.setAllowedHeaders(List.of("*"));
        
        // UPDATE 4: Explicitly allow credentials (vital for JWT/OAuth2 flows)
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}