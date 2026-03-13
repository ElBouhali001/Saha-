
-- Créer une table pour gérer les relations de tutelle
CREATE TABLE public.patient_guardians (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  guardian_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  relationship_type TEXT CHECK (relationship_type IN ('parent', 'tuteur_legal', 'autre')) DEFAULT 'parent',
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(patient_id, guardian_id)
);

-- Modifier la table patients pour ajouter des informations sur le titulaire
ALTER TABLE public.patients 
ADD COLUMN is_minor BOOLEAN DEFAULT false,
ADD COLUMN birth_certificate_number TEXT,
ADD COLUMN legal_guardian_consent BOOLEAN DEFAULT false;

-- Activer RLS sur la nouvelle table
ALTER TABLE public.patient_guardians ENABLE ROW LEVEL SECURITY;

-- Politique pour que les tuteurs puissent voir leurs relations
CREATE POLICY "Guardians can view their relationships" 
  ON public.patient_guardians 
  FOR SELECT 
  USING (guardian_id = auth.uid());

-- Politique pour que les tuteurs puissent créer des relations (pour l'ajout d'enfants)
CREATE POLICY "Guardians can create relationships for their patients" 
  ON public.patient_guardians 
  FOR INSERT 
  WITH CHECK (guardian_id = auth.uid());

-- Politique pour que les tuteurs puissent modifier leurs relations
CREATE POLICY "Guardians can update their relationships" 
  ON public.patient_guardians 
  FOR UPDATE 
  USING (guardian_id = auth.uid());

-- Mettre à jour les politiques RLS pour les patients pour inclure l'accès des tuteurs
DROP POLICY IF EXISTS "Patients can view own data" ON public.patients;
DROP POLICY IF EXISTS "Doctors can view patient data" ON public.patients;

-- Nouvelle politique pour que les patients puissent voir leurs propres données
CREATE POLICY "Patients can view own data" ON public.patients FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.id = patients.user_id)
);

-- Nouvelle politique pour que les tuteurs puissent voir les données des patients sous leur tutelle
CREATE POLICY "Guardians can view their patients data" ON public.patients FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.patient_guardians 
    WHERE patient_guardians.patient_id = patients.id 
    AND patient_guardians.guardian_id = auth.uid()
  )
);

-- Politique pour que les médecins puissent voir les données des patients
CREATE POLICY "Doctors can view patient data" ON public.patients FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'doctor')
);

-- Politique pour que les tuteurs puissent modifier les données des patients sous leur tutelle
CREATE POLICY "Guardians can update their patients data" ON public.patients FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.patient_guardians 
    WHERE patient_guardians.patient_id = patients.id 
    AND patient_guardians.guardian_id = auth.uid()
  )
);

-- Mettre à jour les politiques pour les rendez-vous
DROP POLICY IF EXISTS "Patients can view own appointments" ON public.appointments;

CREATE POLICY "Patients can view own appointments" ON public.appointments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.patients 
    WHERE patients.id = appointments.patient_id 
    AND patients.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.patient_guardians 
    WHERE patient_guardians.patient_id = appointments.patient_id 
    AND patient_guardians.guardian_id = auth.uid()
  )
);

-- Politique pour que les tuteurs puissent créer des rendez-vous pour leurs patients
CREATE POLICY "Guardians can create appointments for their patients" ON public.appointments FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.patient_guardians 
    WHERE patient_guardians.patient_id = appointments.patient_id 
    AND patient_guardians.guardian_id = auth.uid()
  )
);
