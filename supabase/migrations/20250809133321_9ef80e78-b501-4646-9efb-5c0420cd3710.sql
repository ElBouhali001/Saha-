-- Fix policy creation without IF NOT EXISTS and adjust claim function to avoid ON CONFLICT

-- Create policy for managing claim tokens by staff in tenant
DO $$
BEGIN
  -- Drop existing policy if present to avoid duplicates during iteration
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'patient_claim_tokens' AND policyname = 'Staff can manage claim tokens in tenant'
  ) THEN
    EXECUTE 'DROP POLICY "Staff can manage claim tokens in tenant" ON public.patient_claim_tokens';
  END IF;
END $$;

CREATE POLICY "Staff can manage claim tokens in tenant"
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

-- Recreate claim function using WHERE NOT EXISTS pattern
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
  SELECT NULL, v_claim.patient_id, v_claim.tenant_id, 'full', 'approved', now()
  WHERE NOT EXISTS (
    SELECT 1 FROM public.patient_tenant_access
    WHERE local_patient_id = v_claim.patient_id AND tenant_id = v_claim.tenant_id
  );

  -- Mark token as used
  UPDATE public.patient_claim_tokens SET used_at = now() WHERE id = v_claim.id;

  RETURN QUERY SELECT v_claim.patient_id, v_claim.tenant_id;
END;
$$;