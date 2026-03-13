-- Fix critical security issue: Restrict profiles table access
-- Drop the overly permissive policy that allows anyone to read all profiles
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;

-- Allow users to view their own profile
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow users to view profiles within their tenant only
CREATE POLICY "Users can view profiles in their tenant"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  tenant_id IS NOT NULL 
  AND tenant_id = get_current_tenant_id()
);

-- Allow admins to view all profiles in their tenant
CREATE POLICY "Admins can view all profiles in tenant"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() 
    AND p.role = 'admin'
    AND p.tenant_id = profiles.tenant_id
  )
);

-- Allow doctors to view patient profiles they need for consultations
CREATE POLICY "Doctors can view patient profiles for appointments"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.doctors d
    JOIN public.appointments a ON a.doctor_id = d.id
    JOIN public.patients p ON p.id = a.patient_id
    WHERE d.user_id = auth.uid()
    AND p.user_id = profiles.id
  )
);