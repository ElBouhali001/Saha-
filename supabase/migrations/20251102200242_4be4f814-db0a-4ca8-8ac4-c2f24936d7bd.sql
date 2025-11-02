-- Insérer des données démo pour les rôles de médecins et la facturation

-- D'abord, créer des rôles de médecins (en supposant qu'il existe déjà des doctors)
-- Nous allons ajouter des rôles pour les premiers doctors trouvés dans la base

-- Insérer les rôles de structure pour les médecins de démo
INSERT INTO public.doctor_structure_roles (doctor_id, structure_role, revenue_percentage, structure_percentage, is_active)
SELECT 
  d.id as doctor_id,
  CASE 
    WHEN ROW_NUMBER() OVER (ORDER BY d.created_at) <= 2 THEN 'primary_doctor'::medical_structure_role
    ELSE 'secondary_doctor'::medical_structure_role
  END as structure_role,
  CASE 
    WHEN ROW_NUMBER() OVER (ORDER BY d.created_at) <= 2 THEN 100
    ELSE 80
  END as revenue_percentage,
  CASE 
    WHEN ROW_NUMBER() OVER (ORDER BY d.created_at) <= 2 THEN 0
    ELSE 20
  END as structure_percentage,
  true as is_active
FROM public.doctors d
WHERE d.id IN (SELECT id FROM public.doctors ORDER BY created_at LIMIT 5)
ON CONFLICT DO NOTHING;

-- Créer des factures de démo payées pour illustrer la répartition
-- En supposant qu'il existe déjà des appointments et des patients

-- Créer des factures pour les appointments existants
INSERT INTO public.invoices (invoice_number, patient_id, appointment_id, amount, status, items, created_at, updated_at)
SELECT 
  'INV-DEMO-' || LPAD((ROW_NUMBER() OVER (ORDER BY a.created_at))::TEXT, 6, '0') as invoice_number,
  a.patient_id,
  a.id as appointment_id,
  CASE 
    WHEN a.consultation_type = 'urgence' THEN 15000
    WHEN a.consultation_type = 'specialisee' THEN 10000
    ELSE 5000
  END as amount,
  'paid' as status,
  jsonb_build_array(
    jsonb_build_object(
      'name', 'Consultation ' || a.consultation_type,
      'quantity', 1,
      'unit_price', CASE 
        WHEN a.consultation_type = 'urgence' THEN 15000
        WHEN a.consultation_type = 'specialisee' THEN 10000
        ELSE 5000
      END
    )
  ) as items,
  a.created_at,
  a.updated_at
FROM public.appointments a
WHERE a.status = 'completed'
  AND a.doctor_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.invoices i WHERE i.appointment_id = a.id
  )
LIMIT 20
ON CONFLICT DO NOTHING;

-- Mettre à jour quelques appointments pour marquer leur statut comme completed si nécessaire
UPDATE public.appointments
SET status = 'completed'
WHERE id IN (
  SELECT id FROM public.appointments 
  WHERE doctor_id IS NOT NULL 
  ORDER BY created_at DESC 
  LIMIT 15
)
AND status = 'pending';