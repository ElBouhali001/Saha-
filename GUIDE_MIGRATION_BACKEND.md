# 🚀 Guide de Migration Backend - MediPatient
### De Supabase vers Spring Boot + PostgreSQL + Flyway

---

## 📋 Vue d'ensemble du projet

### État actuel
- **Frontend :** React + TypeScript fonctionnel sur http://localhost:8080/
- **Backend :** Supabase (BaaS) avec structure complète mais non utilisée
- **Données :** Système mock local + structure Supabase dormante
- **Authentification :** Double système (mock local + Supabase inutilisé)

### Objectif final
Créer un backend Spring Boot qui remplace Supabase et se connecte au frontend React existant.

---

## 🛠️ Stack Technique Recommandée

### Backend à créer
- **Framework :** Spring Boot 3.2+
- **Langage :** Java 17+ ou 21
- **Base de données :** PostgreSQL 15+
- **Migrations :** Flyway
- **ORM :** Spring Data JPA + Hibernate
- **Sécurité :** Spring Security 6+
- **Documentation API :** SpringDoc OpenAPI (Swagger)
- **Tests :** JUnit 5 + TestContainers

### Frontend (à conserver tel quel)
- React 18 + TypeScript + Vite + TailwindCSS
- React Query pour les appels API
- Seule modification : remplacer les appels Supabase par des appels REST

---

## 📊 Où trouver les sources de données

### 1. Migrations Supabase existantes (18 fichiers)
**Localisation :** `supabase/migrations/`

**Fichiers principaux à analyser :**
- `20250626081400-df61ed9b-3c18-4ad1-bb57-51f02d41d2e5.sql` (structure de base)
- `20250701022326-4f0ae9e7-b729-4a53-bad7-0cbda3af4ccb.sql` (laboratoires, pharmacies)
- Autres fichiers pour fonctionnalités avancées

**Contenu identifié :**
- 14 tables principales (profiles, patients, doctors, appointments, etc.)
- 20 spécialités médicales pré-remplies
- Système de rôles complet (7 rôles)
- Relations complexes avec UUID
- Politiques de sécurité RLS

### 2. Données mock du frontend
**Localisation :** `src/hooks/useMock*.ts`

**Fichiers contenant des données de test :**
- `useMockData.ts` - Tests laboratoire et prescriptions pharmacie
- `useMockDoctors.ts` - 5 médecins avec spécialités
- `useMockPrescriptions.ts` - Historique prescriptions
- `useDemoPatients.ts` - Patients de démonstration
- `useDemoPrescriptions.ts` - Prescriptions de test

### 3. Structure Supabase active
**Localisation :** `.env` + `src/integrations/supabase/`

**Configuration existante :**
- URL Supabase : https://bmofuisxcssgfuicvrou.supabase.co
- Types TypeScript générés dans `src/integrations/supabase/types.ts`
- Client configuré mais peu utilisé

---

## 🏗️ Architecture de Migration

### Phase 1 : Analyse et extraction
**Objectif :** Comprendre la structure existante

**Actions :**
1. **Analyser les migrations Supabase**
   - Lire tous les fichiers `.sql` dans `supabase/migrations/`
   - Identifier les tables principales et leurs relations
   - Noter les contraintes et index

2. **Examiner les données mock**
   - Comprendre la structure des données de test
   - Identifier les entités métier importantes
   - Cartographier les relations

3. **Analyser l'utilisation frontend**
   - Voir comment le frontend appelle actuellement Supabase
   - Identifier les APIs nécessaires
   - Comprendre les formats de données attendus

### Phase 2 : Conception architecture Spring Boot
**Objectif :** Définir la structure du nouveau backend

**Structure recommandée :**
```
medipatient-backend/
├── src/main/java/com/medipatient/
│   ├── config/          # Configuration Spring
│   ├── controller/      # Controllers REST
│   ├── service/         # Services métier
│   ├── repository/      # Repositories JPA
│   ├── entity/          # Entités JPA
│   ├── dto/            # DTOs pour API
│   ├── mapper/         # Mappers entité ↔ DTO
│   └── security/       # Configuration sécurité
├── src/main/resources/
│   ├── db/migration/   # Fichiers Flyway
│   └── application.yml # Configuration
└── src/test/           # Tests
```

### Phase 3 : Migration base de données
**Objectif :** Recréer la structure Supabase avec Flyway

**Approche :**
1. **Convertir les migrations Supabase en Flyway**
   - Un fichier Supabase = Un ou plusieurs fichiers Flyway
   - Adapter la syntaxe (supprimer RLS, auth.users, etc.)
   - Garder la logique métier et les contraintes

2. **Nommage Flyway conventionnel :**
   - `V1__Create_base_structure.sql`
   - `V2__Add_medical_specialties.sql`
   - `V3__Create_appointment_system.sql`
   - etc.

3. **Données de référence**
   - Créer des fichiers pour les données statiques (spécialités médicales)
   - Intégrer les données mock comme données de test

### Phase 4 : Création APIs REST
**Objectif :** Remplacer les appels Supabase par des APIs Spring Boot

**Stratégie :**
1. **Mapper les entités Supabase en entités JPA**
   - Une table Supabase = Une entité JPA
   - Adapter les types (UUID, JSONB, etc.)

2. **Créer les APIs par module métier :**
   - `/api/v1/auth` - Authentification
   - `/api/v1/patients` - Gestion patients
   - `/api/v1/doctors` - Gestion médecins
   - `/api/v1/appointments` - Rendez-vous
   - `/api/v1/prescriptions` - Ordonnances
   - etc.

3. **Respecter les formats frontend**
   - Analyser les réponses attendues par React
   - Maintenir la compatibilité des DTOs

---

## 👥 Découpage pour Étudiants (5 équipes)

### 🏗️ Équipe 1 : Infrastructure & Base de données
**Responsabilités :**
- Setup projet Spring Boot avec Maven/Gradle
- Configuration PostgreSQL + Docker
- Migration complète Flyway (conversion des 18 fichiers Supabase)
- Configuration de base (application.yml, profiles)

**Livrables :**
- Projet Spring Boot initialisé
- Docker Compose avec PostgreSQL
- Tous les fichiers Flyway fonctionnels
- Base de données complètement opérationnelle

**Où trouver les sources :**
- Migrations dans `supabase/migrations/*.sql`
- Configuration dans `.env` et `supabase/config.toml`

### 👤 Équipe 2 : Authentification & Utilisateurs
**Responsabilités :**
- Système d'authentification JWT
- Gestion des profils utilisateurs
- Système de rôles (admin, doctor, patient, etc.)
- Sécurité Spring Security

**Livrables :**
- APIs `/auth/login`, `/auth/register`
- APIs `/users/*` et `/profiles/*`
- Configuration Spring Security
- Gestion des 7 rôles identifiés

**Où trouver les sources :**
- Table `profiles` dans les migrations Supabase
- Données mock dans `src/contexts/AuthContext.tsx`
- Rôles définis dans les migrations

### 🏥 Équipe 3 : Module Médical Core
**Responsabilités :**
- Gestion des patients
- Gestion des médecins et spécialités
- Système de rendez-vous
- Consultations médicales

**Livrables :**
- APIs `/patients/*`, `/doctors/*`, `/specialties/*`
- APIs `/appointments/*`, `/consultations/*`
- Logique métier pour les rendez-vous

**Où trouver les sources :**
- Tables `patients`, `doctors`, `specialties`, `appointments` dans Supabase
- Données mock dans `src/hooks/useMockDoctors.ts`
- 20 spécialités pré-définies dans les migrations

### 💊 Équipe 4 : Prescriptions & Pharmacie
**Responsabilités :**
- Gestion des prescriptions
- Module pharmacie/officine
- Suivi de dispensation
- Historique médicamenteux

**Livrables :**
- APIs `/prescriptions/*`, `/medications/*`
- APIs `/pharmacies/*`
- Logique de suivi des prescriptions

**Où trouver les sources :**
- Tables `prescriptions`, `pharmacy_prescriptions` dans Supabase
- Données mock dans `src/hooks/useMockPrescriptions.ts`
- Module officine dans `GUIDE_MODULE_OFFICINE.md`

### 🧪 Équipe 5 : Laboratoire & Facturation
**Responsabilités :**
- Gestion des laboratoires
- Système d'analyses médicales
- Facturation et assurances
- Reporting

**Livrables :**
- APIs `/laboratories/*`, `/lab-tests/*`
- APIs `/invoices/*`, `/insurance/*`
- Système de remboursement

**Où trouver les sources :**
- Tables `laboratories`, `lab_tests`, `invoices` dans Supabase
- Données mock dans `src/hooks/useMockData.ts`
- Structure assurance dans les migrations

---

## 🔄 Connexion Frontend ↔ Backend

### Stratégie de transition
1. **Phase de développement :** Frontend continue à utiliser les mocks
2. **Phase de tests :** Remplacement progressif des hooks mock par les vrais appels API
3. **Phase finale :** Suppression complète des mocks

### Points de connexion
**Remplacer :**
- `src/integrations/supabase/client.ts` par un client axios
- Tous les hooks `useMock*` par de vrais hooks API
- `src/contexts/AuthContext.tsx` par une authentification JWT

**Garder intact :**
- Toute l'interface React
- La logique métier frontend
- Les composants UI

---

## 📋 Plan d'Exécution (8 semaines)

### Semaines 1-2 : Infrastructure
- Équipe 1 : Setup complet + migrations Flyway
- Toutes les équipes : Analyse des sources existantes

### Semaines 3-4 : APIs Core
- Équipe 2 : Authentification fonctionnelle
- Équipe 3 : APIs patients/médecins de base

### Semaines 5-6 : APIs Métier
- Équipe 4 : Module prescriptions
- Équipe 5 : Module laboratoire
- Équipe 3 : Finalisation rendez-vous

### Semaines 7-8 : Intégration & Tests
- Toutes les équipes : Connexion frontend
- Tests d'intégration complets
- Documentation finale

---

## 🎯 Critères de Réussite

### Technique
- ✅ Base PostgreSQL fonctionnelle avec toutes les données
- ✅ APIs REST complètes et documentées (Swagger)
- ✅ Authentification sécurisée JWT
- ✅ Frontend React connecté au nouveau backend

### Pédagogique
- ✅ Chaque équipe maîtrise son domaine
- ✅ Documentation technique complète
- ✅ Tests unitaires et d'intégration
- ✅ Déploiement fonctionnel

---

## 📚 Ressources Indispensables

### Documentation
- **Spring Boot :** spring.io/projects/spring-boot
- **Flyway :** flywaydb.org/documentation
- **PostgreSQL :** postgresql.org/docs
- **React Query :** tanstack.com/query/latest

### Outils
- **IDE :** IntelliJ IDEA (recommandé) ou VS Code
- **Base de données :** DBeaver ou pgAdmin
- **API Testing :** Postman ou Insomnia
- **Containerisation :** Docker Desktop

### Sources projet
- **Migrations Supabase :** `supabase/migrations/` (18 fichiers)
- **Données mock :** `src/hooks/useMock*.ts`
- **Configuration :** `.env` et `supabase/config.toml`
- **Types existants :** `src/integrations/supabase/types.ts`

---

*Ce guide fournit la roadmap complète pour migrer MediPatient vers Spring Boot. Les étudiants ont toutes les informations nécessaires pour localiser les sources de données existantes et architecturer le nouveau backend de manière structurée et progressive.*
