
-- Créer la spécialité Dentiste si elle n'existe pas
INSERT INTO public.specialties (id, name, description)
VALUES (
  gen_random_uuid(),
  'Dentiste',
  'Soins dentaires et orthodontie'
)
ON CONFLICT (name) DO NOTHING;

-- Utiliser le compte existant cmboup20@gmail.com et lui ajouter la spécialité Dentiste
DO $$
DECLARE
  dentist_user_id UUID;
  dentist_doctor_id UUID;
  dentist_specialty_id UUID;
BEGIN
  -- Récupérer l'ID de l'utilisateur existant
  SELECT id INTO dentist_user_id
  FROM public.profiles
  WHERE email = 'cmboup20@gmail.com';

  -- Récupérer l'ID de la spécialité Dentiste
  SELECT id INTO dentist_specialty_id
  FROM public.specialties
  WHERE name = 'Dentiste';

  -- Récupérer l'ID du doctor
  SELECT id INTO dentist_doctor_id
  FROM public.doctors
  WHERE user_id = dentist_user_id;

  -- Créer le lien avec la spécialité Dentiste (en plus de Gynécologie)
  IF dentist_doctor_id IS NOT NULL AND dentist_specialty_id IS NOT NULL THEN
    INSERT INTO public.doctor_specialties (doctor_id, specialty_id, is_primary)
    VALUES (dentist_doctor_id, dentist_specialty_id, false)
    ON CONFLICT (doctor_id, specialty_id) DO NOTHING;
  END IF;

END $$;
