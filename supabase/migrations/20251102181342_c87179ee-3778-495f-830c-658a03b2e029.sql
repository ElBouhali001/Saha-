-- Créer les tables manquantes pour les autres rôles

-- Table pour les agents administratifs
CREATE TABLE IF NOT EXISTS public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table pour les techniciens de laboratoire
CREATE TABLE IF NOT EXISTS public.lab_technicians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  laboratory_id UUID REFERENCES public.laboratories(id) ON DELETE SET NULL,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table pour les pharmaciens
CREATE TABLE IF NOT EXISTS public.pharmacists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  pharmacy_id UUID REFERENCES public.pharmacies(id) ON DELETE SET NULL,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  license_number TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table pour les agents d'assurance
CREATE TABLE IF NOT EXISTS public.insurance_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  insurance_id UUID REFERENCES public.insurances(id) ON DELETE SET NULL,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_agents ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own agent record"
  ON public.agents FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can view their own lab_technician record"
  ON public.lab_technicians FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can view their own pharmacist record"
  ON public.pharmacists FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can view their own insurance_agent record"
  ON public.insurance_agents FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage agents"
  ON public.agents FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage lab_technicians"
  ON public.lab_technicians FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage pharmacists"
  ON public.pharmacists FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage insurance_agents"
  ON public.insurance_agents FOR ALL
  USING (is_admin(auth.uid()));