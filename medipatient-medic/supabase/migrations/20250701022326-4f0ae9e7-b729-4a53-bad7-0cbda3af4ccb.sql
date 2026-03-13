
-- Créer les nouvelles tables pour les laboratoires
CREATE TABLE public.laboratories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  api_endpoint TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Créer les nouvelles tables pour les pharmacies
CREATE TABLE public.pharmacies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  api_endpoint TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Créer les nouvelles tables pour les assurances
CREATE TABLE public.insurances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  api_endpoint TEXT,
  coverage_rate INTEGER DEFAULT 70,
  annual_limit INTEGER DEFAULT 500000,
  reimbursement_delay INTEGER DEFAULT 15,
  data_format TEXT DEFAULT 'JSON',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour les analyses de laboratoire
CREATE TABLE public.lab_tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id),
  doctor_id UUID REFERENCES public.doctors(id),
  laboratory_id UUID REFERENCES public.laboratories(id),
  consultation_id UUID REFERENCES public.consultations(id),
  test_type TEXT NOT NULL,
  test_name TEXT NOT NULL,
  status TEXT DEFAULT 'prescribed', -- prescribed, scheduled, completed, results_available
  appointment_date DATE,
  appointment_time TIME,
  preparation_instructions TEXT[],
  results JSONB,
  results_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour les ordonnances en pharmacie
CREATE TABLE public.pharmacy_prescriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prescription_id UUID REFERENCES public.prescriptions(id),
  pharmacy_id UUID REFERENCES public.pharmacies(id),
  status TEXT DEFAULT 'received', -- received, preparing, ready, delivered
  availability_status TEXT DEFAULT 'available', -- available, partial, substitution_needed
  substitutions JSONB,
  ready_date TIMESTAMP WITH TIME ZONE,
  delivered_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour les relations médecin traitant
CREATE TABLE public.primary_doctor_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id),
  doctor_id UUID REFERENCES public.doctors(id),
  status TEXT DEFAULT 'pending', -- pending, accepted, refused
  request_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  response_date TIMESTAMP WITH TIME ZONE,
  response_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(patient_id, doctor_id)
);

-- Table pour stocker les médecins traitants actifs
CREATE TABLE public.primary_doctors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id),
  doctor_id UUID REFERENCES public.doctors(id),
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(patient_id, doctor_id)
);

-- Table pour les assurances des patients
CREATE TABLE public.patient_insurances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id),
  insurance_id UUID REFERENCES public.insurances(id),
  policy_number TEXT NOT NULL,
  coverage_rate INTEGER DEFAULT 70,
  annual_limit INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour le suivi des remboursements
CREATE TABLE public.insurance_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID REFERENCES public.invoices(id),
  patient_insurance_id UUID REFERENCES public.patient_insurances(id),
  amount_claimed INTEGER NOT NULL,
  amount_approved INTEGER,
  status TEXT DEFAULT 'transmitted', -- transmitted, accepted, rejected, paid
  transmission_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  response_date TIMESTAMP WITH TIME ZONE,
  payment_date TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Ajouter des nouveaux rôles dans les profils
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS structure_type TEXT DEFAULT 'medical_center';
-- structure_type peut être: medical_center, laboratory, pharmacy, insurance

-- Mettre à jour les rôles existants pour inclure les nouveaux profils
-- Les rôles peuvent maintenant être: admin, doctor, agent, patient, lab_technician, pharmacist, insurance_agent

-- Insérer quelques données de test
INSERT INTO public.laboratories (name, address, phone, email) VALUES
('Laboratoire Central', '123 Avenue Principale, Abidjan', '+225-01-02-03-04', 'contact@labcentral.ci'),
('Bio-Analyses Plus', '456 Boulevard Commerce, Abidjan', '+225-05-06-07-08', 'info@bioanalysesplus.ci');

INSERT INTO public.pharmacies (name, address, phone, email) VALUES
('Pharmacie de la Paix', '789 Rue de la Paix, Abidjan', '+225-09-10-11-12', 'contact@pharmaciepaix.ci'),
('Pharmacie Moderne', '321 Avenue Centrale, Abidjan', '+225-13-14-15-16', 'info@pharmaciemoderne.ci');

INSERT INTO public.insurances (name, coverage_rate, annual_limit) VALUES
('CNPS', 70, 500000),
('IPRES', 80, 750000),
('Assurance Privée Plus', 90, 1000000);

-- Activer RLS sur toutes les nouvelles tables
ALTER TABLE public.laboratories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacy_prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.primary_doctor_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.primary_doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_insurances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_claims ENABLE ROW LEVEL SECURITY;

-- Politiques RLS basiques (à affiner selon les besoins spécifiques)
CREATE POLICY "Users can view laboratories" ON public.laboratories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can view pharmacies" ON public.pharmacies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can view insurances" ON public.insurances FOR SELECT TO authenticated USING (true);

-- Politiques plus restrictives pour les données sensibles
CREATE POLICY "Doctors can manage lab tests" ON public.lab_tests FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('doctor', 'admin'))
);

CREATE POLICY "Pharmacists can manage prescriptions" ON public.pharmacy_prescriptions FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('pharmacist', 'doctor', 'admin'))
);
