
-- Attribuer la spécialité Dentiste au compte jean.dupont@doctor.com
DO $$
DECLARE
  dentist_user_id UUID;
  dentist_doctor_id UUID;
  dentist_specialty_id UUID;
BEGIN
  -- Récupérer l'ID de l'utilisateur jean.dupont@doctor.com
  SELECT id INTO dentist_user_id
  FROM public.profiles
  WHERE email = 'jean.dupont@doctor.com';

  -- Récupérer l'ID de la spécialité Dentiste
  SELECT id INTO dentist_specialty_id
  FROM public.specialties
  WHERE name = 'Dentiste';

  -- Récupérer l'ID du doctor
  SELECT id INTO dentist_doctor_id
  FROM public.doctors
  WHERE user_id = dentist_user_id;

  -- Créer le lien avec la spécialité Dentiste
  IF dentist_doctor_id IS NOT NULL AND dentist_specialty_id IS NOT NULL THEN
    INSERT INTO public.doctor_specialties (doctor_id, specialty_id, is_primary)
    VALUES (dentist_doctor_id, dentist_specialty_id, true)
    ON CONFLICT (doctor_id, specialty_id) 
    DO UPDATE SET is_primary = true;
  END IF;

END $$;
