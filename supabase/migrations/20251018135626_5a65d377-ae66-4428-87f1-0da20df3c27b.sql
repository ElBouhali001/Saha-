-- MVP MédiPatient: Configuration et données de démonstration

-- 1. S'assurer que les tables essentielles existent avec les bonnes structures
-- Table profiles (déjà existante, on vérifie juste)

-- 2. Créer une table pour les données MVP simplifiées si nécessaire
CREATE TABLE IF NOT EXISTS public.mvp_demo_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_type TEXT NOT NULL, -- 'patient', 'doctor', 'appointment', 'prescription', 'consultation'
  demo_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Fonction pour initialiser les données de démo MVP
CREATE OR REPLACE FUNCTION public.initialize_mvp_demo_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insérer des patients de démo
  INSERT INTO public.mvp_demo_data (data_type, demo_data)
  VALUES 
    ('patient', '{"name": "Aminata Diallo", "age": 32, "phone": "+221 77 123 45 67", "allergies": ["Pénicilline"], "gender": "F", "blood_type": "O+"}'),
    ('patient', '{"name": "Moussa Ndiaye", "age": 45, "phone": "+221 76 234 56 78", "allergies": [], "gender": "M", "blood_type": "A+"}'),
    ('patient', '{"name": "Fatou Sall", "age": 28, "phone": "+221 78 345 67 89", "allergies": ["Aspirine", "Latex"], "gender": "F", "blood_type": "B+"}')
  ON CONFLICT DO NOTHING;

  -- Insérer des consultations types
  INSERT INTO public.mvp_demo_data (data_type, demo_data)
  VALUES 
    ('consultation_type', '{"name": "Consultation simple", "price": 5000, "duration": 15}'),
    ('consultation_type', '{"name": "Consultation spécialisée", "price": 10000, "duration": 30}'),
    ('consultation_type', '{"name": "Contrôle", "price": 3000, "duration": 10}'),
    ('consultation_type', '{"name": "Urgence", "price": 15000, "duration": 20}')
  ON CONFLICT DO NOTHING;

  -- Insérer des templates de symptômes
  INSERT INTO public.mvp_demo_data (data_type, demo_data)
  VALUES 
    ('symptom_template', '{"symptoms": ["Fièvre", "Toux", "Douleur abdominale", "Maux de tête", "Fatigue", "Nausées"]}')
  ON CONFLICT DO NOTHING;

  -- Insérer des médicaments courants
  INSERT INTO public.mvp_demo_data (data_type, demo_data)
  VALUES 
    ('medication', '{"name": "Paracétamol 500mg", "dosage": "1cp x3/j pendant 5 jours"}'),
    ('medication', '{"name": "Amoxicilline 1g", "dosage": "1cp x2/j pendant 7 jours"}'),
    ('medication', '{"name": "Ibuprofène 400mg", "dosage": "1cp x3/j pendant 3 jours"}')
  ON CONFLICT DO NOTHING;
END;
$$;

-- 4. RLS Policies pour mvp_demo_data
ALTER TABLE public.mvp_demo_data ENABLE ROW LEVEL SECURITY;

-- Tous les utilisateurs authentifiés peuvent lire les données de démo
CREATE POLICY "Authenticated users can read demo data"
ON public.mvp_demo_data
FOR SELECT
TO authenticated
USING (true);

-- Seuls les admins peuvent modifier les données de démo
CREATE POLICY "Admins can manage demo data"
ON public.mvp_demo_data
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- 5. Vue simplifiée pour les consultations MVP
CREATE OR REPLACE VIEW public.mvp_consultations AS
SELECT 
  c.id,
  c.patient_id,
  c.doctor_id,
  c.consultation_date,
  c.symptoms,
  c.diagnosis,
  c.treatment_plan,
  p.first_name || ' ' || p.last_name as patient_name,
  doc_profile.first_name || ' ' || doc_profile.last_name as doctor_name
FROM public.consultations c
LEFT JOIN public.patients pat ON c.patient_id = pat.id
LEFT JOIN public.profiles p ON pat.user_id = p.id
LEFT JOIN public.doctors doc ON c.doctor_id = doc.id
LEFT JOIN public.profiles doc_profile ON doc.user_id = doc_profile.id;

-- 6. Vue simplifiée pour les rendez-vous MVP
CREATE OR REPLACE VIEW public.mvp_appointments AS
SELECT 
  a.id,
  a.appointment_date,
  a.appointment_time,
  a.reason,
  a.status,
  a.consultation_type,
  p.first_name || ' ' || p.last_name as patient_name,
  pat.id as patient_id,
  doc_profile.first_name || ' ' || doc_profile.last_name as doctor_name,
  a.doctor_id
FROM public.appointments a
LEFT JOIN public.patients pat ON a.patient_id = pat.id
LEFT JOIN public.profiles p ON pat.user_id = p.id
LEFT JOIN public.doctors doc ON a.doctor_id = doc.id
LEFT JOIN public.profiles doc_profile ON doc.user_id = doc_profile.id;

-- 7. Initialiser les données de démo
SELECT public.initialize_mvp_demo_data();

-- 8. Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_mvp_demo_data_type ON public.mvp_demo_data(data_type);

-- 9. Fonction pour récupérer les données de démo par type
CREATE OR REPLACE FUNCTION public.get_mvp_demo_data(p_data_type TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_agg(demo_data)
  INTO result
  FROM public.mvp_demo_data
  WHERE data_type = p_data_type;
  
  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;