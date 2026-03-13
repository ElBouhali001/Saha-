-- Create subscription plans enum
CREATE TYPE public.subscription_plan AS ENUM ('freemium', 'individual', 'professional', 'enterprise');

-- Create medical structure roles enum
CREATE TYPE public.medical_structure_role AS ENUM ('primary_doctor', 'secondary_doctor');

-- Create pricing type enum
CREATE TYPE public.pricing_type AS ENUM ('standard', 'insurance', 'reduced');

-- Table for subscription plans management
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_type subscription_plan NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  price_monthly NUMERIC(10, 2) NOT NULL DEFAULT 0,
  price_yearly NUMERIC(10, 2) NOT NULL DEFAULT 0,
  max_users INTEGER,
  max_patients INTEGER,
  modules_enabled TEXT[] DEFAULT ARRAY[]::TEXT[],
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table for tenant subscriptions
CREATE TABLE public.tenant_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  plan_type subscription_plan NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'suspended', 'expired')),
  started_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id)
);

-- Table for medical specialties with pricing
CREATE TABLE public.medical_specialties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  standard_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
  insurance_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
  reduced_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
  consultation_duration INTEGER DEFAULT 30,
  is_active BOOLEAN DEFAULT true,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table for doctor structure roles and revenue sharing
CREATE TABLE public.doctor_structure_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE,
  structure_role medical_structure_role NOT NULL DEFAULT 'secondary_doctor',
  revenue_percentage NUMERIC(5, 2) NOT NULL DEFAULT 80.00 CHECK (revenue_percentage >= 0 AND revenue_percentage <= 100),
  structure_percentage NUMERIC(5, 2) NOT NULL DEFAULT 20.00 CHECK (structure_percentage >= 0 AND structure_percentage <= 100),
  is_active BOOLEAN DEFAULT true,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(doctor_id, tenant_id),
  CONSTRAINT valid_percentages CHECK (revenue_percentage + structure_percentage = 100)
);

-- Table for custom pricing rules per doctor/specialty
CREATE TABLE public.doctor_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE,
  specialty_id UUID REFERENCES public.medical_specialties(id) ON DELETE CASCADE,
  pricing_type pricing_type NOT NULL,
  custom_fee NUMERIC(10, 2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(doctor_id, specialty_id, pricing_type, tenant_id)
);

-- Table for user roles (security best practice)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'doctor', 'agent', 'patient', 'lab_technician', 'pharmacist', 'insurance_agent')),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role, tenant_id)
);

-- Table for module permissions per role
CREATE TABLE public.role_module_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL,
  module_id TEXT NOT NULL,
  permissions TEXT[] DEFAULT ARRAY[]::TEXT[],
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(role, module_id, tenant_id)
);

-- Function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.user_has_role(_user_id UUID, _role TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND (tenant_id = get_current_tenant_id() OR tenant_id IS NULL)
  )
$$;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT user_has_role(_user_id, 'admin')
$$;

-- Function to calculate consultation fee based on patient insurance and doctor specialty
CREATE OR REPLACE FUNCTION public.calculate_consultation_fee(
  _doctor_id UUID,
  _specialty_id UUID,
  _patient_has_insurance BOOLEAN,
  _patient_id UUID DEFAULT NULL
)
RETURNS NUMERIC
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  fee NUMERIC;
  pricing_type_val pricing_type;
  doctor_role_percentage NUMERIC;
BEGIN
  -- Determine pricing type
  IF _patient_has_insurance THEN
    pricing_type_val := 'insurance';
  ELSE
    pricing_type_val := 'reduced';
  END IF;
  
  -- Try to get custom doctor pricing first
  SELECT custom_fee INTO fee
  FROM public.doctor_pricing
  WHERE doctor_id = _doctor_id
    AND specialty_id = _specialty_id
    AND pricing_type = pricing_type_val
    AND is_active = true
  LIMIT 1;
  
  -- If no custom pricing, use specialty default
  IF fee IS NULL THEN
    IF pricing_type_val = 'insurance' THEN
      SELECT insurance_fee INTO fee
      FROM public.medical_specialties
      WHERE id = _specialty_id AND is_active = true;
    ELSE
      SELECT reduced_fee INTO fee
      FROM public.medical_specialties
      WHERE id = _specialty_id AND is_active = true;
    END IF;
  END IF;
  
  RETURN COALESCE(fee, 0);
END;
$$;

-- Insert default subscription plans
INSERT INTO public.subscription_plans (plan_type, name, description, price_monthly, price_yearly, max_users, max_patients, features) VALUES
  ('freemium', 'Freemium', 'Plan gratuit avec fonctionnalités limitées', 0, 0, 2, 50, 
   '[{"name": "Gestion patients basique"}, {"name": "Agenda simple"}, {"name": "2 utilisateurs max"}]'::jsonb),
  ('individual', 'Individual', 'Pour médecins en cabinet individuel', 29.99, 299.90, 5, 200,
   '[{"name": "Gestion patients complète"}, {"name": "Agenda avancé"}, {"name": "Téléconsultation"}, {"name": "5 utilisateurs"}]'::jsonb),
  ('professional', 'Professional', 'Pour structures médicales moyennes', 99.99, 999.90, 20, 1000,
   '[{"name": "Toutes fonctionnalités Individual"}, {"name": "IA diagnostic"}, {"name": "Gestion stock"}, {"name": "20 utilisateurs"}, {"name": "Intégrations tierces"}]'::jsonb),
  ('enterprise', 'Enterprise', 'Pour grandes structures et hôpitaux', 299.99, 2999.90, NULL, NULL,
   '[{"name": "Toutes fonctionnalités"}, {"name": "Utilisateurs illimités"}, {"name": "Support prioritaire"}, {"name": "Personnalisation avancée"}, {"name": "API complète"}]'::jsonb);

-- Enable RLS on all new tables
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_structure_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_module_permissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_plans
CREATE POLICY "Anyone can view subscription plans"
  ON public.subscription_plans FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage subscription plans"
  ON public.subscription_plans FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));

-- RLS Policies for tenant_subscriptions
CREATE POLICY "Users can view their tenant subscription"
  ON public.tenant_subscriptions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.tenant_id = tenant_subscriptions.tenant_id
    )
  );

CREATE POLICY "Admins can manage tenant subscriptions"
  ON public.tenant_subscriptions FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));

-- RLS Policies for medical_specialties
CREATE POLICY "Users can view specialties in their tenant"
  ON public.medical_specialties FOR SELECT
  TO authenticated
  USING (tenant_id = get_current_tenant_id() OR tenant_id IS NULL);

CREATE POLICY "Admins can manage specialties"
  ON public.medical_specialties FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()) AND (tenant_id = get_current_tenant_id() OR tenant_id IS NULL));

-- RLS Policies for doctor_structure_roles
CREATE POLICY "Medical staff can view structure roles"
  ON public.doctor_structure_roles FOR SELECT
  TO authenticated
  USING (
    tenant_id = get_current_tenant_id() OR
    user_has_role(auth.uid(), 'doctor') OR
    user_has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can manage structure roles"
  ON public.doctor_structure_roles FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()) AND tenant_id = get_current_tenant_id());

-- RLS Policies for doctor_pricing
CREATE POLICY "Medical staff can view pricing"
  ON public.doctor_pricing FOR SELECT
  TO authenticated
  USING (
    tenant_id = get_current_tenant_id() OR
    user_has_role(auth.uid(), 'doctor') OR
    user_has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can manage pricing"
  ON public.doctor_pricing FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()) AND tenant_id = get_current_tenant_id());

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage user roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));

-- RLS Policies for role_module_permissions
CREATE POLICY "Users can view permissions in their tenant"
  ON public.role_module_permissions FOR SELECT
  TO authenticated
  USING (tenant_id = get_current_tenant_id() OR tenant_id IS NULL);

CREATE POLICY "Admins can manage permissions"
  ON public.role_module_permissions FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()) AND (tenant_id = get_current_tenant_id() OR tenant_id IS NULL));