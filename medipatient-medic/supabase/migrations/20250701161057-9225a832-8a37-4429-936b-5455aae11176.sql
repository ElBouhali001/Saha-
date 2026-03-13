
-- ==========================================
-- ARCHITECTURE MULTI-TENANT MEDIPATIENT (MISE À JOUR)
-- ==========================================

-- 2. Configuration de sécurité par tenant (création conditionnelle)
CREATE TABLE IF NOT EXISTS public.tenant_security_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  mfa_required BOOLEAN DEFAULT false,
  mfa_types TEXT[] DEFAULT ARRAY['totp'],
  session_timeout INTEGER DEFAULT 480,
  password_min_length INTEGER DEFAULT 8,
  password_require_uppercase BOOLEAN DEFAULT true,
  password_require_numbers BOOLEAN DEFAULT true,
  password_require_special_chars BOOLEAN DEFAULT true,
  ip_whitelist TEXT[],
  allowed_domains TEXT[],
  max_failed_attempts INTEGER DEFAULT 5,
  lockout_duration INTEGER DEFAULT 30,
  audit_enabled BOOLEAN DEFAULT true,
  audit_retention_days INTEGER DEFAULT 90,
  encrypted_fields TEXT[] DEFAULT ARRAY['social_security_number', 'phone', 'email'],
  auth_providers TEXT[] DEFAULT ARRAY['local'],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Table globale des patients (création conditionnelle)
CREATE TABLE IF NOT EXISTS public.global_patients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  social_security_number_hash TEXT NOT NULL,
  unique_hash TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by_tenant_id UUID REFERENCES public.tenants(id)
);

-- 4. Table de liaison patient-tenant
CREATE TABLE IF NOT EXISTS public.patient_tenant_access (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  global_patient_id UUID REFERENCES public.global_patients(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  local_patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  access_level TEXT NOT NULL DEFAULT 'full' CHECK (access_level IN ('full', 'readonly', 'emergency')),
  consent_status TEXT NOT NULL DEFAULT 'pending' CHECK (consent_status IN ('granted', 'pending', 'refused')),
  consent_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(global_patient_id, tenant_id)
);

-- 5. Demandes d'accès aux dossiers patients
CREATE TABLE IF NOT EXISTS public.patient_access_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  global_patient_id UUID REFERENCES public.global_patients(id) ON DELETE CASCADE,
  requesting_tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  owning_tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  request_reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  response_message TEXT,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '7 days'
);

-- 6. Logs d'audit par tenant
CREATE TABLE IF NOT EXISTS public.tenant_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- FONCTIONS UTILITAIRES
-- ==========================================

-- Fonction pour calculer le hash unique d'un patient
CREATE OR REPLACE FUNCTION public.calculate_patient_unique_hash(
  p_first_name TEXT,
  p_last_name TEXT,
  p_birth_date DATE,
  p_ssn TEXT
)
RETURNS TEXT AS $$
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

-- ==========================================
-- MIGRATION DES TABLES EXISTANTES
-- ==========================================

-- Ajouter tenant_id aux tables existantes (seulement si la colonne n'existe pas)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'tenant_id') THEN
    ALTER TABLE public.profiles ADD COLUMN tenant_id UUID REFERENCES public.tenants(id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'tenant_id') THEN
    ALTER TABLE public.patients ADD COLUMN tenant_id UUID REFERENCES public.tenants(id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'doctors' AND column_name = 'tenant_id') THEN
    ALTER TABLE public.doctors ADD COLUMN tenant_id UUID REFERENCES public.tenants(id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'tenant_id') THEN
    ALTER TABLE public.appointments ADD COLUMN tenant_id UUID REFERENCES public.tenants(id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'consultations' AND column_name = 'tenant_id') THEN
    ALTER TABLE public.consultations ADD COLUMN tenant_id UUID REFERENCES public.tenants(id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prescriptions' AND column_name = 'tenant_id') THEN
    ALTER TABLE public.prescriptions ADD COLUMN tenant_id UUID REFERENCES public.tenants(id);
  END IF;

  -- Ajouter des colonnes spéciales pour les patients
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'num_secu_sociale') THEN
    ALTER TABLE public.patients ADD COLUMN num_secu_sociale TEXT;
  END IF;
END $$;

-- ==========================================
-- INDEX POUR PERFORMANCE
-- ==========================================

-- Index pour les recherches de patients par hash
CREATE INDEX IF NOT EXISTS idx_global_patients_unique_hash ON public.global_patients(unique_hash);
CREATE INDEX IF NOT EXISTS idx_global_patients_created_by_tenant ON public.global_patients(created_by_tenant_id);

-- Index pour les accès tenant-patient
CREATE INDEX IF NOT EXISTS idx_patient_tenant_access_global_patient ON public.patient_tenant_access(global_patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_tenant_access_tenant ON public.patient_tenant_access(tenant_id);

-- Index pour les demandes d'accès
CREATE INDEX IF NOT EXISTS idx_patient_access_requests_global_patient ON public.patient_access_requests(global_patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_access_requests_requesting_tenant ON public.patient_access_requests(requesting_tenant_id);
CREATE INDEX IF NOT EXISTS idx_patient_access_requests_owning_tenant ON public.patient_access_requests(owning_tenant_id);

-- Index pour les logs d'audit
CREATE INDEX IF NOT EXISTS idx_tenant_audit_logs_tenant_id ON public.tenant_audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_audit_logs_created_at ON public.tenant_audit_logs(created_at);

-- Index pour l'isolation par tenant
CREATE INDEX IF NOT EXISTS idx_profiles_tenant_id ON public.profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_patients_tenant_id ON public.patients(tenant_id);
CREATE INDEX IF NOT EXISTS idx_doctors_tenant_id ON public.doctors(tenant_id);
CREATE INDEX IF NOT EXISTS idx_appointments_tenant_id ON public.appointments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_consultations_tenant_id ON public.consultations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_tenant_id ON public.prescriptions(tenant_id);

-- ==========================================
-- DONNÉES DE TEST
-- ==========================================

-- Insérer un tenant de test si il n'existe pas
INSERT INTO public.tenants (name, subdomain, subscription_plan, subscription_status, subscription_seats)
VALUES ('Cabinet Medical Martin', 'cabinet-martin', 'professional', 'active', 10)
ON CONFLICT (subdomain) DO NOTHING;

-- Insérer la configuration de sécurité pour le tenant de test
INSERT INTO public.tenant_security_configs (tenant_id, mfa_required, audit_enabled)
SELECT id, false, true FROM public.tenants WHERE subdomain = 'cabinet-martin'
ON CONFLICT DO NOTHING;
