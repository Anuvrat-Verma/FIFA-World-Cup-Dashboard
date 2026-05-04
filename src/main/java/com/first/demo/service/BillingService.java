package com.first.demo.service;

import com.stripe.Stripe;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;

@Service
public class BillingService {

    @Value("${stripe.api.key}")
    private String stripeApiKey;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeApiKey;
    }

    public String createCheckoutSession(String userEmail) throws Exception {
        SessionCreateParams params = SessionCreateParams.builder()
            .setMode(SessionCreateParams.Mode.PAYMENT)
            .setSuccessUrl("http://localhost:3000/success")
            .setCancelUrl("http://localhost:3000/cancel")
            .setCustomerEmail(userEmail)
            .addLineItem(SessionCreateParams.LineItem.builder()
                .setQuantity(1L)
                .setPriceData(SessionCreateParams.LineItem.PriceData.builder()
                    .setProduct("prod_USH1vmcLpfGwJM") // Your exact Product ID
                    .setUnitAmount(10000L) // 10000 cents = $100.00 USD
                    .setCurrency("usd") // Currency set to USD
                    .build()) // Builds the PriceData
                .build()) // Builds the LineItem
            .build(); // Builds the SessionCreateParams (This is what was missing!)

        Session session = Session.create(params);
        return session.getUrl();
    }
}