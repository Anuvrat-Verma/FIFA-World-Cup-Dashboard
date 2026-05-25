# 🏆 FIFA World Cup Analytics Dashboard

A full-stack application featuring a React frontend and a Spring Boot backend that fetches data from the API-Sports Football API. This project includes a robust, production-ready logging and alerting pipeline using Google Cloud Platform (GCP) to monitor API quota limits and automatically trigger Discord notifications via n8n.

🏗️ Architecture
1. The Core App
Frontend: React.js dashboard that displays football Matches, Standings, and Top Scorers.

Backend: Spring Boot REST API protected by Spring Security (with public read access for football data).

Data Source: API-Sports Football API (v3).

2. The Alerting Pipeline
When the application hits the daily free-tier quota on API-Sports, the API returns a 200 OK but hides a "request limit" string in the body. The backend intercepts this, prevents the frontend from crashing, and triggers the following pipeline:

Spring Boot App logs an [ERROR] containing INGESTION_FAILURE.

Google Cloud Logging ingests the structured log.

GCP Alert Policy detects the log and fires an incident.

Google Cloud Notification Channel sends a POST webhook to n8n (via Ngrok for local testing).

n8n formats the payload and sends an automated message to a Discord channel.

🛠️ Tech Stack
Backend: Java, Spring Boot, Spring Security, RestTemplate, SLF4J/Logback

Frontend: React.js

Cloud & Monitoring: Google Cloud Platform (Logging, Alerting, Billing)

Automation: n8n, Discord Webhooks, Ngrok

🚀 Getting Started
Prerequisites
Java 17+ and Maven

Node.js and npm

An API-Sports API Key

A Google Cloud Account (with an active Individual Billing Account to enable outbound webhooks)

n8n installed locally or cloud-hosted

Backend Setup (Spring Boot)
Clone the repository and navigate to the backend directory.

Ensure you have the Google Cloud Logging appender in your pom.xml:

XML
<dependency>
    <groupId>com.google.cloud</groupId>
    <artifactId>google-cloud-logging-logback</artifactId>
    <version>0.131.0-alpha</version>
</dependency>
Update your application.properties (or environment variables) with your API key:

Properties
api.football.key=YOUR_API_SPORTS_KEY
Run the Spring Boot application:

Bash
mvn spring-boot:run
The backend will run on http://localhost:8080.

Frontend Setup (React)
Navigate to the frontend directory.

Install dependencies:

Bash
npm install
Start the React app:

Bash
npm start
📡 API Endpoints
The following backend endpoints are publicly accessible (configured via SecurityConfig.java):

GET /api/v1/football/matches - Fetches fixtures/matches.

GET /api/v1/football/standings - Fetches league standings.

GET /api/v1/football/topscorers - Fetches league top scorers.

🚨 Google Cloud Alerting Setup Guide
To recreate the Discord alerting pipeline, follow these exact steps in Google Cloud Console:

1. Enable Billing
You must have an active Individual Billing Account linked to your GCP Project, otherwise GCP will block all outbound Webhook Notification Channels.

2. Create the Webhook Notification Channel
Go to Monitoring > Alerting > Edit Notification Channels.

Scroll to Webhooks and click Add New.

Paste your n8n Production Webhook URL (if testing locally, ensure your Ngrok URL is up to date).

3. Create the Log-Based Alert Policy
Go to Logging > Logs Explorer or Monitoring > Alerting > Create Policy.

Log Query: Use the following strict LQL (Logging Query Language) to prevent false positives:

Plaintext
severity=ERROR AND (textPayload=~"INGESTION_FAILURE" OR jsonPayload.message=~"INGESTION_FAILURE")
Threshold: Set condition to Any time series violates > is above > 0.

Rate Limit: Set to 1 notification per 5 minutes to prevent Discord spam.

Notification Channel: Select the Webhook you created in Step 2.
