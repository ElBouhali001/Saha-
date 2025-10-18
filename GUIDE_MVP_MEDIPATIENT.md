# Guide Complet MédiPatient MVP

## 📋 Table des matières
1. [Introduction](#introduction)
2. [Architecture du MVP](#architecture)
3. [Configuration de la base de données](#configuration-base)
4. [Guide de connexion](#guide-connexion)
5. [Création de données](#creation-donnees)
6. [Utilisation Interface Médecin](#interface-medecin)
7. [Utilisation Interface Patient](#interface-patient)
8. [Déploiement](#deploiement)
9. [FAQ et Dépannage](#faq)

---

## 🎯 Introduction

MédiPatient MVP est une application médicale mobile-first conçue pour l'Afrique de l'Ouest, optimisée pour :
- 📱 Utilisation mobile (90% des cas)
- 🌐 Connexions instables
- ⚡ Consultations rapides (5-10 min)
- 🗣️ Saisie vocale prioritaire
- 🇫🇷 Bilingue FR/Wolof

---

## 🏗️ Architecture du MVP

### Stack Technique
- **Frontend**: React + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL)
- **UI**: Tailwind CSS + shadcn/ui
- **Authentification**: Supabase Auth
- **Base de données**: PostgreSQL avec RLS

### Modules MVP
1. **Interface Médecin**
   - Dossiers patients simplifiés
   - Consultation optimisée
   - Facturation rapide (Orange Money)
   - Agenda médical

2. **Interface Patient**
   - Dossier médical personnel
   - Réservation de consultations
   - Téléconsultation vidéo
   - Assistant vocal

---

## 🗄️ Configuration de la base de données

### Structure des tables principales

#### Table `mvp_demo_data`
Contient toutes les données de démonstration :
```sql
CREATE TABLE public.mvp_demo_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_type TEXT NOT NULL,
  demo_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Types de données** :
- `patient` : Patients de démonstration
- `consultation_type` : Types de consultations et tarifs
- `symptom_template` : Templates de symptômes
- `medication` : Médicaments courants

#### Vues simplifiées
- `mvp_consultations` : Vue des consultations avec noms
- `mvp_appointments` : Vue des rendez-vous avec détails

### Sécurité (RLS)

**Politiques implémentées** :
```sql
-- Lecture pour tous les utilisateurs authentifiés
CREATE POLICY "Authenticated users can read demo data"
ON mvp_demo_data FOR SELECT TO authenticated USING (true);

-- Modification réservée aux admins
CREATE POLICY "Admins can manage demo data"
ON mvp_demo_data FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE id = auth.uid() AND role = 'admin'
));
```

---

## 🔐 Guide de connexion

### Étape 1 : Accéder à l'application

**URL de développement** :
```
https://a970c992-0928-47a2-a6ea-693b68e09ab2.lovableproject.com
```

### Étape 2 : Se connecter

**Identifiants** :
- Email : `cmboup20@gmail.com`
- Mot de passe : `Essai2025@`

### Étape 3 : Choisir le rôle

Au moment de la connexion, vous pouvez choisir :
- 🩺 **Mode Médecin** : Interface complète pour les professionnels
- 👤 **Mode Patient** : Interface simplifiée pour les patients

Le rôle est stocké temporairement dans le navigateur (localStorage).

### Basculer entre les rôles

Pour changer de rôle :
1. Cliquez sur le bouton de déconnexion
2. Reconnectez-vous en choisissant l'autre rôle

---

## 📊 Création de données

### Méthode 1 : Via l'interface Supabase

#### Accéder à Supabase
1. Aller sur : https://supabase.com/dashboard
2. Se connecter avec votre compte
3. Sélectionner le projet : `bmofuisxcssgfuicvrou`

#### Créer des patients de démo

**Via SQL Editor** :
```sql
INSERT INTO public.mvp_demo_data (data_type, demo_data)
VALUES (
  'patient',
  '{
    "name": "Ibrahima Fall",
    "age": 35,
    "phone": "+221 77 456 78 90",
    "allergies": ["Iode"],
    "gender": "M",
    "blood_type": "AB+"
  }'::jsonb
);
```

**Via Table Editor** :
1. Aller dans `Table Editor`
2. Sélectionner `mvp_demo_data`
3. Cliquer sur `Insert row`
4. Remplir :
   - `data_type` : `patient`
   - `demo_data` : Coller le JSON du patient

#### Créer des types de consultation

```sql
INSERT INTO public.mvp_demo_data (data_type, demo_data)
VALUES (
  'consultation_type',
  '{
    "name": "Consultation pédiatrie",
    "price": 8000,
    "duration": 20
  }'::jsonb
);
```

#### Créer des médicaments

```sql
INSERT INTO public.mvp_demo_data (data_type, demo_data)
VALUES (
  'medication',
  '{
    "name": "Azithromycine 500mg",
    "dosage": "1cp/j pendant 3 jours"
  }'::jsonb
);
```

### Méthode 2 : Via l'application

#### Créer un patient réel

**SQL pour créer un profil patient** :
```sql
-- 1. Créer le profil utilisateur (lié à auth.users)
INSERT INTO public.profiles (id, email, first_name, last_name, role, phone)
VALUES (
  'USER_ID_FROM_AUTH',  -- Récupérer depuis auth.users
  'patient@example.com',
  'Prénom',
  'Nom',
  'patient',
  '+221 77 123 45 67'
);

-- 2. Créer l'entrée patient
INSERT INTO public.patients (user_id, date_of_birth, gender, blood_type, allergies)
VALUES (
  'USER_ID_FROM_AUTH',
  '1990-01-01',
  'M',
  'O+',
  ARRAY['Pénicilline']
);
```

#### Créer un médecin

```sql
-- 1. Créer le profil utilisateur
INSERT INTO public.profiles (id, email, first_name, last_name, role, phone)
VALUES (
  'USER_ID_FROM_AUTH',
  'docteur@example.com',
  'Dr. Prénom',
  'Nom',
  'doctor',
  '+221 76 234 56 78'
);

-- 2. Créer l'entrée médecin
INSERT INTO public.doctors (user_id, license_number, consultation_fee)
VALUES (
  'USER_ID_FROM_AUTH',
  'SEN-MED-2024-001',
  5000
);
```

#### Créer un rendez-vous

```sql
INSERT INTO public.appointments (
  patient_id,
  doctor_id,
  appointment_date,
  appointment_time,
  reason,
  status,
  consultation_type
)
VALUES (
  'PATIENT_UUID',
  'DOCTOR_UUID',
  '2025-01-20',
  '10:00',
  'Consultation générale',
  'confirmed',
  'Consultation simple'
);
```

#### Créer une consultation

```sql
INSERT INTO public.consultations (
  patient_id,
  doctor_id,
  symptoms,
  diagnosis,
  treatment_plan
)
VALUES (
  'PATIENT_UUID',
  'DOCTOR_UUID',
  'Fièvre, Toux',
  'Infection respiratoire',
  'Repos + Paracétamol'
);
```

#### Créer une ordonnance

```sql
INSERT INTO public.prescriptions (
  patient_id,
  doctor_id,
  medications,
  instructions
)
VALUES (
  'PATIENT_UUID',
  'DOCTOR_UUID',
  '[
    {"name": "Paracétamol 500mg", "dosage": "1cp x3/j", "duration": "5 jours"},
    {"name": "Amoxicilline 1g", "dosage": "1cp x2/j", "duration": "7 jours"}
  ]'::jsonb,
  'Prendre après les repas'
);
```

### Méthode 3 : Via fonction d'initialisation

Pour réinitialiser toutes les données de démo :
```sql
SELECT public.initialize_mvp_demo_data();
```

Cette fonction va :
- ✅ Créer 3 patients de démo
- ✅ Créer 4 types de consultation
- ✅ Créer les templates de symptômes
- ✅ Créer 3 médicaments courants

---

## 🩺 Interface Médecin

### Vue d'ensemble

**Navigation** :
- 📋 **Dossiers** : Gestion des patients
- 📝 **Consultation** : Interface de consultation rapide
- 📅 **Agenda** : Calendrier des rendez-vous
- 💰 **Facturation** : Gestion des paiements

### 1. Dossiers Patients

#### Rechercher un patient
- Utiliser la barre de recherche en haut
- Recherche par nom ou téléphone
- Résultats instantanés

#### Consulter un dossier
- Cliquer sur un patient
- Voir : Informations, Allergies, Historique
- Accès rapide aux ordonnances

#### Informations affichées
- ✅ Nom complet
- ✅ Âge
- ✅ Téléphone
- ✅ Allergies (en rouge)
- ✅ Nombre de visites
- ✅ Dernière consultation

### 2. Consultation Optimisée

#### Saisie des symptômes
1. **Méthode rapide** : Cliquer sur les templates
   - Fièvre, Toux, Douleur, etc.
2. **Méthode vocale** : Cliquer sur l'icône micro
3. **Méthode manuelle** : Écrire dans la zone de notes

#### Diagnostic
- Zone de texte dédiée
- Sauvegarde automatique
- Accessible dans l'historique

#### Prescription rapide
1. Sélectionner les médicaments prédéfinis
2. Personnaliser si nécessaire
3. Un clic pour générer l'ordonnance

#### Photos cliniques
- Bouton "Prendre une photo"
- Stockage sécurisé
- Accessible dans le dossier

### 3. Facturation Simple

#### Tarifs prédéfinis
- Consultation simple : 5,000 FCFA
- Consultation spécialisée : 10,000 FCFA
- Contrôle : 3,000 FCFA
- Urgence : 15,000 FCFA

#### Paiement Orange Money
1. Sélectionner le type de consultation
2. Cliquer sur "Payer avec Orange Money"
3. Code envoyé automatiquement au patient
4. Confirmation en 2 secondes

#### Paiement espèces
- Bouton "Paiement en espèces"
- Génération automatique du reçu
- Option d'envoi par SMS

#### Rapport journalier
Affichage en temps réel :
- Nombre de consultations
- Total Orange Money
- Total Espèces
- **Total général**

### 4. Agenda Médical

#### Vue Jour / Semaine
- Basculer avec les boutons en haut
- Navigation par date
- Créneaux de 1 heure

#### Statuts des rendez-vous
- 🔵 **Confirmé** : Patient confirmé
- 🟡 **En attente** : Confirmation en attente
- 🟢 **Terminé** : Consultation terminée
- ⚪ **Disponible** : Créneau libre

#### Actions disponibles
- ✅ Commencer la consultation
- 📞 Appeler le patient
- ❌ Bloquer un créneau

---

## 👤 Interface Patient

### Vue d'ensemble

**Navigation** :
- 📄 **Mon Dossier** : Informations médicales
- 📅 **Réserver** : Prendre rendez-vous
- 📹 **Téléconsult** : Consultation vidéo

### 1. Mon Dossier Médical

#### Informations importantes
- Groupe sanguin
- Allergies (en rouge)
- Affichage permanent en haut

#### Mes Ordonnances
- Liste des ordonnances récentes
- Date et médecin prescripteur
- Nombre de médicaments
- Bouton télécharger (PDF)
- **Scanner une ordonnance** : Photo → OCR automatique

#### Résultats de Laboratoire
- Analyses sanguines
- Radiographies
- Autres examens
- Téléchargement PDF

#### Carnet de Vaccination
- Liste complète des vaccins
- Dates de vaccination
- Rappels automatiques

#### Contacts d'Urgence
- Famille
- Médecin traitant
- Appel en un clic

### 2. Réservation de Consultation

#### Étape 1 : Choisir un médecin
- Liste des médecins disponibles
- Spécialité affichée
- Tarifs visibles
- Sélection en un clic

#### Étape 2 : Choisir la date
- Navigation sur 5 jours
- Dates disponibles uniquement
- Affichage jour/date

#### Étape 3 : Choisir l'heure
- Créneaux de 1 heure
- Disponibilité en temps réel
- Sélection simple

#### Confirmation
- Récapitulatif complet
- Confirmation par SMS
- Rappel 1 jour avant (SMS/WhatsApp)

#### Annulation facile
- Bouton "Annuler" disponible
- Jusqu'à 2h avant le RDV
- Confirmation automatique

### 3. Consultation Vidéo

#### Médecins disponibles
- Statut en ligne en temps réel
- Point vert = disponible
- Spécialité affichée

#### Démarrer l'appel
1. Cliquer sur "Démarrer l'appel"
2. Autoriser caméra/micro
3. Connexion automatique

#### Pendant l'appel
- **Vidéo HD** : Vue du médecin
- **Chat texte** : Messages instantanés
- **Envoi de photos** : Pour montrer symptômes
- **Contrôles** :
  - 📹 Activer/Désactiver caméra
  - 🔇 Mute/Unmute micro
  - 💬 Ouvrir/Fermer chat
  - ☎️ Raccrocher (rouge)

#### Après l'appel
- Ordonnance envoyée par SMS
- Résumé de consultation
- Possibilité de rappel

### 4. Assistant Vocal

#### Langues supportées
- 🇫🇷 Français
- 🇸🇳 Wolof (à venir)

#### Commandes vocales
- "Prendre rendez-vous"
- "Mes ordonnances"
- "Appeler mon médecin"
- "Mes résultats"

#### Utilisation
1. Cliquer sur "Parler à l'assistant"
2. Autoriser le micro
3. Parler naturellement
4. Réponse instantanée

---

## 🚀 Déploiement

### Prérequis
- Compte Lovable
- Projet Supabase configuré
- URL de production

### Étapes de déploiement

#### 1. Configuration Supabase

**URL Configuration** (Authentication > URL Configuration) :
```
Site URL: https://votre-domaine.com
Redirect URLs:
  - https://votre-domaine.com
  - https://a970c992-0928-47a2-a6ea-693b68e09ab2.lovableproject.com
```

#### 2. Déploiement Lovable

1. Cliquer sur **Publish** en haut à droite
2. Configurer le domaine personnalisé (optionnel)
3. Attendre le déploiement (2-3 min)

#### 3. Vérification post-déploiement

✅ **Checklist** :
- [ ] Connexion fonctionne
- [ ] Données de démo visibles
- [ ] Création de rendez-vous OK
- [ ] Génération d'ordonnance OK
- [ ] Paiements (mode test)
- [ ] Téléconsultation vidéo

### Configuration Orange Money (Production)

Pour activer les vrais paiements :
1. Contacter Orange Money Sénégal
2. Obtenir les API credentials
3. Les ajouter dans Supabase Secrets
4. Créer une Edge Function pour gérer les paiements

---

## ❓ FAQ et Dépannage

### Problèmes de connexion

#### "Impossible de se connecter"
- Vérifier l'email et mot de passe
- Vérifier la connexion Internet
- Vider le cache du navigateur

#### "Rôle non détecté"
- Se déconnecter complètement
- Vider le localStorage
- Se reconnecter en choisissant le bon rôle

### Problèmes de données

#### "Aucun patient trouvé"
```sql
-- Exécuter dans Supabase SQL Editor
SELECT public.initialize_mvp_demo_data();
```

#### "Erreur lors de la création"
1. Vérifier les permissions RLS
2. Vérifier que l'utilisateur est authentifié
3. Consulter les logs Supabase

#### "Données non visibles"
1. Vérifier le rôle de l'utilisateur
2. Vérifier les RLS policies
3. Recharger la page

### Problèmes de performance

#### "L'application est lente"
- Vérifier la connexion Internet
- Désactiver les extensions de navigateur
- Utiliser un navigateur récent (Chrome/Safari)

#### "Images ne se chargent pas"
- Vérifier la connexion
- Attendre quelques secondes
- Recharger la page

### Support technique

**Logs Supabase** :
```
Dashboard > Logs > Database / Auth
```

**Console navigateur** :
```
F12 > Console
```

**Contact** :
- Email : cmboup20@gmail.com

---

## 📝 Notes importantes

### Limitations MVP

❌ **Non inclus dans cette version** :
- Paiements réels Orange Money (mode démo uniquement)
- Assistant vocal Wolof (français uniquement)
- Mode offline complet
- Envoi SMS réels (simulé)
- Vidéo en HD (qualité standard)

✅ **Prévu dans la version complète** :
- Intégration Orange Money complète
- Support Wolof natif
- Synchronisation offline
- SMS/WhatsApp réels
- Vidéo haute qualité
- Analyse IA des symptômes
- Reconnaissance vocale avancée

### Données de test

**Ne PAS utiliser en production** :
- Les patients de démo
- Les tarifs de test
- Les paiements simulés

**Créer de vraies données** :
- Suivre la section "Création de données"
- Utiliser de vraies informations
- Configurer les vrais tarifs

### Sécurité

⚠️ **Points d'attention** :
- Activer le HTTPS en production
- Configurer les CORS correctement
- Ne jamais exposer les clés API
- Utiliser RLS sur toutes les tables sensibles
- Logger tous les accès aux données médicales

---

## 🎓 Ressources supplémentaires

### Documentation technique
- [Supabase Docs](https://supabase.com/docs)
- [React Query](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Guides vidéo
(À venir)

### Communauté
- GitHub Issues
- Discord MédiPatient
- Email support

---

**Version** : MVP 1.0  
**Dernière mise à jour** : 18 Janvier 2025  
**Auteur** : MédiPatient Team  
**Contact** : cmboup20@gmail.com

---

## 🚀 Prochaines étapes

1. ✅ Tester toutes les fonctionnalités
2. ✅ Créer des données de test
3. ✅ Inviter des utilisateurs tests
4. ✅ Recueillir les feedbacks
5. ✅ Itérer et améliorer
6. 🚀 Déployer en production

**Bon courage pour le lancement ! 🎉**
