
-- 1. Table des tenants (organisations)
CREATE TABLE public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subdomain TEXT UNIQUE NOT NULL,
  subscription_plan TEXT NOT NULL DEFAULT 'basic' CHECK (subscription_plan IN ('basic', 'professional', 'enterprise')),
  subscription_status TEXT NOT NULL DEFAULT 'active' CHECK (subscription_status IN ('active', 'suspended', 'cancelled')),
  subscription_valid_until TIMESTAMP WITH TIME ZONE,
  subscription_seats INTEGER DEFAULT 5,
  settings JSONB DEFAULT '{"timezone": "Europe/Paris", "language": "fr", "features": []}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table globale des patients (partagée entre tous les tenants)
CREATE TABLE public.global_patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  social_security_number_hash TEXT NOT NULL,
  unique_hash TEXT UNIQUE NOT NULL, -- SHA256 pour recherche rapide
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by_tenant_id UUID REFERENCES public.tenants(id)
);

-- Index pour recherche rapide
CREATE INDEX idx_global_patients_unique_hash ON public.global_patients(unique_hash);
CREATE INDEX idx_global_patients_names_birth ON public.global_patients(first_name, last_name, birth_date);

-- 3. Table de liaison patient-tenant pour contrôle d'accès
CREATE TABLE public.patient_tenant_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  global_patient_id UUID REFERENCES public.global_patients(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  local_patient_id UUID, -- Lien vers la table patients existante
  access_level TEXT NOT NULL DEFAULT 'full' CHECK (access_level IN ('full', 'readonly', 'emergency')),
  consent_status TEXT NOT NULL DEFAULT 'pending' CHECK (consent_status IN ('granted', 'pending', 'refused')),
  consent_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(global_patient_id, tenant_id)
);

-- 4. Table de configuration de sécurité par tenant
CREATE TABLE public.tenant_security_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  auth_providers TEXT[] DEFAULT ARRAY['local'],
  mfa_required BOOLEAN DEFAULT FALSE,
  mfa_types TEXT[] DEFAULT ARRAY['totp'],
  session_timeout INTEGER DEFAULT 480, -- minutes
  password_min_length INTEGER DEFAULT 8,
  password_require_uppercase BOOLEAN DEFAULT TRUE,
  password_require_numbers BOOLEAN DEFAULT TRUE,
  password_require_special_chars BOOLEAN DEFAULT TRUE,
  ip_whitelist TEXT[],
  allowed_domains TEXT[],
  max_failed_attempts INTEGER DEFAULT 5,
  lockout_duration INTEGER DEFAULT 30, -- minutes
  audit_enabled BOOLEAN DEFAULT TRUE,
  audit_retention_days INTEGER DEFAULT 90,
  encrypted_fields TEXT[] DEFAULT ARRAY['social_security_number', 'phone', 'email'],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id)
);

-- 5. Table des demandes d'accès entre tenants
CREATE TABLE public.patient_access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  global_patient_id UUID REFERENCES public.global_patients(id),
  requesting_tenant_id UUID REFERENCES public.tenants(id),
  owning_tenant_id UUID REFERENCES public.tenants(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  request_reason TEXT,
  response_message TEXT,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days')
);

-- 6. Table d'audit multi-tenant
CREATE TABLE public.tenant_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id),
  user_id UUID,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  ip_address INET,
  user_agent TEXT,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Ajouter tenant_id aux tables existantes
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);
ALTER TABLE public.consultations ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);
ALTER TABLE public.prescriptions ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);

-- 8. Fonctions de sécurité
CREATE OR REPLACE FUNCTION public.get_current_tenant_id()
RETURNS UUID AS $$
BEGIN
  RETURN current_setting('app.current_tenant', true)::UUID;
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.set_current_tenant(tenant_id UUID)
RETURNS VOID AS $$
BEGIN
  PERFORM set_config('app.current_tenant', tenant_id::TEXT, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Fonction pour calculer le hash unique d'un patient
CREATE OR REPLACE FUNCTION public.calculate_patient_unique_hash(
  p_first_name TEXT,
  p_last_name TEXT,
  p_birth_date DATE,
  p_ssn TEXT
) RETURNS TEXT AS $$
DECLARE
  normalized_data TEXT;
BEGIN
  -- Normaliser les données
  normalized_data := LOWER(
    regexp_replace(
      unaccent(p_first_name || '|' || p_last_name || '|' || p_birth_date::TEXT || '|' || regexp_replace(p_ssn, '\s', '', 'g')),
      '[^a-z0-9|]', '', 'g'
    )
  );
  
  -- Retourner le hash SHA256
  RETURN encode(digest(normalized_data, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql;

-- 10. Activer RLS sur toutes les tables tenant-specific
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour isolation par tenant
CREATE POLICY "Tenant isolation policy" ON public.profiles
  FOR ALL USING (tenant_id = get_current_tenant_id());

CREATE POLICY "Tenant isolation policy" ON public.patients
  FOR ALL USING (tenant_id = get_current_tenant_id());

CREATE POLICY "Tenant isolation policy" ON public.doctors
  FOR ALL USING (tenant_id = get_current_tenant_id());

CREATE POLICY "Tenant isolation policy" ON public.appointments
  FOR ALL USING (tenant_id = get_current_tenant_id());

CREATE POLICY "Tenant isolation policy" ON public.consultations
  FOR ALL USING (tenant_id = get_current_tenant_id());

CREATE POLICY "Tenant isolation policy" ON public.prescriptions
  FOR ALL USING (tenant_id = get_current_tenant_id());

-- 11. Insérer des données de démonstration
INSERT INTO public.tenants (name, subdomain, subscription_plan, subscription_status, subscription_seats) VALUES
('Cabinet Médical Martin', 'cabinet-martin', 'professional', 'active', 10),
('Clinique Saint-Louis', 'clinique-saint-louis', 'enterprise', 'active', 50),
('Centre Médical Pasteur', 'centre-pasteur', 'basic', 'active', 5);

-- Insérer les configurations de sécurité par défaut
INSERT INTO public.tenant_security_configs (tenant_id, mfa_required, audit_enabled)
SELECT id, false, true FROM public.tenants;
