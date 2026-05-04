package com.first.demo.controller;

import com.first.demo.service.BillingService;
import com.first.demo.repository.UserSubscriptionRepository;
import com.first.demo.entity.UserSubscription;
import com.stripe.model.checkout.Session;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import com.stripe.model.Event;
import com.stripe.net.Webhook;
import com.google.gson.Gson;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/billing")
@CrossOrigin(origins = "http://localhost:3000")
public class BillingController {

    @Autowired
    private BillingService billingService;

    @Autowired
    private UserSubscriptionRepository subscriptionRepository;

    @Value("${stripe.webhook.secret}")
    private String endpointSecret;
    
    @GetMapping("/status")
    public ResponseEntity<Map<String, Boolean>> getProStatus(@RequestParam String email) {
        // 1. Log the incoming email to the console
        System.out.println("DEBUG: Checking Pro for -> [" + email + "]");

        // 2. Try to find the email by trimming it, or use a custom query
        boolean isPro = subscriptionRepository.findAll().stream()
                .anyMatch(s -> s.getEmail().trim().equalsIgnoreCase(email.trim()) && s.isPro());

        System.out.println("DEBUG: Result -> " + isPro);
        return ResponseEntity.ok(Map.of("isPro", isPro));
    }
    /**
     * Initiates the Stripe Checkout process.
     * Uses the JWT to identify the user email automatically.
     */
    @PostMapping("/checkout")
    public ResponseEntity<Map<String, String>> startCheckout(@AuthenticationPrincipal Jwt jwt) throws Exception {
        // Extract email from the Firebase token claims
        String email = jwt.getClaim("email"); 
        
        // Create the Stripe session URL
        String url = billingService.createCheckoutSession(email);
        
        // Return the URL so the React frontend can redirect the user
        return ResponseEntity.ok(Map.of("url", url));
    }

    /**
     * Secure Webhook endpoint that Stripe calls after a successful payment.
     * This bypasses standard Auth because it comes from Stripe's servers.
     */
    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload, 
            @RequestHeader("Stripe-Signature") String sigHeader) {
        
        try {
            // 1. Verify the signature (Security Handshake)
            Event event = Webhook.constructEvent(payload, sigHeader, endpointSecret);
            System.out.println("🔔 WEBHOOK RECEIVED! Event Type: " + event.getType());

            // 2. Only process the final success signal
            if ("checkout.session.completed".equals(event.getType())) {
                
                // 3. THE BULLETPROOF HACK: Convert to Map to avoid strict SDK types
                String json = event.getData().getObject().toJson();
                Gson gson = new Gson();
                Map<String, Object> sessionMap = gson.fromJson(json, Map.class);
                
                // 4. Extract the user's email with fallbacks
                String email = (String) sessionMap.get("customer_email");
                
                if (email == null && sessionMap.get("customer_details") != null) {
                    Map<String, Object> details = (Map<String, Object>) sessionMap.get("customer_details");
                    email = (String) details.get("email");
                }

                System.out.println("📧 Extracted Email: " + email);

                if (email != null) {
                    // 5. Update the football_db user_subscriptions table
                    UserSubscription sub = subscriptionRepository.findById(email)
                            .orElse(new UserSubscription());
                    
                    sub.setEmail(email);
                    sub.setPro(true); // Flipped to true for the 'football_db'
                    
                    subscriptionRepository.save(sub);
                    System.out.println("✅ DATABASE UPDATED FOR: " + email);
                } else {
                    System.err.println("❌ ERROR: Could not find email in Stripe payload.");
                }
            } else {
                // Skips secondary events like payment_intent.created
                System.out.println("⏩ Skipping event: " + event.getType());
            }

            return ResponseEntity.ok("Webhook Received");

        } catch (com.stripe.exception.SignatureVerificationException e) {
            System.err.println("⚠️ SIG ERROR: Verification failed. Check your secret key.");
            return ResponseEntity.status(400).body("Signature Error");
        } catch (Exception e) {
            System.err.println("⚠️ WEBHOOK CRASHED: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(400).body("Internal Error");
        }
    }
}