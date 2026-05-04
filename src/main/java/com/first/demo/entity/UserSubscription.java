package com.first.demo.entity;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "user_subscriptions")
@Data
public class UserSubscription {
    @Id
    private String email; 

    // Explicitly map to the 'is_pro' column shown in your PSQL output
    @JsonProperty("isPro") // This forces the JSON key to be "isPro" for React
    @Column(name = "is_pro") 
    private boolean isPro = false;

    @Column(name = "stripe_customer_id")
    private String stripeCustomerId;
}