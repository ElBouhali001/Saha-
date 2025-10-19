# 🚀 Guide de Lancement - MediPatient

## 📋 Prérequis
- Node.js (version recommandée: 20+)
- npm ou yarn
- Un navigateur web moderne

## 🎯 Démarrage Rapide

### 1. Installation des dépendances
```bash
rm -rf node_modules && npm install
```

### 2. Lancement du serveur de développement
```bash
npm run dev
```

### 3. Accès à l'application
- **URL locale:** http://localhost:8080/
- **URL réseau:** http://192.168.1.101:8080/ (si besoin d'accès distant)

## 🔑 Comptes de Test (Mode Mock)

L'application fonctionne avec des données mockées pour la démonstration. Voici les comptes disponibles :

### 👨‍💼 **Administrateur**
- **Email:** `admin@medipatient.com`
- **Mot de passe:** `admin123`
- **Accès:** Gestion complète de la structure, paramètres système

### 👨‍⚕️ **Médecin**
- **Email:** `dr.kouame@medipatient.com`
- **Mot de passe:** `doctor123`
- **Accès:** Consultations, prescriptions, agenda médical

### 👩‍💼 **Agent Médical**
- **Email:** `agent@medipatient.com`
- **Mot de passe:** `agent123`
- **Accès:** Gestion patients, rendez-vous, secrétariat

### 🧑‍🤕 **Patient**
- **Email:** `patient@medipatient.com`
- **Mot de passe:** `patient123`
- **Accès:** Dossier médical, rendez-vous, prescriptions

### 🧪 **Technicien Laboratoire**
- **Email:** `labo@medipatient.com`
- **Mot de passe:** `labo123`
- **Accès:** Gestion des analyses, résultats laboratoire

### 💊 **Pharmacien**
- **Email:** `pharmacien@medipatient.com`
- **Mot de passe:** `pharma123`
- **Accès:** Officine, gestion stock, dispensation

### 🏢 **Agent Assurance**
- **Email:** `assurance@medipatient.com`
- **Mot de passe:** `assurance123`
- **Accès:** Gestion des remboursements, facturation

## 📊 Données Mockées Disponibles

### 👥 **Patients Mock**
- Jean Koné, Marie Traoré, Fatou Sangaré, Amadou Coulibaly
- Dossiers médicaux complets avec historique

### 👨‍⚕️ **Médecins Mock**
- Dr. Kouamé Adjoua (Médecine Générale)
- Dr. Mamadou Diallo (Cardiologie)
- Dr. Aïcha Keita (Pédiatrie)
- Dr. Ahmed Touré (Gynécologie)
- Dr. Fatou Sangaré (Dermatologie)

### 💊 **Prescriptions Mock**
- Prescriptions actives et terminées
- Médicaments avec dosages et durées
- Suivi de dispensation

### 🧪 **Analyses Laboratoire Mock**
- Bilan sanguin complet
- Glycémie à jeun
- Électrocardiogramme
- Radiographie thoracique

## 🔧 Architecture Backend

### ✅ **Réel (Supabase)**
- Base de données PostgreSQL
- 18 migrations complètes
- 3 fonctions Edge Functions :
  - `ai-telemedicine-diagnosis`
  - `analyze-patient-vitals`
  - `scan-medication-barcode`
- Authentification Supabase Auth

### 🎭 **Mock (Démonstration)**
- Données de test dans `/src/hooks/useMock*.ts`
- Authentification locale simulée
- Services AI mockés (diagnostic, analyse)

## ⚙️ Configuration

### Variables d'environnement (`.env`)
```env
VITE_SUPABASE_PROJECT_ID="bmofuisxcssgfuicvrou"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
VITE_SUPABASE_URL="https://bmofuisxcssgfuicvrou.supabase.co"
```

## 🛠️ Scripts Disponibles

```bash
# Développement
npm run dev

# Build de production
npm run build

# Build de développement
npm run build:dev

# Linting
npm run lint

# Preview du build
npm run preview
```

## 🏥 Modules Disponibles

- **👨‍⚕️ Consultation Médicale** - Dossiers patients, diagnostics
- **📅 Gestion Agenda** - Rendez-vous, planification
- **💊 Pharmacie/Officine** - Stock, dispensation, commandes
- **🧪 Laboratoire** - Analyses, résultats
- **💰 Facturation** - Factures, remboursements
- **🤖 IA Médicale** - Diagnostic assisté, analyse vocale
- **🔒 Sécurité** - Audit, permissions, chiffrement


**🎉 Bon développement avec MediPatient !**
