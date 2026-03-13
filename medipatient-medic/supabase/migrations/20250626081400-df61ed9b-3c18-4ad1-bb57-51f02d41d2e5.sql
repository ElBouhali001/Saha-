
-- Table des profils utilisateurs
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  role TEXT CHECK (role IN ('patient', 'doctor', 'admin', 'agent')) DEFAULT 'patient',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Créer d'abord la table des spécialités médicales
CREATE TABLE public.specialties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insérer les spécialités médicales courantes
INSERT INTO public.specialties (name, description) VALUES
  ('Médecine générale', 'Soins de santé primaires et médecine familiale'),
  ('Chirurgie générale', 'Interventions chirurgicales générales'),
  ('Cardiologie', 'Maladies du cœur et du système cardiovasculaire'),
  ('Gynécologie-Obstétrique', 'Santé reproductive féminine et accouchement'),
  ('Pédiatrie', 'Soins médicaux pour enfants et adolescents'),
  ('Dermatologie', 'Maladies de la peau, des cheveux et des ongles'),
  ('Neurologie', 'Maladies du système nerveux'),
  ('Orthopédie', 'Troubles musculo-squelettiques'),
  ('Ophtalmologie', 'Maladies des yeux et troubles visuels'),
  ('ORL (Oto-Rhino-Laryngologie)', 'Troubles de l''oreille, du nez et de la gorge'),
  ('Psychiatrie', 'Troubles mentaux et comportementaux'),
  ('Radiologie', 'Imagerie médicale et diagnostic'),
  ('Anesthésiologie', 'Anesthésie et soins périopératoires'),
  ('Urologie', 'Système urinaire et reproducteur masculin'),
  ('Pneumologie', 'Maladies respiratoires'),
  ('Gastro-entérologie', 'Système digestif'),
  ('Rhumatologie', 'Maladies articulaires et inflammatoires'),
  ('Endocrinologie', 'Système endocrinien et hormones'),
  ('Néphrologie', 'Maladies rénales'),
  ('Oncologie', 'Traitement du cancer');

-- Table des patients (informations médicales spécifiques)
CREATE TABLE public.patients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  blood_type TEXT,
  allergies TEXT[],
  chronic_conditions TEXT[],
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relationship TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des médecins (liée à la table des spécialités)
CREATE TABLE public.doctors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  specialty_id UUID REFERENCES public.specialties(id),
  license_number TEXT UNIQUE,
  consultation_fee INTEGER DEFAULT 0,
  availability_status TEXT CHECK (availability_status IN ('available', 'busy', 'offline')) DEFAULT 'available',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des rendez-vous
CREATE TABLE public.appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  consultation_type TEXT CHECK (consultation_type IN ('consultation', 'suivi', 'urgence', 'teleconsultation')) DEFAULT 'consultation',
  status TEXT CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')) DEFAULT 'pending',
  reason TEXT,
  notes TEXT,
  payment_method TEXT CHECK (payment_method IN ('mobile_money', 'cash', 'card')),
  payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'failed')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des consultations médicales
CREATE TABLE public.consultations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE,
  consultation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  symptoms TEXT,
  diagnosis TEXT,
  treatment_plan TEXT,
  vitals JSONB, -- Pour stocker tension, poids, température, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des ordonnances
CREATE TABLE public.prescriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  consultation_id UUID REFERENCES public.consultations(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE,
  prescription_date DATE DEFAULT CURRENT_DATE,
  medications JSONB NOT NULL, -- Array d'objets avec nom, dosage, fréquence, durée
  instructions TEXT,
  status TEXT CHECK (status IN ('active', 'completed', 'cancelled')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table de l'inventaire
CREATE TABLE public.inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT CHECK (category IN ('medication', 'equipment', 'supplies')) DEFAULT 'medication',
  description TEXT,
  current_stock INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 0,
  unit_price INTEGER DEFAULT 0, -- En FCFA
  expiry_date DATE,
  supplier TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des mouvements de stock
CREATE TABLE public.stock_movements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.inventory(id) ON DELETE CASCADE,
  movement_type TEXT CHECK (movement_type IN ('entrée', 'sortie')) NOT NULL,
  quantity INTEGER NOT NULL,
  reason TEXT,
  user_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table de facturation
CREATE TABLE public.invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id),
  invoice_number TEXT UNIQUE NOT NULL,
  amount INTEGER NOT NULL, -- En FCFA
  status TEXT CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')) DEFAULT 'draft',
  due_date DATE,
  items JSONB NOT NULL, -- Array d'objets avec description, quantité, prix
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer RLS sur toutes les tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour les profils
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Politiques RLS pour les spécialités
CREATE POLICY "Everyone can view specialties" ON public.specialties FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage specialties" ON public.specialties FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Politiques RLS pour les patients
CREATE POLICY "Patients can view own data" ON public.patients FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.id = patients.user_id)
);
CREATE POLICY "Doctors can view patient data" ON public.patients FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'doctor')
);

-- Politiques pour les autres tables (simplifiée pour les médecins et admins)
CREATE POLICY "Doctors and admins full access appointments" ON public.appointments FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('doctor', 'admin'))
);

CREATE POLICY "Patients can view own appointments" ON public.appointments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.patients 
    WHERE patients.id = appointments.patient_id 
    AND patients.user_id = auth.uid()
  )
);

-- Fonction pour mettre à jour les profils lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    NEW.email
  );
  RETURN NEW;
END;
$$;

-- Trigger pour créer automatiquement un profil
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Fonction pour générer des numéros de facture
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  next_number INTEGER;
  invoice_number TEXT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 5) AS INTEGER)), 0) + 1
  INTO next_number
  FROM public.invoices
  WHERE invoice_number LIKE 'INV-%';
  
  invoice_number := 'INV-' || LPAD(next_number::TEXT, 6, '0');
  RETURN invoice_number;
END;
$$;
