# Guide de Configuration Administrateur

## Vue d'ensemble

Ce guide explique comment configurer et utiliser les fonctionnalités modulaires avancées de l'application médicale.

## Accès Administrateur

Pour accéder aux fonctionnalités d'administration :
1. Connectez-vous avec un compte ayant le rôle `admin`
2. Accédez au Tableau de Bord Administrateur
3. Les différentes sections de configuration sont accessibles via les onglets

## 1. Gestion des Abonnements

### Plans Disponibles

L'application propose 4 formules d'abonnement :

#### Freemium (Gratuit)
- 2 utilisateurs maximum
- 50 patients maximum
- Fonctionnalités de base (gestion patients, agenda simple)

#### Individual (29.99€/mois ou 299.90€/an)
- 5 utilisateurs
- 200 patients maximum
- Gestion patients complète
- Agenda avancé
- Téléconsultation

#### Professional (99.99€/mois ou 999.90€/an)
- 20 utilisateurs
- 1000 patients maximum
- Toutes fonctionnalités Individual
- IA diagnostic
- Gestion stock
- Intégrations tierces

#### Enterprise (299.99€/mois ou 2999.90€/an)
- Utilisateurs illimités
- Patients illimités
- Toutes fonctionnalités
- Support prioritaire
- Personnalisation avancée
- API complète

### Configuration

1. Accédez à l'onglet **"Abonnements"**
2. Visualisez votre plan actuel
3. Sélectionnez le plan souhaité
4. Confirmez le changement

## 2. Gestion des Spécialités Médicales

### Configuration des Tarifs

Les spécialités médicales permettent de définir trois types de tarifs :

- **Tarif Homologué** : Pour patients avec assurance/mutuelle
- **Tarif Réduit** : Pour patients sans couverture
- **Tarif Standard** : Tarif de référence

### Créer une Spécialité

1. Onglet **"Spécialités"** > **"Nouvelle Spécialité"**
2. Renseignez :
   - Nom de la spécialité
   - Description (optionnel)
   - Tarif homologué (€)
   - Tarif réduit (€)
   - Tarif standard (€)
   - Durée consultation (minutes)
3. Cliquez sur **"Enregistrer"**

### Modifier une Spécialité

1. Dans la liste, cliquez sur l'icône **"Éditer"**
2. Modifiez les informations
3. Enregistrez les changements

## 3. Rôles dans la Structure Médicale

### Types de Rôles

#### Médecin Principal
- Perçoit **100%** des revenus de consultation
- Aucun partage avec la structure

#### Médecin Secondaire
- Configuration par défaut : **80%** médecin / **20%** structure
- Pourcentages personnalisables (total = 100%)

### Attribuer un Rôle

1. Onglet **"Rôles Médicaux"** > **"Attribuer un Rôle"**
2. Sélectionnez le médecin
3. Choisissez le type de rôle :
   - Principal : automatiquement 100/0
   - Secondaire : ajustez les pourcentages
4. Enregistrez

### Exemple de Configuration

**Médecin Principal :**
```
Dr. Amadou Diallo
- Part médecin : 100%
- Part structure : 0%
```

**Médecin Secondaire :**
```
Dr. Fatou Sall
- Part médecin : 80%
- Part structure : 20%
```

## 4. Gestion des Droits Utilisateurs

### Multi-rôles

Un utilisateur peut avoir plusieurs rôles simultanément :
- Un médecin peut aussi être admin
- Un pharmacien peut aussi être agent

### Attribuer un Rôle

1. Onglet **"Utilisateurs"** > **"Attribuer un Rôle"**
2. Sélectionnez l'utilisateur
3. Choisissez le rôle à ajouter :
   - Administrateur
   - Médecin
   - Agent
   - Patient
   - Technicien Laboratoire
   - Pharmacien
   - Agent Assurance
4. Confirmez

### Rôles Disponibles

| Rôle | Description |
|------|-------------|
| **Administrateur** | Accès complet à toutes les fonctionnalités |
| **Médecin** | Consultations, prescriptions, diagnostics |
| **Agent** | Accueil, gestion rendez-vous, facturation |
| **Patient** | Espace patient, consultations en ligne |
| **Technicien Labo** | Gestion analyses et résultats |
| **Pharmacien** | Gestion stock, délivrance médicaments |
| **Agent Assurance** | Gestion réclamations assurance |

## 5. Facturation avec Tarification Intelligente

### Fonctionnement

Le système calcule automatiquement le tarif en fonction de :
1. La spécialité médicale
2. La couverture du patient (assuré/non assuré)
3. Le rôle du médecin dans la structure
4. Les tarifs personnalisés (si configurés)

### Exemple de Calcul

**Patient avec assurance - Consultation Cardiologie**

```
Spécialité : Cardiologie
Tarif Homologué : 50€

Médecin Secondaire (80/20) :
- Part médecin : 40€
- Part structure : 10€
Total facturé : 50€
```

**Patient sans assurance - Consultation Générale**

```
Spécialité : Médecine Générale
Tarif Réduit : 25€

Médecin Principal (100%) :
- Part médecin : 25€
- Part structure : 0€
Total facturé : 25€
```

### Tarifs Personnalisés

Pour configurer un tarif spécifique à un médecin :

1. Créez d'abord la spécialité avec les tarifs par défaut
2. (Fonctionnalité à venir) Ajoutez un tarif personnalisé via l'interface de pricing

## 6. Modules et Permissions

### Activation des Modules

1. Onglet **"Modules"**
2. Toggle pour activer/désactiver chaque module
3. Les modules dépendants sont gérés automatiquement

### Modules Disponibles

- **Authentification** (Core)
- **Gestion Patients**
- **Rendez-vous**
- **Consultations Médicales**
- **Facturation**
- **Inventaire**
- **Assistant IA**
- **Laboratoire**
- **Pharmacie**
- **Télémédecine**
- **Transmissions/Référencements**

### Permissions par Rôle

Chaque rôle a des permissions spécifiques sur chaque module. Les permissions sont gérées automatiquement selon le rôle attribué.

## 7. Bonnes Pratiques

### Configuration Initiale

1. **Commencez par l'abonnement** : Choisissez le plan adapté à votre structure
2. **Configurez les spécialités** : Définissez tous les tarifs
3. **Attribuez les rôles médicaux** : Configurez le partage des revenus
4. **Gérez les utilisateurs** : Attribuez les rôles appropriés
5. **Activez les modules** : Selon vos besoins

### Sécurité

- Les rôles utilisateurs sont stockés dans une table dédiée (sécurité renforcée)
- Les permissions sont vérifiées côté serveur
- L'isolation des tenants est automatique

### Maintenance

- Revoyez régulièrement les tarifs selon l'évolution du marché
- Vérifiez les rôles et permissions des utilisateurs
- Surveillez l'utilisation pour ajuster votre abonnement

## 8. Support et Assistance

Pour toute question ou problème :
- Consultez la documentation complète
- Contactez le support technique
- Plan Enterprise : Support prioritaire disponible

## 9. API et Intégrations

### Calcul de Tarif (Fonction PostgreSQL)

Pour calculer un tarif de consultation :

```sql
SELECT calculate_consultation_fee(
  _doctor_id := 'uuid-du-medecin',
  _specialty_id := 'uuid-de-la-specialite',
  _patient_has_insurance := true,
  _patient_id := 'uuid-du-patient'
);
```

### Vérification de Rôle

```sql
-- Vérifier si un utilisateur est admin
SELECT is_admin('uuid-utilisateur');

-- Vérifier un rôle spécifique
SELECT user_has_role('uuid-utilisateur', 'doctor');
```

## 10. Évolutions Futures

Fonctionnalités en développement :
- Configuration de tarifs personnalisés par médecin via l'interface
- Rapports d'analyse financière avancés
- Gestion des remises et promotions
- Facturation automatique récurrente
- Intégrations bancaires pour paiements

---

**Version :** 1.0  
**Dernière mise à jour :** 2025-01-02