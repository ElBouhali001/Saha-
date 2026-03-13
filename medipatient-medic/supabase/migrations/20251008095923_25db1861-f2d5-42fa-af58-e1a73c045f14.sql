-- Créer la table medication_library pour stocker les médicaments disponibles
CREATE TABLE IF NOT EXISTS public.medication_library (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  generic_name TEXT,
  dosage TEXT NOT NULL,
  form TEXT NOT NULL, -- comprimé, gélule, sirop, etc.
  manufacturer TEXT,
  barcode TEXT UNIQUE,
  description TEXT,
  side_effects TEXT[],
  contraindications TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer la table medication_acquisitions pour tracker les achats
CREATE TABLE IF NOT EXISTS public.medication_acquisitions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prescription_id UUID REFERENCES public.prescriptions(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  medication_name TEXT NOT NULL,
  barcode TEXT,
  pharmacy_name TEXT,
  scanned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  verified BOOLEAN DEFAULT true,
  acquisition_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer la table medication_reminders pour les rappels
CREATE TABLE IF NOT EXISTS public.medication_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prescription_id UUID REFERENCES public.prescriptions(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  medication_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  reminder_times TIME[],
  active BOOLEAN DEFAULT true,
  next_reminder_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.medication_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_acquisitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_reminders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for medication_library (lecture publique, écriture admin)
CREATE POLICY "Anyone can view medication library"
  ON public.medication_library FOR SELECT
  USING (true);

CREATE POLICY "Admins and doctors can manage medication library"
  ON public.medication_library FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'doctor', 'pharmacist')
    )
  );

-- RLS Policies for medication_acquisitions
CREATE POLICY "Patients can view their own acquisitions"
  ON public.medication_acquisitions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.patients
      WHERE patients.id = medication_acquisitions.patient_id
      AND patients.user_id = auth.uid()
    )
  );

CREATE POLICY "Patients can create their own acquisitions"
  ON public.medication_acquisitions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.patients
      WHERE patients.id = medication_acquisitions.patient_id
      AND patients.user_id = auth.uid()
    )
  );

CREATE POLICY "Medical staff can view all acquisitions"
  ON public.medication_acquisitions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'doctor', 'pharmacist')
    )
  );

-- RLS Policies for medication_reminders
CREATE POLICY "Patients can view their own reminders"
  ON public.medication_reminders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.patients
      WHERE patients.id = medication_reminders.patient_id
      AND patients.user_id = auth.uid()
    )
  );

CREATE POLICY "Patients can manage their own reminders"
  ON public.medication_reminders FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.patients
      WHERE patients.id = medication_reminders.patient_id
      AND patients.user_id = auth.uid()
    )
  );

CREATE POLICY "Medical staff can view all reminders"
  ON public.medication_reminders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'doctor')
    )
  );

-- Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_medication_acquisitions_prescription ON public.medication_acquisitions(prescription_id);
CREATE INDEX IF NOT EXISTS idx_medication_acquisitions_patient ON public.medication_acquisitions(patient_id);
CREATE INDEX IF NOT EXISTS idx_medication_reminders_prescription ON public.medication_reminders(prescription_id);
CREATE INDEX IF NOT EXISTS idx_medication_reminders_patient ON public.medication_reminders(patient_id);
CREATE INDEX IF NOT EXISTS idx_medication_reminders_active ON public.medication_reminders(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_medication_library_barcode ON public.medication_library(barcode);

-- Insérer quelques médicaments de démo dans la bibliothèque
INSERT INTO public.medication_library (name, generic_name, dosage, form, barcode, description) VALUES
('Paracétamol 500mg', 'Paracétamol', '500mg', 'Comprimé', '3400936404014', 'Antalgique et antipyrétique'),
('Amoxicilline 500mg', 'Amoxicilline', '500mg', 'Gélule', '3400935946119', 'Antibiotique de la famille des pénicillines'),
('Doliprane 1000mg', 'Paracétamol', '1000mg', 'Comprimé', '3400934517105', 'Antalgique et antipyrétique'),
('Lisinopril 10mg', 'Lisinopril', '10mg', 'Comprimé', '3400937788014', 'Traitement de l''hypertension'),
('Ventoline 100µg', 'Salbutamol', '100µg/dose', 'Aérosol', '3400930004937', 'Traitement de l''asthme'),
('Seretide 250', 'Fluticasone/Salmétérol', '250µg/25µg', 'Aérosol', '3400938943375', 'Traitement de fond de l''asthme'),
('Ibuprofène 400mg', 'Ibuprofène', '400mg', 'Comprimé', '3400933710576', 'Anti-inflammatoire non stéroïdien'),
('Oméprazole 20mg', 'Oméprazole', '20mg', 'Gélule', '3400935516244', 'Inhibiteur de la pompe à protons'),
('Levothyrox 50µg', 'Lévothyroxine', '50µg', 'Comprimé', '3400933656560', 'Traitement de l''hypothyroïdie'),
('Aspégic 1000mg', 'Acide acétylsalicylique', '1000mg', 'Poudre', '3400934519123', 'Antalgique, antipyrétique, antiagrégant plaquettaire')
ON CONFLICT (barcode) DO NOTHING;