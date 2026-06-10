# FIFA World Cup Dashboard

A full-stack FIFA World Cup analytics platform built with React and Spring Boot that enables users to explore World Cup data, track favorite teams, and leverage AI-powered insights through automated workflows.

## Features

### Dashboard & Analytics

* Interactive FIFA World Cup analytics dashboard built with React and Spring Boot.
* Visualizes World Cup data through an intuitive user interface.
* Personalized watchlists allowing users to save and remove favorite teams.
* Backend CRUD operations implemented using Spring Data JPA.

### Authentication

* Secure user authentication and authorization using Firebase OAuth.
* Personalized user experience with protected features and data access.

### AI-Powered Sentiment Analysis

* Users can enter a FIFA national team name.
* Gemini LLM analyzes sentiment from live RSS news feeds.
* Provides real-time insights into media sentiment surrounding national teams.

### Automated Reporting Workflow

* Built using n8n, API-Football, and QuickChart.io.
* Retrieves FIFA group-stage points data.
* Generates dynamic bar-chart visualizations automatically.

### Observability & Monitoring

* Automated observability pipeline for backend services.
* Detects data-ingestion API failures.
* Routes logs to Google Cloud for centralized monitoring.
* Sends real-time alerts to developers through Discord webhooks.

## Technology Stack

### Frontend

* React
* JavaScript
* HTML/CSS

### Backend

* Spring Boot
* Spring Data JPA
* REST APIs

### Database

* Relational Database (JPA-based persistence)

### Authentication

* Firebase OAuth

### AI & Automation

* Gemini LLM
* n8n
* RSS Feeds

### Monitoring & Reporting

* Google Cloud Logging
* Discord Webhooks
* API-Football
* QuickChart.io

## Architecture Overview

The application follows a full-stack architecture:

1. React frontend provides data visualization and user interactions.
2. Spring Boot backend exposes REST APIs and manages business logic.
3. Spring Data JPA handles persistence and watchlist management.
4. Firebase OAuth secures user authentication.
5. n8n workflows automate reporting, sentiment analysis, and observability processes.
6. Google Cloud and Discord integrations provide monitoring and alerting capabilities.

## Key Workflows

### 1. Team Sentiment Analysis

* User submits a FIFA national team name.
* RSS news feeds are collected.
* Gemini LLM performs sentiment analysis.
* Results are displayed through the dashboard.

### 2. FIFA Group Points Visualization

* Data is fetched from API-Football.
* QuickChart.io generates bar-chart visualizations.
* Charts are presented within automated reports.

### 3. Backend Observability

* API failures are detected automatically.
* Logs are forwarded to Google Cloud.
* Discord notifications alert developers in real time.

## Author

**Anuvrat Verma**
