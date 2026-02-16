
-- PHASE 1: Analyse de la structure existante (sans modification)
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name NOT LIKE 'pg_%'
ORDER BY table_name, ordinal_position;

-- PHASE 2: Extension du système de rôles
-- Ajouter les nouveaux types d'utilisateurs
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS user_type VARCHAR(50);

-- Migrer les rôles existants
UPDATE profiles 
SET user_type = COALESCE(role, 'patient')
WHERE user_type IS NULL;

-- Ajouter la contrainte pour les nouveaux types
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_user_type_check;

ALTER TABLE profiles 
ADD CONSTRAINT profiles_user_type_check 
CHECK (user_type IN ('patient', 'doctor', 'admin', 'agent', 'secretary', 'lab_technician', 'pharmacist'));

-- Profils des techniciens de laboratoire
CREATE TABLE IF NOT EXISTS lab_technicians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  laboratory_id UUID, -- Sera lié à laboratories
  employee_number VARCHAR(50),
  specializations TEXT[],
  certification_number VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Profils des pharmaciens
CREATE TABLE IF NOT EXISTS pharmacists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  pharmacy_id UUID, -- Sera lié à pharmacies
  rpps_number VARCHAR(11),
  license_number VARCHAR(100),
  specializations TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- PHASE 3: Structures de santé - Laboratoires
CREATE TABLE IF NOT EXISTS laboratories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) DEFAULT 'general', -- 'general', 'specialized', 'imaging'
  siret VARCHAR(14) UNIQUE,
  
  -- Coordonnées
  address JSONB NOT NULL DEFAULT '{}',
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  website VARCHAR(255),
  
  -- Horaires
  opening_hours JSONB DEFAULT '{}',
  
  -- Capacités
  analysis_types TEXT[] DEFAULT '{}',
  certifications TEXT[] DEFAULT '{}',
  
  -- Statut
  is_active BOOLEAN DEFAULT true,
  is_partner BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Demandes d'analyses
CREATE TABLE IF NOT EXISTS lab_analysis_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Références
  patient_id UUID REFERENCES patients(id),
  doctor_id UUID REFERENCES doctors(id),
  consultation_id UUID REFERENCES consultations(id),
  laboratory_id UUID REFERENCES laboratories(id),
  
  -- Analyses demandées
  analysis_types JSONB NOT NULL DEFAULT '[]',
  
  -- Planning
  requested_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  scheduled_date TIMESTAMP WITH TIME ZONE,
  
  -- Instructions patient
  patient_preparation TEXT,
  fasting_required BOOLEAN DEFAULT false,
  
  -- Statut
  status VARCHAR(50) DEFAULT 'pending', -- pending, scheduled, sample_collected, analyzing, completed, cancelled
  priority VARCHAR(20) DEFAULT 'normal', -- normal, urgent, critical
  
  -- Traçabilité
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Résultats d'analyses
CREATE TABLE IF NOT EXISTS lab_analysis_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_request_id UUID REFERENCES lab_analysis_requests(id) ON DELETE CASCADE,
  
  -- Personnel
  performed_by UUID REFERENCES lab_technicians(id),
  validated_by UUID REFERENCES profiles(id), -- Biologiste validateur
  
  -- Résultats structurés
  results JSONB NOT NULL DEFAULT '{}',
  
  -- Documents
  pdf_report_url TEXT,
  
  -- Validation
  validated_at TIMESTAMP WITH TIME ZONE,
  
  -- Transmission
  sent_to_doctor_at TIMESTAMP WITH TIME ZONE,
  viewed_by_doctor_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- PHASE 4: Pharmacies
CREATE TABLE IF NOT EXISTS pharmacies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) DEFAULT 'officine', -- 'officine', 'hospital', 'online'
  siret VARCHAR(14) UNIQUE,
  
  -- Coordonnées
  address JSONB NOT NULL DEFAULT '{}',
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  fax VARCHAR(20),
  
  -- Horaires et garde
  opening_hours JSONB DEFAULT '{}',
  on_call_schedule JSONB DEFAULT '{}',
  
  -- Services
  services TEXT[] DEFAULT '{}',
  
  -- Statut
  is_active BOOLEAN DEFAULT true,
  is_partner BOOLEAN DEFAULT true,
  accepts_electronic_prescriptions BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Prescriptions transmises aux pharmacies
CREATE TABLE IF NOT EXISTS pharmacy_prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Références
  prescription_id UUID REFERENCES prescriptions(id),
  pharmacy_id UUID REFERENCES pharmacies(id),
  patient_id UUID REFERENCES patients(id),
  
  -- Médicaments prescrits
  medications JSONB NOT NULL DEFAULT '[]',
  
  -- Statut de dispensation
  status VARCHAR(50) DEFAULT 'received', -- received, preparing, partially_ready, ready, dispensed, cancelled
  
  -- Dates
  received_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  preparation_started_at TIMESTAMP WITH TIME ZONE,
  ready_at TIMESTAMP WITH TIME ZONE,
  dispensed_at TIMESTAMP WITH TIME ZONE,
  
  -- Personnel
  prepared_by UUID REFERENCES pharmacists(id),
  dispensed_by UUID REFERENCES pharmacists(id),
  
  -- Substitutions effectuées
  substitutions JSONB DEFAULT '[]',
  
  -- Notes et conseils
  pharmacist_notes TEXT,
  patient_counseling TEXT,
  
  -- Refus ou problèmes
  dispensing_issues JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Stock pharmacie
CREATE TABLE IF NOT EXISTS pharmacy_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id UUID REFERENCES pharmacies(id) ON DELETE CASCADE,
  
  -- Médicament
  cis_code VARCHAR(20) NOT NULL,
  medication_name VARCHAR(255) NOT NULL,
  form VARCHAR(100),
  dosage VARCHAR(100),
  
  -- Stock
  current_stock INTEGER NOT NULL DEFAULT 0,
  minimum_stock INTEGER DEFAULT 10,
  maximum_stock INTEGER DEFAULT 100,
  
  -- Prix et remboursement
  unit_price DECIMAL(10,2),
  reimbursement_rate INTEGER,
  
  -- Dates
  last_restocked_at TIMESTAMP WITH TIME ZONE,
  expiry_alert_days INTEGER DEFAULT 90,
  
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(pharmacy_id, cis_code)
);

-- PHASE 5: Système médecin traitant
-- Extension de la table patients
ALTER TABLE patients
ADD COLUMN IF NOT EXISTS primary_doctor_id UUID REFERENCES doctors(id),
ADD COLUMN IF NOT EXISTS primary_doctor_since DATE;

-- Demandes de médecin traitant
CREATE TABLE IF NOT EXISTS primary_doctor_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Acteurs
  patient_id UUID REFERENCES patients(id),
  doctor_id UUID REFERENCES doctors(id),
  
  -- Demande
  request_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  request_message TEXT,
  
  -- Réponse
  status VARCHAR(50) DEFAULT 'pending', -- pending, accepted, rejected, cancelled
  response_date TIMESTAMP WITH TIME ZONE,
  response_message TEXT,
  
  -- Validation administrative
  requires_admin_validation BOOLEAN DEFAULT false,
  admin_validated_at TIMESTAMP WITH TIME ZONE,
  admin_validated_by UUID REFERENCES profiles(id),
  
  -- Historique
  previous_doctor_id UUID REFERENCES doctors(id),
  change_reason VARCHAR(100), -- 'new_patient', 'doctor_change', 'relocation', 'other'
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Contrainte pour éviter les doublons
  UNIQUE(patient_id, doctor_id, request_date)
);

-- Historique des médecins traitants
CREATE TABLE IF NOT EXISTS primary_doctor_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id),
  doctor_id UUID REFERENCES doctors(id),
  
  -- Période
  start_date DATE NOT NULL,
  end_date DATE,
  
  -- Raison du changement
  end_reason VARCHAR(100),
  
  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- PHASE 6: Système d'assurances
CREATE TABLE IF NOT EXISTS insurance_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identification
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'social_security', 'mutual', 'private_insurance'
  category VARCHAR(50), -- 'IPRES', 'CNSS', 'private'
  registration_number VARCHAR(100) UNIQUE,
  
  -- Contact
  address JSONB DEFAULT '{}',
  phone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(255),
  
  -- Intégration API
  api_enabled BOOLEAN DEFAULT false,
  api_endpoint VARCHAR(255),
  api_version VARCHAR(20),
  api_credentials_encrypted TEXT,
  api_format VARCHAR(20) DEFAULT 'json',
  
  -- Paramètres de remboursement par défaut
  default_coverage_rates JSONB DEFAULT '{}',
  
  -- Délais et limites
  prior_approval_required JSONB DEFAULT '{"amounts_above": 5000}',
  reimbursement_delay_days INTEGER DEFAULT 15,
  claim_submission_deadline_days INTEGER DEFAULT 60,
  
  -- Documents requis
  required_documents JSONB DEFAULT '{}',
  
  -- Statut
  is_active BOOLEAN DEFAULT true,
  contract_start_date DATE,
  contract_end_date DATE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Affiliations patients-assurances
CREATE TABLE IF NOT EXISTS patient_insurances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Références
  patient_id UUID REFERENCES patients(id),
  insurance_company_id UUID REFERENCES insurance_companies(id),
  
  -- Détails de l'affiliation
  policy_number VARCHAR(100) NOT NULL,
  member_id VARCHAR(100),
  group_number VARCHAR(100),
  
  -- Type de couverture
  coverage_type VARCHAR(50) NOT NULL DEFAULT 'primary', -- 'primary', 'secondary', 'complementary'
  plan_name VARCHAR(255),
  
  -- Bénéficiaires
  policyholder_name VARCHAR(255),
  relationship_to_policyholder VARCHAR(50) DEFAULT 'self', -- 'self', 'spouse', 'child', 'parent'
  
  -- Taux de couverture spécifiques
  specific_coverage_rates JSONB DEFAULT '{}',
  
  -- Validité
  start_date DATE NOT NULL,
  end_date DATE,
  
  -- Plafonds
  annual_ceiling DECIMAL(10,2),
  annual_used DECIMAL(10,2) DEFAULT 0,
  ceiling_reset_date DATE,
  
  -- Documents
  insurance_card_front_url TEXT,
  insurance_card_back_url TEXT,
  
  -- Statut
  is_active BOOLEAN GENERATED ALWAYS AS (
    end_date IS NULL OR end_date >= CURRENT_DATE
  ) STORED,
  verification_status VARCHAR(50) DEFAULT 'pending', -- pending, verified, rejected
  verified_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Contrainte pour éviter les doublons
  UNIQUE(patient_id, insurance_company_id, policy_number)
);

-- Demandes de remboursement
CREATE TABLE IF NOT EXISTS insurance_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_number VARCHAR(100) UNIQUE,
  
  -- Références
  patient_insurance_id UUID REFERENCES patient_insurances(id),
  consultation_id UUID REFERENCES consultations(id),
  
  -- Type de remboursement
  claim_type VARCHAR(50) NOT NULL, -- 'consultation', 'medication', 'analysis', 'imaging'
  
  -- Items à rembourser
  claim_items JSONB NOT NULL DEFAULT '[]',
  
  -- Montants
  total_amount DECIMAL(10,2) NOT NULL,
  covered_amount DECIMAL(10,2),
  patient_amount DECIMAL(10,2),
  
  -- Documents joints
  supporting_documents JSONB DEFAULT '[]',
  
  -- Workflow
  status VARCHAR(50) DEFAULT 'draft',
  
  -- Dates importantes
  submission_date TIMESTAMP WITH TIME ZONE,
  review_started_at TIMESTAMP WITH TIME ZONE,
  decision_date TIMESTAMP WITH TIME ZONE,
  payment_date TIMESTAMP WITH TIME ZONE,
  
  -- Décision
  decision_details JSONB DEFAULT '{}',
  
  -- Paiement
  payment_method VARCHAR(50), -- 'bank_transfer', 'check'
  payment_reference VARCHAR(100),
  
  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table de correspondance actes/tarifs
CREATE TABLE IF NOT EXISTS insurance_fee_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insurance_company_id UUID REFERENCES insurance_companies(id),
  
  -- Acte médical
  act_code VARCHAR(50) NOT NULL,
  act_description VARCHAR(255),
  act_category VARCHAR(50),
  
  -- Tarifs
  base_rate DECIMAL(10,2),
  coverage_rate INTEGER,
  maximum_reimbursement DECIMAL(10,2),
  
  -- Conditions
  requires_prior_approval BOOLEAN DEFAULT false,
  special_conditions TEXT,
  
  -- Validité
  effective_date DATE,
  expiration_date DATE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(insurance_company_id, act_code, effective_date)
);

-- PHASE 7: Index stratégiques pour performance
CREATE INDEX IF NOT EXISTS idx_lab_requests_patient ON lab_analysis_requests(patient_id);
CREATE INDEX IF NOT EXISTS idx_lab_requests_doctor ON lab_analysis_requests(doctor_id);
CREATE INDEX IF NOT EXISTS idx_lab_requests_status ON lab_analysis_requests(status);
CREATE INDEX IF NOT EXISTS idx_lab_requests_scheduled ON lab_analysis_requests(scheduled_date) WHERE status = 'scheduled';

CREATE INDEX IF NOT EXISTS idx_pharmacy_prescriptions_status ON pharmacy_prescriptions(pharmacy_id, status);
CREATE INDEX IF NOT EXISTS idx_pharmacy_prescriptions_patient ON pharmacy_prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_inventory_stock ON pharmacy_inventory(pharmacy_id, current_stock) WHERE current_stock < minimum_stock;

CREATE INDEX IF NOT EXISTS idx_primary_requests_pending ON primary_doctor_requests(doctor_id, status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_primary_history_patient ON primary_doctor_history(patient_id, start_date DESC);

CREATE INDEX IF NOT EXISTS idx_patient_insurance_active ON patient_insurances(patient_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_insurance_claims_status ON insurance_claims(status);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_patient ON insurance_claims(patient_insurance_id, submission_date DESC);
CREATE INDEX IF NOT EXISTS idx_fee_schedules_lookup ON insurance_fee_schedules(insurance_company_id, act_code, effective_date DESC);

-- Index composites pour requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_consultations_patient_date ON consultations(patient_id, consultation_date DESC);
CREATE INDEX IF NOT EXISTS idx_prescriptions_consultation ON prescriptions(consultation_id);
CREATE INDEX IF NOT EXISTS idx_lab_results_request ON lab_analysis_results(analysis_request_id);

-- Index partiels pour filtres courants
CREATE INDEX IF NOT EXISTS idx_appointments_upcoming ON appointments(appointment_date) 
WHERE status = 'confirmed' AND appointment_date > NOW();

CREATE INDEX IF NOT EXISTS idx_lab_requests_pending ON lab_analysis_requests(laboratory_id, scheduled_date) 
WHERE status IN ('pending', 'scheduled');

CREATE INDEX IF NOT EXISTS idx_pharmacy_prescriptions_ready ON pharmacy_prescriptions(pharmacy_id) 
WHERE status = 'ready';

-- PHASE 8: Table d'audit générale
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Qui
  user_id UUID REFERENCES profiles(id),
  user_type VARCHAR(50),
  user_ip INET,
  
  -- Quoi
  action VARCHAR(50) NOT NULL, -- 'view', 'create', 'update', 'delete', 'export'
  table_name VARCHAR(100) NOT NULL,
  record_id UUID,
  
  -- Détails
  old_values JSONB,
  new_values JSONB,
  
  -- Contexte
  context JSONB DEFAULT '{}',
  
  -- Quand
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_table ON audit_log(table_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_record ON audit_log(record_id);

-- PHASE 9: Fonction d'audit automatique
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (
    user_id,
    action,
    table_name,
    record_id,
    old_values,
    new_values
  ) VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- PHASE 10: Vue statistiques des patients (sans matérialisée pour simplifier)
CREATE OR REPLACE VIEW patient_statistics AS
SELECT 
  p.id as patient_id,
  p.user_id,
  CONCAT(pr.first_name, ' ', pr.last_name) as patient_name,
  
  -- Consultations
  COUNT(DISTINCT c.id) as total_consultations,
  MAX(c.consultation_date) as last_consultation_date,
  
  -- Prescriptions
  COUNT(DISTINCT pre.id) as total_prescriptions,
  
  -- Analyses
  COUNT(DISTINCT lar.id) as total_lab_requests,
  COUNT(DISTINCT CASE WHEN lar.status = 'completed' THEN lar.id END) as completed_analyses,
  
  -- Assurance
  BOOL_OR(pi.is_active) as has_active_insurance,
  
  -- Médecin traitant
  p.primary_doctor_id IS NOT NULL as has_primary_doctor,
  
  CURRENT_TIMESTAMP as last_refreshed

FROM patients p
JOIN profiles pr ON p.user_id = pr.id
LEFT JOIN consultations c ON p.id = c.patient_id
LEFT JOIN prescriptions pre ON c.id = pre.consultation_id
LEFT JOIN lab_analysis_requests lar ON p.id = lar.patient_id
LEFT JOIN patient_insurances pi ON p.id = pi.patient_id AND pi.is_active = true
GROUP BY p.id, p.user_id, pr.first_name, pr.last_name, p.primary_doctor_id;

-- PHASE 11: Insérer quelques données de test
INSERT INTO laboratories (name, phone, email, address) VALUES 
('Laboratoire Central', '+221 77 123 4567', 'contact@labcentral.sn', '{"street": "Avenue Bourguiba", "city": "Dakar", "country": "Sénégal"}'),
('Bio-Analyses Dakar', '+221 77 234 5678', 'info@bioanalyses.sn', '{"street": "Rue 10", "city": "Dakar", "country": "Sénégal"}')
ON CONFLICT DO NOTHING;

INSERT INTO pharmacies (name, phone, email, address) VALUES 
('Pharmacie de la Paix', '+221 77 345 6789', 'paix@pharmacie.sn', '{"street": "Avenue Cheikh Anta Diop", "city": "Dakar", "country": "Sénégal"}'),
('Pharmacie Moderne', '+221 77 456 7890', 'moderne@pharmacie.sn', '{"street": "Boulevard du Centenaire", "city": "Dakar", "country": "Sénégal"}')
ON CONFLICT DO NOTHING;

INSERT INTO insurance_companies (name, type, category, registration_number) VALUES 
('IPRES', 'social_security', 'IPRES', 'IPRES-001'),
('CNSS', 'social_security', 'CNSS', 'CNSS-001'),
('Assurance Santé Plus', 'private_insurance', 'private', 'ASP-001')
ON CONFLICT DO NOTHING;
