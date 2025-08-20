-- Ajouter des spécialités de test
INSERT INTO specialties (name, description) VALUES
('Médecine Générale', 'Consultation générale et soins de première ligne'),
('Cardiologie', 'Spécialiste des maladies cardiovasculaires'),
('Dermatologie', 'Spécialiste des maladies de la peau'),
('Pédiatrie', 'Spécialiste des soins aux enfants'),
('Gynécologie', 'Spécialiste de la santé féminine'),
('Orthopédie', 'Spécialiste des os et articulations'),
('Ophtalmologie', 'Spécialiste des yeux et de la vision'),
('ORL', 'Spécialiste oreille, nez, gorge'),
('Psychiatrie', 'Spécialiste de la santé mentale'),
('Neurologie', 'Spécialiste du système nerveux')
ON CONFLICT (name) DO NOTHING;

-- Ajouter des profils de test pour les docteurs
INSERT INTO profiles (id, first_name, last_name, email, phone, role, tenant_id) VALUES
('11111111-1111-1111-1111-111111111111', 'Jean', 'Dupont', 'jean.dupont@hopital.com', '+225 07 11 22 33 44', 'doctor', (SELECT id FROM tenants LIMIT 1)),
('22222222-2222-2222-2222-222222222222', 'Marie', 'Martin', 'marie.martin@hopital.com', '+225 07 22 33 44 55', 'doctor', (SELECT id FROM tenants LIMIT 1)),
('33333333-3333-3333-3333-333333333333', 'Paul', 'Bernard', 'paul.bernard@hopital.com', '+225 07 33 44 55 66', 'doctor', (SELECT id FROM tenants LIMIT 1)),
('44444444-4444-4444-4444-444444444444', 'Sophie', 'Dubois', 'sophie.dubois@hopital.com', '+225 07 44 55 66 77', 'doctor', (SELECT id FROM tenants LIMIT 1)),
('55555555-5555-5555-5555-555555555555', 'Pierre', 'Moreau', 'pierre.moreau@hopital.com', '+225 07 55 66 77 88', 'doctor', (SELECT id FROM tenants LIMIT 1))
ON CONFLICT (id) DO NOTHING;

-- Ajouter des docteurs de test
INSERT INTO doctors (user_id, specialty_id, license_number, consultation_fee, availability_status, tenant_id) VALUES
('11111111-1111-1111-1111-111111111111', (SELECT id FROM specialties WHERE name = 'Médecine Générale' LIMIT 1), 'DOC001', 25000, 'available', (SELECT id FROM tenants LIMIT 1)),
('22222222-2222-2222-2222-222222222222', (SELECT id FROM specialties WHERE name = 'Cardiologie' LIMIT 1), 'DOC002', 35000, 'available', (SELECT id FROM tenants LIMIT 1)),
('33333333-3333-3333-3333-333333333333', (SELECT id FROM specialties WHERE name = 'Dermatologie' LIMIT 1), 'DOC003', 30000, 'available', (SELECT id FROM tenants LIMIT 1)),
('44444444-4444-4444-4444-444444444444', (SELECT id FROM specialties WHERE name = 'Pédiatrie' LIMIT 1), 'DOC004', 28000, 'available', (SELECT id FROM tenants LIMIT 1)),
('55555555-5555-5555-5555-555555555555', (SELECT id FROM specialties WHERE name = 'Gynécologie' LIMIT 1), 'DOC005', 32000, 'available', (SELECT id FROM tenants LIMIT 1))
ON CONFLICT (user_id) DO NOTHING;

-- Associer les docteurs à leurs spécialités principales
INSERT INTO doctor_specialties (doctor_id, specialty_id, is_primary) VALUES
((SELECT id FROM doctors WHERE user_id = '11111111-1111-1111-1111-111111111111'), (SELECT id FROM specialties WHERE name = 'Médecine Générale' LIMIT 1), true),
((SELECT id FROM doctors WHERE user_id = '22222222-2222-2222-2222-222222222222'), (SELECT id FROM specialties WHERE name = 'Cardiologie' LIMIT 1), true),
((SELECT id FROM doctors WHERE user_id = '33333333-3333-3333-3333-333333333333'), (SELECT id FROM specialties WHERE name = 'Dermatologie' LIMIT 1), true),
((SELECT id FROM doctors WHERE user_id = '44444444-4444-4444-4444-444444444444'), (SELECT id FROM specialties WHERE name = 'Pédiatrie' LIMIT 1), true),
((SELECT id FROM doctors WHERE user_id = '55555555-5555-5555-5555-555555555555'), (SELECT id FROM specialties WHERE name = 'Gynécologie' LIMIT 1), true)
ON CONFLICT (doctor_id, specialty_id) DO NOTHING;

-- Créer un tenant par défaut si nécessaire
INSERT INTO tenants (name, subdomain, subscription_plan, subscription_status) VALUES
('Clinique Médicale', 'clinique-demo', 'basic', 'active')
ON CONFLICT (subdomain) DO NOTHING;