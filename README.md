# 🏆 FIFA World Cup Analytics Dashboard

A full-stack sports analytics platform providing real-time match data, group standings, and AI-driven sentiment analysis[cite: 1]. This project features a **React** frontend and a **Spring Boot** backend, integrated with **Firebase** for authentication and **Stripe** for Pro-tier subscriptions[cite: 1].

## 🚀 Features

### **Standard Tier**
*   **Real-time Fixtures:** View live match data and historical results from the 2022 World Cup.
*   **Group Standings & Top Scorers:** Dynamic tables and player statistics updated via external APIs.
*   **Firebase Authentication:** Secure Google Login for personalized experiences.
*   **Match Watchlist:** Save favorite matches to a personalized list stored in PostgreSQL.
*   **Data Visualization:** Automated charts and group analytics powered by **n8n** automation.


### **Pro Tier (Gated AI Workflows)**
*   **Team Sentiment Analysis:** Analyze global RSS feeds to gauge public sentiment for national teams.
*   **AI Chat Space:** Interactive AI-driven chat for deeper tactical insights.
*   **Stripe Integration:** Seamless checkout flow to upgrade from Free to Pro status.

---

## 🛠️ Tech Stack

**Frontend:**
*   React.js
*   Firebase Auth
*   Stripe Elements

**Backend:**
*   Java / Spring Boot
*   Spring Data JPA
*   PostgreSQL
*   Stripe Java SDK

**Automation & AI:**
*   n8n (Workflow Automation)
*   RSS Feed Integration

---

## 📦 Installation & Setup

### **Backend (Spring Boot)**
1.  Navigate to the `worldcup-backend` directory.
2.  Configure your `src/main/resources/application.properties`:
    ```properties
    spring.datasource.url=jdbc:postgresql://localhost:5432/football_db
    spring.datasource.username=postgres
    spring.datasource.password=YOUR_PASSWORD
    
    # Stripe Keys (Use Environment Variables!)
    stripe.api.secretKey=${STRIPE_SECRET_KEY}
    stripe.webhook.secret=${STRIPE_WEBHOOK_SECRET}
    ```
3.  Run the application using Maven or Gradle:
    ```bash
    ./gradlew bootRun
    ```

### **Frontend (React)**
1.  Navigate to the `frontend` directory.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file for Firebase and Stripe configurations.
4.  Start the development server:
    ```bash
    npm start
    ```

---

## 🗄️ Database Schema
The project utilizes a PostgreSQL database (`football_db`) with the following core table for subscription management[cite: 1]:
```sql
CREATE TABLE user_subscriptions (
    email VARCHAR(255) PRIMARY KEY,
    is_pro BOOLEAN DEFAULT false,
    stripe_customer_id VARCHAR(255)
);
