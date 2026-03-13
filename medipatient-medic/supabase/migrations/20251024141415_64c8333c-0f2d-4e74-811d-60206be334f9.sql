-- Créer ou mettre à jour le profil docteur gynécologue
DO $$
DECLARE
  v_user_id uuid;
  v_doctor_id uuid;
  v_specialty_id uuid;
BEGIN
  -- Récupérer l'ID utilisateur
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'cmboup20@gmail.com';
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email cmboup20@gmail.com not found';
  END IF;

  -- Récupérer l'ID de la spécialité Gynécologie
  SELECT id INTO v_specialty_id FROM public.specialties WHERE name = 'Gynécologie';
  
  IF v_specialty_id IS NULL THEN
    RAISE EXCEPTION 'Specialty Gynécologie not found';
  END IF;

  -- Vérifier si le docteur existe déjà
  SELECT id INTO v_doctor_id FROM public.doctors WHERE user_id = v_user_id;

  IF v_doctor_id IS NULL THEN
    -- Créer le profil docteur
    INSERT INTO public.doctors (user_id, license_number, consultation_fee, availability_status)
    VALUES (v_user_id, 'GYN-2024-001', 30000, 'available')
    RETURNING id INTO v_doctor_id;
  ELSE
    -- Mettre à jour le profil docteur
    UPDATE public.doctors
    SET license_number = 'GYN-2024-001',
        consultation_fee = 30000,
        availability_status = 'available'
    WHERE id = v_doctor_id;
  END IF;

  -- Lier la spécialité au docteur
  IF NOT EXISTS (
    SELECT 1 FROM public.doctor_specialties 
    WHERE doctor_id = v_doctor_id AND specialty_id = v_specialty_id
  ) THEN
    INSERT INTO public.doctor_specialties (doctor_id, specialty_id, is_primary)
    VALUES (v_doctor_id, v_specialty_id, true);
  ELSE
    UPDATE public.doctor_specialties
    SET is_primary = true
    WHERE doctor_id = v_doctor_id AND specialty_id = v_specialty_id;
  END IF;
END $$;