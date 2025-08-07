-- Phase 1: Critical Database Security Fixes

-- Enable RLS for tables that don't have it
ALTER TABLE public.global_patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_tenant_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_security_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Add comprehensive RLS policies for global_patients (CRITICAL)
CREATE POLICY "Admins can manage global patients" 
ON public.global_patients 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'admin'
));

CREATE POLICY "Tenants can view patients they have access to" 
ON public.global_patients 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.patient_tenant_access pta
  JOIN public.profiles p ON p.tenant_id = pta.tenant_id
  WHERE pta.global_patient_id = global_patients.id 
  AND p.id = auth.uid()
  AND pta.consent_status = 'approved'
));

-- Add policies for patient_access_requests
CREATE POLICY "Tenants can create access requests" 
ON public.patient_access_requests 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.tenant_id = requesting_tenant_id
  AND profiles.role IN ('admin', 'doctor')
));

CREATE POLICY "Owning tenants can view and respond to requests" 
ON public.patient_access_requests 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.tenant_id = owning_tenant_id
  AND profiles.role IN ('admin', 'doctor')
));

CREATE POLICY "Requesting tenants can view their requests" 
ON public.patient_access_requests 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.tenant_id = requesting_tenant_id
));

-- Add policies for patient_tenant_access
CREATE POLICY "Admins can manage patient tenant access" 
ON public.patient_tenant_access 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'admin'
));

CREATE POLICY "Tenants can view their access records" 
ON public.patient_tenant_access 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.tenant_id = patient_tenant_access.tenant_id
));

-- Add policies for tenant_audit_logs (Admin only)
CREATE POLICY "Only admins can access audit logs" 
ON public.tenant_audit_logs 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'admin'
  AND profiles.tenant_id = tenant_audit_logs.tenant_id
));

-- Add policies for tenant_security_configs (Admin only)
CREATE POLICY "Only admins can manage security configs" 
ON public.tenant_security_configs 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'admin'
  AND profiles.tenant_id = tenant_security_configs.tenant_id
));

-- Add policies for tenants (Admin only)
CREATE POLICY "Only admins can manage tenants" 
ON public.tenants 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'admin'
));

CREATE POLICY "Users can view their own tenant" 
ON public.tenants 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.tenant_id = tenants.id
));

-- Add missing RLS policies for tables with RLS enabled but no policies

-- Insurance claims policies
CREATE POLICY "Doctors and admins can manage insurance claims" 
ON public.insurance_claims 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role IN ('admin', 'doctor')
));

CREATE POLICY "Patients can view their insurance claims" 
ON public.insurance_claims 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.invoices i
  JOIN public.patients p ON p.id = i.patient_id
  WHERE i.id = insurance_claims.invoice_id 
  AND p.user_id = auth.uid()
));

-- Inventory policies
CREATE POLICY "Medical staff can manage inventory" 
ON public.inventory 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role IN ('admin', 'doctor', 'agent')
));

-- Invoice policies
CREATE POLICY "Doctors and admins can manage invoices" 
ON public.invoices 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role IN ('admin', 'doctor', 'agent')
));

CREATE POLICY "Patients can view their invoices" 
ON public.invoices 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.patients p
  WHERE p.id = invoices.patient_id 
  AND p.user_id = auth.uid()
));

-- Patient insurance policies
CREATE POLICY "Medical staff can manage patient insurance" 
ON public.patient_insurances 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role IN ('admin', 'doctor', 'agent')
));

CREATE POLICY "Patients can view their insurance info" 
ON public.patient_insurances 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.patients p
  WHERE p.id = patient_insurances.patient_id 
  AND p.user_id = auth.uid()
));

-- Primary doctor request policies
CREATE POLICY "Doctors can manage primary doctor requests" 
ON public.primary_doctor_requests 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role IN ('admin', 'doctor')
));

CREATE POLICY "Patients can view their primary doctor requests" 
ON public.primary_doctor_requests 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.patients p
  WHERE p.id = primary_doctor_requests.patient_id 
  AND p.user_id = auth.uid()
));

-- Primary doctors policies
CREATE POLICY "Medical staff can manage primary doctors" 
ON public.primary_doctors 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role IN ('admin', 'doctor')
));

CREATE POLICY "Patients can view their primary doctor" 
ON public.primary_doctors 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.patients p
  WHERE p.id = primary_doctors.patient_id 
  AND p.user_id = auth.uid()
));

-- Stock movements policies
CREATE POLICY "Medical staff can manage stock movements" 
ON public.stock_movements 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role IN ('admin', 'doctor', 'agent')
));

-- Secure database functions by adding search_path protection
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.get_current_tenant_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  RETURN current_setting('app.current_tenant', true)::UUID;
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_current_tenant(tenant_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  PERFORM set_config('app.current_tenant', tenant_id::TEXT, true);
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS text
LANGUAGE plpgsql
SET search_path = ''
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.calculate_patient_unique_hash(p_first_name text, p_last_name text, p_birth_date date, p_ssn text)
RETURNS text
LANGUAGE plpgsql
SET search_path = ''
AS $function$
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
$function$;