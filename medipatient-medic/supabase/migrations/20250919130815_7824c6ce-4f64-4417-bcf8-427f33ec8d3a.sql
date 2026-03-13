-- Phase 1: Fix Critical Database Security Issues

-- 1. Remove public access from laboratories table
DROP POLICY IF EXISTS "Users can view laboratories" ON public.laboratories;
CREATE POLICY "Authenticated medical staff can view laboratories" ON public.laboratories
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'doctor', 'agent', 'lab_technician')
  )
);

-- 2. Remove public access from pharmacies table  
DROP POLICY IF EXISTS "Users can view pharmacies" ON public.pharmacies;
CREATE POLICY "Authenticated medical staff can view pharmacies" ON public.pharmacies
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'doctor', 'agent', 'pharmacist')
  )
);

-- 3. Remove public access from insurances table
DROP POLICY IF EXISTS "Users can view insurances" ON public.insurances;
CREATE POLICY "Authenticated medical staff can view insurances" ON public.insurances  
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'doctor', 'agent', 'insurance_agent')
  )
);

-- 4. Remove public access from specialties table
DROP POLICY IF EXISTS "Everyone can view specialties" ON public.specialties;
CREATE POLICY "Authenticated users can view specialties" ON public.specialties
FOR SELECT USING (auth.uid() IS NOT NULL);

-- 5. Remove public access from doctor_specialties table
DROP POLICY IF EXISTS "Everyone can view doctor specialties" ON public.doctor_specialties;
CREATE POLICY "Authenticated users can view doctor specialties" ON public.doctor_specialties
FOR SELECT USING (auth.uid() IS NOT NULL);

-- 6. Strengthen secure transmission access with proper authentication
DROP POLICY IF EXISTS "Recipients can view transmissions with valid access code" ON public.secure_transmissions;
CREATE POLICY "Authenticated recipients can access valid transmissions" ON public.secure_transmissions
FOR SELECT USING (
  auth.uid() IS NOT NULL 
  AND status = 'active' 
  AND expiry_date > now()
  AND (
    -- Original doctor can always view
    EXISTS (
      SELECT 1 FROM consultations c
      JOIN doctors d ON d.id = c.doctor_id  
      WHERE c.id = secure_transmissions.consultation_id 
      AND d.user_id = auth.uid()
    )
    OR
    -- Intended recipient can view
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND (
        (recipient_type = 'doctor' AND p.id = recipient_id)
        OR (recipient_type = 'laboratory' AND p.role = 'lab_technician')  
        OR (recipient_type = 'pharmacy' AND p.role = 'pharmacist')
      )
    )
  )
);

-- 7. Add audit logging trigger for transmission access
CREATE OR REPLACE FUNCTION public.log_transmission_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log successful transmission access
  INSERT INTO tenant_audit_logs (
    tenant_id,
    user_id, 
    resource_type,
    resource_id,
    action,
    details,
    ip_address
  ) VALUES (
    get_current_tenant_id(),
    auth.uid(),
    'secure_transmission',
    NEW.transmission_id,
    'ACCESS',
    jsonb_build_object(
      'access_method', 'code_verification',
      'transmission_status', 'active'
    ),
    NEW.ip_address::inet
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for transmission access logging
DROP TRIGGER IF EXISTS log_transmission_access_trigger ON public.transmission_accesses;
CREATE TRIGGER log_transmission_access_trigger
  AFTER INSERT ON public.transmission_accesses
  FOR EACH ROW EXECUTE FUNCTION public.log_transmission_access();

-- 8. Fix database functions search_path (Phase 2)
CREATE OR REPLACE FUNCTION public.get_current_tenant_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN current_setting('app.current_tenant', true)::UUID;
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;  
END;
$$;

CREATE OR REPLACE FUNCTION public.set_current_tenant(tenant_id uuid)
RETURNS void
LANGUAGE plpgsql  
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM set_config('app.current_tenant', tenant_id::TEXT, true);
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name', 
    NEW.raw_user_meta_data ->> 'last_name',
    NEW.email
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS text
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE
  next_number INTEGER;
  invoice_number TEXT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 5) AS INTEGER)), 0) + 1
  INTO next_number
  FROM public.invoices
  WHERE invoice_number LIKE 'INV-%';
  
  invoice_number := 'INV-' || LPAD(next_number::TEXT, 6, '0');
  RETURN invoice_number;
END;
$$;

CREATE OR REPLACE FUNCTION public.calculate_patient_unique_hash(p_first_name text, p_last_name text, p_birth_date date, p_ssn text)
RETURNS text  
LANGUAGE plpgsql
IMMUTABLE
STRICT
SET search_path = public
AS $$
DECLARE
  normalized_data TEXT;
BEGIN
  -- Normalize data
  normalized_data := LOWER(
    regexp_replace(
      unaccent(p_first_name || '|' || p_last_name || '|' || p_birth_date::TEXT || '|' || regexp_replace(p_ssn, '\s', '', 'g')),
      '[^a-z0-9|]', '', 'g'
    )
  );
  
  -- Return SHA256 hash
  RETURN encode(digest(normalized_data, 'sha256'), 'hex');
END;
$$;