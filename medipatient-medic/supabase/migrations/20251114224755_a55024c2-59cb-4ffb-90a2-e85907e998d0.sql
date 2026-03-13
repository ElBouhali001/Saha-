-- Fix security issue: Restrict medication_library table access to authenticated medical staff only
-- Drop the overly permissive public policy
DROP POLICY IF EXISTS "Anyone can view medication library" ON public.medication_library;

-- Allow authenticated medical staff to view the medication library
CREATE POLICY "Medical staff can view medication library"
ON public.medication_library
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'doctor', 'pharmacist', 'agent')
  )
);

-- Allow pharmacists and admins to manage the medication library
CREATE POLICY "Pharmacists and admins can manage medication library"
ON public.medication_library
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'pharmacist')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'pharmacist')
  )
);