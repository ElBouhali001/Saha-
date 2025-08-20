-- Créer une table pour les créneaux bloqués
CREATE TABLE public.blocked_time_slots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID REFERENCES public.doctors(id),
  date DATE NOT NULL,
  time TIME WITHOUT TIME ZONE NOT NULL,
  reason TEXT,
  blocked_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Contrainte unique pour éviter les doublons
  UNIQUE(doctor_id, date, time)
);

-- Enable RLS
ALTER TABLE public.blocked_time_slots ENABLE ROW LEVEL SECURITY;

-- Policies pour les créneaux bloqués
CREATE POLICY "Doctors can manage their own blocked slots"
ON public.blocked_time_slots
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.doctors 
    WHERE doctors.id = blocked_time_slots.doctor_id 
    AND doctors.user_id = auth.uid()
  )
);

CREATE POLICY "Medical staff can view blocked slots"
ON public.blocked_time_slots
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('doctor', 'admin', 'agent')
  )
);

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION public.update_blocked_slots_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
CREATE TRIGGER update_blocked_slots_updated_at
BEFORE UPDATE ON public.blocked_time_slots
FOR EACH ROW
EXECUTE FUNCTION public.update_blocked_slots_updated_at();