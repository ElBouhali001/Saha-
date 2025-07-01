
-- Créer une table pour stocker les pièces jointes des factures
CREATE TABLE public.invoice_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  uploaded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS sur la table
ALTER TABLE public.invoice_attachments ENABLE ROW LEVEL SECURITY;

-- Créer les politiques RLS
CREATE POLICY "Users can view invoice attachments in their tenant" 
  ON public.invoice_attachments 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.invoices i 
      JOIN public.patients p ON i.patient_id = p.id 
      WHERE i.id = invoice_attachments.invoice_id 
      AND p.tenant_id = get_current_tenant_id()
    )
  );

CREATE POLICY "Users can create invoice attachments in their tenant" 
  ON public.invoice_attachments 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.invoices i 
      JOIN public.patients p ON i.patient_id = p.id 
      WHERE i.id = invoice_attachments.invoice_id 
      AND p.tenant_id = get_current_tenant_id()
    )
    AND uploaded_by = auth.uid()
  );

CREATE POLICY "Users can delete their invoice attachments" 
  ON public.invoice_attachments 
  FOR DELETE 
  USING (uploaded_by = auth.uid());

-- Créer un bucket de stockage pour les pièces jointes de factures
INSERT INTO storage.buckets (id, name, public) 
VALUES ('invoice-attachments', 'invoice-attachments', false);

-- Politique de stockage pour permettre l'upload aux utilisateurs authentifiés
CREATE POLICY "Allow authenticated users to upload invoice attachments" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'invoice-attachments' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Allow users to view invoice attachments" 
  ON storage.objects 
  FOR SELECT 
  USING (
    bucket_id = 'invoice-attachments' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Allow users to delete their invoice attachments" 
  ON storage.objects 
  FOR DELETE 
  USING (
    bucket_id = 'invoice-attachments' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
