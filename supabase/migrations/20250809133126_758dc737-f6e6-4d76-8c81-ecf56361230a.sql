-- Patient account claim tokens table and functions

-- 1) Table for claim tokens
CREATE TABLE IF NOT EXISTS public.patient_claim_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token uuid UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '14 days'),
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.patient_claim_tokens ENABLE ROW LEVEL SECURITY;

-- Policies: staff in same tenant can manage tokens
CREATE POLICY IF NOT EXISTS "Staff can manage claim tokens in tenant"
ON public.patient_claim_tokens
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.tenant_id = patient_claim_tokens.tenant_id
      AND p.role IN ('admin','doctor','agent')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.tenant_id = patient_claim_tokens.tenant_id
      AND p.role IN ('admin','doctor','agent')
  )
);

-- 2) Function to create a claim token for a patient
CREATE OR REPLACE FUNCTION public.create_patient_claim_token(p_patient_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile record;
  v_patient record;
  v_token uuid;
BEGIN
  -- Fetch caller profile and patient
  SELECT * INTO v_profile FROM public.profiles WHERE id = auth.uid();
  IF v_profile.id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated or profile missing';
  END IF;

  SELECT id, tenant_id INTO v_patient FROM public.patients WHERE id = p_patient_id;
  IF v_patient.id IS NULL THEN
    RAISE EXCEPTION 'Patient not found';
  END IF;

  IF v_profile.role NOT IN ('admin','doctor','agent') THEN
    RAISE EXCEPTION 'Insufficient role';
  END IF;

  IF v_profile.tenant_id IS DISTINCT FROM v_patient.tenant_id THEN
    RAISE EXCEPTION 'Tenant mismatch';
  END IF;

  -- Create a new token (always create fresh for security)
  INSERT INTO public.patient_claim_tokens (patient_id, tenant_id)
  VALUES (p_patient_id, v_patient.tenant_id)
  RETURNING token INTO v_token;

  RETURN v_token;
END;
$$;

-- 3) Function to claim a patient with a token
CREATE OR REPLACE FUNCTION public.claim_patient_with_token(p_token uuid)
RETURNS TABLE (patient_id uuid, tenant_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_claim record;
  v_user uuid := auth.uid();
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_claim
  FROM public.patient_claim_tokens
  WHERE token = p_token
    AND used_at IS NULL
    AND expires_at > now();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired token';
  END IF;

  -- Link the auth user to the patient if not already linked
  UPDATE public.patients
  SET user_id = v_user, updated_at = now()
  WHERE id = v_claim.patient_id AND (user_id IS NULL OR user_id = v_user);

  -- Ensure access record exists for this tenant
  INSERT INTO public.patient_tenant_access (global_patient_id, local_patient_id, tenant_id, access_level, consent_status, consent_date)
  VALUES (NULL, v_claim.patient_id, v_claim.tenant_id, 'full', 'approved', now())
  ON CONFLICT DO NOTHING;

  -- Mark token as used
  UPDATE public.patient_claim_tokens SET used_at = now() WHERE id = v_claim.id;

  RETURN QUERY SELECT v_claim.patient_id, v_claim.tenant_id;
END;
$$;