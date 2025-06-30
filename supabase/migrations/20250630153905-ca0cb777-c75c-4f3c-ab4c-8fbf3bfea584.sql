
-- Insérer des spécialités médicales de base
INSERT INTO public.specialties (name, description) VALUES
('Médecine générale', 'Consultation générale et suivi médical'),
('Cardiologie', 'Spécialiste du cœur et des vaisseaux sanguins'),
('Dermatologie', 'Spécialiste de la peau'),
('Pédiatrie', 'Médecine des enfants et adolescents'),
('Gynécologie', 'Santé de la femme et suivi gynécologique'),
('Ophtalmologie', 'Spécialiste des yeux et de la vision'),
('ORL', 'Oto-rhino-laryngologie - Spécialiste des oreilles, nez et gorge'),
('Neurologie', 'Spécialiste du système nerveux'),
('Orthopédie', 'Spécialiste des os, articulations et muscles'),
('Psychiatrie', 'Santé mentale et troubles psychiatriques'),
('Radiologie', 'Imagerie médicale et diagnostic'),
('Anesthésie', 'Anesthésie et réanimation')
ON CONFLICT (name) DO NOTHING;

-- Ajouter quelques médecins avec des spécialités pour les tests
INSERT INTO public.doctors (consultation_fee, license_number, availability_status) VALUES
(15000, 'DOC001', 'available'),
(20000, 'DOC002', 'available'),
(18000, 'DOC003', 'available')
ON CONFLICT DO NOTHING;

-- Associer les médecins aux spécialités (en supposant que les IDs existent)
-- Cette partie sera adaptée selon les IDs générés
DO $$
DECLARE
    doc1_id UUID;
    doc2_id UUID;
    doc3_id UUID;
    spec_general_id UUID;
    spec_cardio_id UUID;
    spec_pediatrie_id UUID;
BEGIN
    -- Récupérer les IDs des médecins
    SELECT id INTO doc1_id FROM public.doctors WHERE license_number = 'DOC001' LIMIT 1;
    SELECT id INTO doc2_id FROM public.doctors WHERE license_number = 'DOC002' LIMIT 1;
    SELECT id INTO doc3_id FROM public.doctors WHERE license_number = 'DOC003' LIMIT 1;
    
    -- Récupérer les IDs des spécialités
    SELECT id INTO spec_general_id FROM public.specialties WHERE name = 'Médecine générale' LIMIT 1;
    SELECT id INTO spec_cardio_id FROM public.specialties WHERE name = 'Cardiologie' LIMIT 1;
    SELECT id INTO spec_pediatrie_id FROM public.specialties WHERE name = 'Pédiatrie' LIMIT 1;
    
    -- Associer les médecins aux spécialités
    IF doc1_id IS NOT NULL AND spec_general_id IS NOT NULL THEN
        INSERT INTO public.doctor_specialties (doctor_id, specialty_id, is_primary) 
        VALUES (doc1_id, spec_general_id, true)
        ON CONFLICT (doctor_id, specialty_id) DO NOTHING;
    END IF;
    
    IF doc2_id IS NOT NULL AND spec_cardio_id IS NOT NULL THEN
        INSERT INTO public.doctor_specialties (doctor_id, specialty_id, is_primary) 
        VALUES (doc2_id, spec_cardio_id, true)
        ON CONFLICT (doctor_id, specialty_id) DO NOTHING;
    END IF;
    
    IF doc3_id IS NOT NULL AND spec_pediatrie_id IS NOT NULL THEN
        INSERT INTO public.doctor_specialties (doctor_id, specialty_id, is_primary) 
        VALUES (doc3_id, spec_pediatrie_id, true)
        ON CONFLICT (doctor_id, specialty_id) DO NOTHING;
    END IF;
END $$;
