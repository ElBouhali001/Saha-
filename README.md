# 🏥 Saha (MediPatient)
**Digital Healthcare Platform for Africa — v2.0.0 (Monorepo)**

MediPatient is a comprehensive Healthtech platform designed to modernize the patient-doctor relationship in Africa. It bridges the gap in medical accessibility by combining teleconsultation, mobile money payments, local language support (Wolof), and centralized medical record management into a single, unified ecosystem.

---

## 🌿 Repository Structure & Branch Strategy

This repository is a **Monorepo** containing both the frontend client and the backend API. 

### 🗂️ Project Layout
* **`/medipatient-medic`** : The React/TypeScript Frontend application.
* **`/medipatient-backend`** : The Java/Spring Boot Backend REST API (Built with Domain-Driven Design).

### 🔀 Branch Strategy
* **`main` branch (Live Environment):** Contains the pure, untouched software engineering foundation. It requires both the backend (port 7080) and frontend (port 8080) to be running simultaneously, along with a live PostgreSQL database.
* **`Version-1` branch (Showroom Demo):** Contains a modified Frontend specifically designed for QA testing and presentations. It features a Global Mock Interceptor and pre-configured test profiles (e.g., Amadou Fall) to demonstrate the app fully offline without needing the backend or database.

---

## ✨ Global Platform Features

The platform serves two primary distinct user roles:

### 🧑‍⚕️ Patient Space
* **Appointment Booking:** Search by specialty/doctor, select time slots, and confirm with Mobile Money integration (e.g., 10,000 FCFA).
* **Teleconsultation:** Remote video consultations with doctors.
* **Medical Records & Monitoring:** Centralized dossier for consultation history, vitals, allergies, and medication adherence tracking.
* **Accessibility:** Full navigation translated into **Wolof** and a native voice assistance module.

### 🩺 Doctor Space
* **Doctor Dashboard:** Manage upcoming consultations and daily patient queues.
* **Telemedicine Console:** Conduct live video consultations.
* **Prescription Issuance:** Create and track digital prescriptions.

*(The platform also supports dedicated interfaces for Admins, Pharmacists, Lab Technicians, and Insurance Agents).*

---

## 💻 Tech Stack Ecosystem

### Frontend (`/medipatient-medic`)
* **Framework:** React 18, TypeScript, Vite
* **UI & Styling:** Tailwind CSS, shadcn/ui
* **State Management:** React Router v6, TanStack Query
* **Localization & AI:** i18next (French + Wolof), ElevenLabs (Voice Synthesis)

### Backend (`/medipatient-backend`)
* **Framework:** Java 21, Spring Boot 3.2.0
* **Architecture:** Domain-Driven Design (DDD)
* **Security:** Spring Security + JWT Authentication
* **Data Layer:** Spring Data JPA, PostgreSQL, Flyway (Migrations)
* **API Documentation:** OpenAPI / Swagger UI

### DevOps & Tools
* Docker & Docker Compose
* Maven (Backend build)
* MapStruct & Lombok

---

## 🚀 Quick Start Guide (Live Environment)

To run the complete application from the `main` branch, ensure you have **Java 21**, **Node.js 18+**, and **Docker Desktop** installed.

### Step 1: Start the Database
Navigate to the backend folder and start the PostgreSQL container:
```bash
cd medipatient-backend
docker-compose up -d
(Adminer UI available at http://localhost:8081)

Step 2: Start the Backend API
Compile and run the Spring Boot application:

Bash
./mvnw clean install
./mvnw spring-boot:run
(The API will be available at http://localhost:7080/api)
(Swagger Docs available at http://localhost:7080/api/swagger-ui.html)

Step 3: Start the Frontend Client
Open a new terminal, navigate to the frontend folder, and run the Vite server:

Bash
cd medipatient-medic
npm install
npm run dev
(The User Interface will be available at http://localhost:8080)
