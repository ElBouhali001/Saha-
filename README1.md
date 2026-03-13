```
# MediPatient 🏥
**Digital Healthcare Platform for Africa — v2.0.0**

MediPatient is a Healthtech platform designed to modernize the patient-doctor relationship in Africa. It bridges the gap in medical accessibility by combining teleconsultation, mobile money payments, local language support, and centralized medical record management into a single, unified platform.

---

## 🌿 Repository & Branch Strategy (Saha Archive)
This private repository serves as an archive for the project, separated into two distinct branches to preserve both the pure codebase and the showroom-ready demonstration environment:

* **`main` branch (The Foundation):** Contains the pure, untouched software engineering foundation (Frontend and Backend). It is designed to connect to the live Spring Boot REST API on port 7080.
* **`Version-1` branch (The Showroom Demo):** Contains the modified Frontend designed specifically for presentations and QA testing. 
  * **Differences from `main`:** `Version-1` includes a Global Mock Interceptor in `apiClient.ts` that bypasses network connection errors. It injects specific test profiles (like Patient *Amadou Fall* and Doctor *Cheikh Diop*) directly into `SupabaseAuthContext.tsx` to demonstrate full application functionality (Booking, Notifications, Payments) without requiring a live backend connection.

---

## 📋 Overview
MediPatient targets two distinct user roles:
* **Patients** — manage appointments, view prescriptions, track medication adherence, access medical records, and pay for consultations via Mobile Money.
* **Doctors** — manage availability, conduct teleconsultations, issue prescriptions, and monitor patient follow-ups.

The platform is specifically designed for the African market, with localization support for **Wolof** and integration with Mobile Money payment systems (e.g., 10,000 FCFA consultation fee).

## ✨ Features

### Patient Space
| Feature | Description |
| :--- | :--- |
| **Appointment Booking** | Search by specialty or doctor, select a time slot, confirm with payment. |
| **Teleconsultation** | Remote video consultations with doctors. |
| **Prescription History** | View, search, and download past prescriptions. |
| **Medical Records** | Centralized dossier — consultation history, vitals, allergies, chronic conditions. |
| **Treatment Monitoring** | Medication adherence tracking and reminders. |
| **Notifications** | Appointment reminders and medication intake alerts. |
| **Mobile Money Payment** | Secure consultation booking with Mobile Money integration. |
| **Wolof Localization** | Full navigation panel translated into Wolof. |
| **Voice Assistant** | Voice assistance module in local African languages. |

### Doctor Space
| Feature | Description |
| :--- | :--- |
| **Doctor Dashboard** | Manage upcoming consultations and patient list. |
| **Telemedicine Console** | Conduct live video consultations. |
| **Prescription Issuance** | Create and send digital prescriptions. |

## 💻 Tech Stack
* **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, TanStack Query, i18next (French + Wolof), ElevenLabs (AI Voice).
* **Backend:** Java 21, Spring Boot, Spring Security + JWT, Spring Data JPA, PostgreSQL, Flyway.
* **Infrastructure:** Docker, Maven, GitHub.

## 🚀 Demo Mode (Version-1 Branch)
`Version-1` includes a fully self-contained Demo Mode that allows the entire platform to be demonstrated without any backend connection. This is controlled by a single flag in `src/config/app.ts`:

```typescript
// Master switch — set to true for demo/showroom mode
export const IS_DEMO = true;
export const AUTH_MODE: 'supabase' | 'backend' = 'backend';
```

**Demo Accounts:**

* **Patient:** `amadou.qa-test@email.com` | Pass: `password123`
* **Doctor:** `dr.diop@email.com` | Pass: `password123`

## 🔌 API Layer

All API calls go through a single centralized client at `src/services/api/apiClient.ts`. In `Version-1`, if `IS_DEMO = true`, this client intercepts every request before it hits the network and returns realistic mock data to prevent crashes when the backend is offline.

---

*MediPatient — Making healthcare accessible for all Africans. 🌍*
