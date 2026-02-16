-- Créer un tenant par défaut si nécessaire
INSERT INTO tenants (name, subdomain, subscription_plan, subscription_status) VALUES
('Clinique Médicale', 'clinique-demo', 'basic', 'active')
ON CONFLICT (subdomain) DO NOTHING;

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