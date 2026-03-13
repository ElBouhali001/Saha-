-- Créer la fonction update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Table pour les formules d'assurance/mutuelle
CREATE TABLE public.insurance_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  insurance_id UUID REFERENCES public.insurances(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  coverage_rate DECIMAL(5,2) NOT NULL DEFAULT 80.00,
  annual_limit DECIMAL(12,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour les plafonds par type de soin
CREATE TABLE public.insurance_plan_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID REFERENCES public.insurance_plans(id) ON DELETE CASCADE,
  care_type VARCHAR(50) NOT NULL,
  annual_limit DECIMAL(12,2) NOT NULL,
  per_act_limit DECIMAL(12,2),
  coverage_rate DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour lier un patient à une formule spécifique
CREATE TABLE public.patient_insurance_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_insurance_id UUID REFERENCES public.patient_insurances(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.insurance_plans(id) ON DELETE CASCADE,
  subscription_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expiry_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour le cumul des consommations
CREATE TABLE public.patient_care_consumption (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_insurance_id UUID REFERENCES public.patient_insurances(id) ON DELETE CASCADE,
  care_type VARCHAR(50) NOT NULL,
  year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  total_consumed DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_covered DECIMAL(12,2) NOT NULL DEFAULT 0,
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(patient_insurance_id, care_type, year)
);

-- Table pour les demandes d'autorisation de soins
CREATE TABLE public.care_authorization_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_insurance_id UUID REFERENCES public.patient_insurances(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.doctors(id),
  care_type VARCHAR(50) NOT NULL,
  requested_amount DECIMAL(12,2) NOT NULL,
  care_description TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  approved_amount DECIMAL(12,2),
  rejection_reason TEXT,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  responded_at TIMESTAMP WITH TIME ZONE,
  responded_by UUID REFERENCES public.profiles(id),
  validity_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Activer RLS sur toutes les tables
ALTER TABLE public.insurance_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_plan_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_insurance_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_care_consumption ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_authorization_requests ENABLE ROW LEVEL SECURITY;

-- Policies pour insurance_plans
CREATE POLICY "Insurance plans are viewable by authenticated users"
ON public.insurance_plans FOR SELECT TO authenticated USING (true);

-- Policies pour insurance_plan_limits
CREATE POLICY "Plan limits are viewable by authenticated users"
ON public.insurance_plan_limits FOR SELECT TO authenticated USING (true);

-- Policies pour patient_insurance_plans
CREATE POLICY "Users can view their own insurance plans"
ON public.patient_insurance_plans FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.patient_insurances pi
    JOIN public.patients p ON p.id = pi.patient_id
    WHERE pi.id = patient_insurance_plans.patient_insurance_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Doctors and agents can view patient insurance plans"
ON public.patient_insurance_plans FOR SELECT
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('doctor', 'admin', 'agent'))
);

-- Policies pour patient_care_consumption
CREATE POLICY "Users can view their own consumption"
ON public.patient_care_consumption FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.patient_insurances pi
    JOIN public.patients p ON p.id = pi.patient_id
    WHERE pi.id = patient_care_consumption.patient_insurance_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Doctors and agents can view patient consumption"
ON public.patient_care_consumption FOR SELECT
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('doctor', 'admin', 'agent'))
);

CREATE POLICY "Doctors can insert patient consumption"
ON public.patient_care_consumption FOR INSERT
WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('doctor', 'admin'))
);

CREATE POLICY "Doctors can update patient consumption"
ON public.patient_care_consumption FOR UPDATE
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('doctor', 'admin'))
);

-- Policies pour care_authorization_requests
CREATE POLICY "Users can view their own authorization requests"
ON public.care_authorization_requests FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.patient_insurances pi
    JOIN public.patients p ON p.id = pi.patient_id
    WHERE pi.id = care_authorization_requests.patient_insurance_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Doctors can manage authorization requests"
ON public.care_authorization_requests FOR ALL
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('doctor', 'admin'))
);

CREATE POLICY "Insurance agents can manage requests"
ON public.care_authorization_requests FOR ALL
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'agent')
);

-- Triggers
CREATE TRIGGER update_insurance_plans_updated_at
BEFORE UPDATE ON public.insurance_plans
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patient_insurance_plans_updated_at
BEFORE UPDATE ON public.patient_insurance_plans
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_care_authorization_requests_updated_at
BEFORE UPDATE ON public.care_authorization_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Fonction pour mettre à jour le cumul de consommation
CREATE OR REPLACE FUNCTION public.update_patient_consumption(
  p_patient_insurance_id UUID,
  p_care_type VARCHAR(50),
  p_amount DECIMAL(12,2),
  p_covered_amount DECIMAL(12,2)
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO patient_care_consumption (
    patient_insurance_id, care_type, year, total_consumed, total_covered, last_updated_at
  )
  VALUES (
    p_patient_insurance_id, p_care_type, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, 
    p_amount, p_covered_amount, now()
  )
  ON CONFLICT (patient_insurance_id, care_type, year)
  DO UPDATE SET 
    total_consumed = patient_care_consumption.total_consumed + p_amount,
    total_covered = patient_care_consumption.total_covered + p_covered_amount,
    last_updated_at = now();
END;
$$;