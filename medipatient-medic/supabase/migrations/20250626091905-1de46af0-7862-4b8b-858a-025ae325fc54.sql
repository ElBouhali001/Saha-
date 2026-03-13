
-- Créer une table de liaison pour les spécialités des médecins (relation many-to-many)
CREATE TABLE public.doctor_specialties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE,
  specialty_id UUID REFERENCES public.specialties(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false, -- Pour indiquer la spécialité principale
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(doctor_id, specialty_id) -- Empêcher les doublons
);

-- Activer RLS sur la nouvelle table
ALTER TABLE public.doctor_specialties ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour doctor_specialties
CREATE POLICY "Everyone can view doctor specialties" 
  ON public.doctor_specialties FOR SELECT TO authenticated USING (true);

CREATE POLICY "Doctors and admins can manage doctor specialties" 
  ON public.doctor_specialties FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('doctor', 'admin'))
  );

-- Créer un index pour optimiser les requêtes
CREATE INDEX idx_doctor_specialties_doctor_id ON public.doctor_specialties(doctor_id);
CREATE INDEX idx_doctor_specialties_specialty_id ON public.doctor_specialties(specialty_id);
