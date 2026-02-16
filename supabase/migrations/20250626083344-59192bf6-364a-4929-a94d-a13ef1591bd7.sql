
-- Create secure_transmissions table
CREATE TABLE public.secure_transmissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  consultation_id UUID REFERENCES public.consultations(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_type TEXT CHECK (recipient_type IN ('specialist', 'laboratory', 'doctor')) NOT NULL,
  access_code TEXT UNIQUE NOT NULL,
  expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
  transmitted_elements TEXT[] NOT NULL,
  reason TEXT NOT NULL,
  status TEXT CHECK (status IN ('active', 'accessed', 'expired', 'completed')) DEFAULT 'active',
  specialist_feedback TEXT,
  feedback_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transmission_accesses table
CREATE TABLE public.transmission_accesses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transmission_id UUID REFERENCES public.secure_transmissions(id) ON DELETE CASCADE,
  access_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address TEXT NOT NULL,
  user_agent TEXT
);

-- Enable RLS on both tables
ALTER TABLE public.secure_transmissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transmission_accesses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for secure_transmissions
CREATE POLICY "Doctors can view their own transmissions" ON public.secure_transmissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.consultations c
      JOIN public.doctors d ON d.id = c.doctor_id
      WHERE c.id = consultation_id AND d.user_id = auth.uid()
    )
  );

CREATE POLICY "Doctors can create transmissions" ON public.secure_transmissions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.consultations c
      JOIN public.doctors d ON d.id = c.doctor_id
      WHERE c.id = consultation_id AND d.user_id = auth.uid()
    )
  );

CREATE POLICY "Doctors can update their transmissions" ON public.secure_transmissions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.consultations c
      JOIN public.doctors d ON d.id = c.doctor_id
      WHERE c.id = consultation_id AND d.user_id = auth.uid()
    )
  );

-- Policy for recipients to access transmissions via access code
CREATE POLICY "Recipients can view transmissions with valid access code" ON public.secure_transmissions
  FOR SELECT USING (
    status = 'active' AND expiry_date > NOW()
  );

-- Policies for transmission_accesses
CREATE POLICY "Only system can create access logs" ON public.transmission_accesses
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Doctors can view access logs for their transmissions" ON public.transmission_accesses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.secure_transmissions st
      JOIN public.consultations c ON c.id = st.consultation_id
      JOIN public.doctors d ON d.id = c.doctor_id
      WHERE st.id = transmission_id AND d.user_id = auth.uid()
    )
  );
