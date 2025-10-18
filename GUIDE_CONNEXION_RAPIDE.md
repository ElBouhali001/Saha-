# 🚀 Guide de Connexion Rapide - MédiPatient MVP

## ⚡ Démarrage en 3 minutes

### Étape 1️⃣ : Connexion
```
URL : https://a970c992-0928-47a2-a6ea-693b68e09ab2.lovableproject.com

Email : cmboup20@gmail.com
Mot de passe : Essai2025@
```

### Étape 2️⃣ : Choisir le rôle
- 🩺 **Médecin** : Pour tester l'interface professionnelle
- 👤 **Patient** : Pour tester l'interface patient

### Étape 3️⃣ : Explorer !
Tout est prêt avec des données de démonstration 🎉

---

## 🗄️ Accès Supabase

### Connexion Dashboard
```
URL : https://supabase.com/dashboard
Projet : bmofuisxcssgfuicvrou
```

### Quick Links
- **Table Editor** : Pour voir/modifier les données
- **SQL Editor** : Pour exécuter des requêtes
- **Authentication** : Gérer les utilisateurs

---

## 📊 Créer des données - Copier/Coller

### Nouveau Patient
```sql
INSERT INTO public.mvp_demo_data (data_type, demo_data)
VALUES (
  'patient',
  '{"name": "Votre Nom", "age": 30, "phone": "+221 77 XXX XX XX", "allergies": [], "gender": "M", "blood_type": "O+"}'::jsonb
);
```

### Nouveau Type de Consultation
```sql
INSERT INTO public.mvp_demo_data (data_type, demo_data)
VALUES (
  'consultation_type',
  '{"name": "Nom consultation", "price": 7000, "duration": 20}'::jsonb
);
```

### Nouveau Médicament
```sql
INSERT INTO public.mvp_demo_data (data_type, demo_data)
VALUES (
  'medication',
  '{"name": "Nom médicament", "dosage": "Posologie"}'::jsonb
);
```

### Réinitialiser toutes les données démo
```sql
SELECT public.initialize_mvp_demo_data();
```

---

## 🔧 Problèmes courants

### ❌ "Impossible de se connecter"
1. Vérifier email/mot de passe
2. Vider le cache (Ctrl+Shift+R)
3. Essayer en navigation privée

### ❌ "Aucune donnée visible"
```sql
-- Exécuter dans Supabase SQL Editor
SELECT public.initialize_mvp_demo_data();
```
Puis recharger l'application

### ❌ "Erreur de rôle"
1. Se déconnecter
2. Ouvrir la console (F12)
3. Exécuter : `localStorage.clear()`
4. Se reconnecter

---

## 📞 Support
Email : cmboup20@gmail.com

---

## 📚 Documentation complète
Voir `GUIDE_MVP_MEDIPATIENT.md` pour tous les détails
