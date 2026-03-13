-- Créer les tables pour le module officine

-- Table des familles de médicaments
CREATE TABLE public.pharmacy_drug_families (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color_code TEXT DEFAULT '#3b82f6',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des fournisseurs de pharmacie
CREATE TABLE public.pharmacy_suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  delivery_delay_days INTEGER DEFAULT 7,
  payment_terms TEXT DEFAULT '30 jours',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table de l'inventaire pharmacie avec gestion avancée
CREATE TABLE public.pharmacy_inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pharmacy_id UUID REFERENCES public.pharmacies(id),
  drug_family_id UUID REFERENCES public.pharmacy_drug_families(id),
  supplier_id UUID REFERENCES public.pharmacy_suppliers(id),
  name TEXT NOT NULL,
  generic_name TEXT,
  dosage TEXT NOT NULL,
  form TEXT NOT NULL, -- comprimé, gélule, sirop, etc.
  barcode TEXT,
  current_stock INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 10,
  max_stock INTEGER DEFAULT 100,
  optimal_stock INTEGER DEFAULT 50,
  unit_cost DECIMAL(10,2) DEFAULT 0,
  selling_price DECIMAL(10,2) DEFAULT 0,
  margin_percentage DECIMAL(5,2) DEFAULT 0,
  expiry_date DATE,
  batch_number TEXT,
  shelf_location TEXT,
  is_prescription_required BOOLEAN DEFAULT true,
  is_parapharmacy BOOLEAN DEFAULT false,
  sales_velocity DECIMAL(10,2) DEFAULT 0, -- ventes par jour
  rotation_rate DECIMAL(10,2) DEFAULT 0, -- taux de rotation annuel
  last_sale_date DATE,
  last_order_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des mouvements de stock pharmacie
CREATE TABLE public.pharmacy_stock_movements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pharmacy_inventory_id UUID REFERENCES public.pharmacy_inventory(id),
  movement_type TEXT NOT NULL CHECK (movement_type IN ('entrée', 'sortie', 'ajustement', 'péremption', 'retour')),
  quantity INTEGER NOT NULL,
  unit_cost DECIMAL(10,2),
  reference_number TEXT,
  reason TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des ventes pharmacie
CREATE TABLE public.pharmacy_sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pharmacy_id UUID REFERENCES public.pharmacies(id),
  customer_id UUID, -- peut être null pour vente sans ordonnance
  prescription_id UUID REFERENCES public.prescriptions(id), -- null si vente libre
  sale_number TEXT NOT NULL,
  sale_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  payment_method TEXT CHECK (payment_method IN ('cash', 'card', 'mobile_money', 'insurance')),
  insurance_coverage DECIMAL(5,2) DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des détails de vente
CREATE TABLE public.pharmacy_sale_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id UUID REFERENCES public.pharmacy_sales(id) ON DELETE CASCADE,
  pharmacy_inventory_id UUID REFERENCES public.pharmacy_inventory(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  discount_percentage DECIMAL(5,2) DEFAULT 0,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des commandes fournisseurs
CREATE TABLE public.pharmacy_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pharmacy_id UUID REFERENCES public.pharmacies(id),
  supplier_id UUID REFERENCES public.pharmacy_suppliers(id),
  order_number TEXT NOT NULL,
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_delivery_date DATE,
  actual_delivery_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'confirmed', 'delivered', 'cancelled')),
  total_amount DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  is_automatic BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des détails de commande
CREATE TABLE public.pharmacy_order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.pharmacy_orders(id) ON DELETE CASCADE,
  pharmacy_inventory_id UUID REFERENCES public.pharmacy_inventory(id),
  quantity_ordered INTEGER NOT NULL,
  quantity_received INTEGER DEFAULT 0,
  unit_cost DECIMAL(10,2) NOT NULL,
  total_cost DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table de relation client pharmacie
CREATE TABLE public.pharmacy_customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pharmacy_id UUID REFERENCES public.pharmacies(id),
  patient_id UUID REFERENCES public.patients(id),
  customer_number TEXT,
  loyalty_points INTEGER DEFAULT 0,
  total_purchases DECIMAL(10,2) DEFAULT 0,
  last_purchase_date DATE,
  preferred_contact_method TEXT DEFAULT 'phone',
  notes TEXT,
  is_vip BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS sur toutes les tables
ALTER TABLE public.pharmacy_drug_families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacy_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacy_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacy_stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacy_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacy_sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacy_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacy_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacy_customers ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour les pharmaciens et administrateurs
CREATE POLICY "Pharmacists can manage drug families" ON public.pharmacy_drug_families
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('pharmacist', 'admin')
  )
);

CREATE POLICY "Pharmacists can manage suppliers" ON public.pharmacy_suppliers
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('pharmacist', 'admin')
  )
);

CREATE POLICY "Pharmacists can manage inventory" ON public.pharmacy_inventory
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('pharmacist', 'admin')
  )
);

CREATE POLICY "Pharmacists can manage stock movements" ON public.pharmacy_stock_movements
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('pharmacist', 'admin')
  )
);

CREATE POLICY "Pharmacists can manage sales" ON public.pharmacy_sales
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('pharmacist', 'admin')
  )
);

CREATE POLICY "Pharmacists can manage sale items" ON public.pharmacy_sale_items
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('pharmacist', 'admin')
  )
);

CREATE POLICY "Pharmacists can manage orders" ON public.pharmacy_orders
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('pharmacist', 'admin')
  )
);

CREATE POLICY "Pharmacists can manage order items" ON public.pharmacy_order_items
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('pharmacist', 'admin')
  )
);

CREATE POLICY "Pharmacists can manage customers" ON public.pharmacy_customers
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('pharmacist', 'admin')
  )
);

-- Créer des index pour les performances
CREATE INDEX idx_pharmacy_inventory_pharmacy_id ON public.pharmacy_inventory(pharmacy_id);
CREATE INDEX idx_pharmacy_inventory_drug_family ON public.pharmacy_inventory(drug_family_id);
CREATE INDEX idx_pharmacy_inventory_current_stock ON public.pharmacy_inventory(current_stock);
CREATE INDEX idx_pharmacy_inventory_min_stock ON public.pharmacy_inventory(min_stock);
CREATE INDEX idx_pharmacy_inventory_expiry_date ON public.pharmacy_inventory(expiry_date);
CREATE INDEX idx_pharmacy_sales_pharmacy_id ON public.pharmacy_sales(pharmacy_id);
CREATE INDEX idx_pharmacy_sales_date ON public.pharmacy_sales(sale_date);
CREATE INDEX idx_pharmacy_customers_pharmacy_id ON public.pharmacy_customers(pharmacy_id);

-- Fonction pour générer le numéro de vente
CREATE OR REPLACE FUNCTION public.generate_pharmacy_sale_number()
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE
  next_number INTEGER;
  sale_number TEXT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(sale_number FROM 5) AS INTEGER)), 0) + 1
  INTO next_number
  FROM public.pharmacy_sales
  WHERE sale_number LIKE 'VTE-%';
  
  sale_number := 'VTE-' || LPAD(next_number::TEXT, 6, '0');
  RETURN sale_number;
END;
$$;

-- Fonction pour générer le numéro de commande
CREATE OR REPLACE FUNCTION public.generate_pharmacy_order_number()
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE
  next_number INTEGER;
  order_number TEXT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 5) AS INTEGER)), 0) + 1
  INTO next_number
  FROM public.pharmacy_orders
  WHERE order_number LIKE 'CMD-%';
  
  order_number := 'CMD-' || LPAD(next_number::TEXT, 6, '0');
  RETURN order_number;
END;
$$;

-- Trigger pour mettre à jour le stock après une vente
CREATE OR REPLACE FUNCTION public.update_pharmacy_stock_after_sale()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Diminuer le stock
  UPDATE public.pharmacy_inventory 
  SET 
    current_stock = current_stock - NEW.quantity,
    last_sale_date = CURRENT_DATE,
    updated_at = now()
  WHERE id = NEW.pharmacy_inventory_id;
  
  -- Créer un mouvement de stock
  INSERT INTO public.pharmacy_stock_movements (
    pharmacy_inventory_id,
    movement_type,
    quantity,
    reason,
    created_by
  ) VALUES (
    NEW.pharmacy_inventory_id,
    'sortie',
    NEW.quantity,
    'Vente - Facture #' || (SELECT sale_number FROM pharmacy_sales WHERE id = NEW.sale_id),
    auth.uid()
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_stock_after_sale
  AFTER INSERT ON public.pharmacy_sale_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_pharmacy_stock_after_sale();

-- Trigger pour calculer la vélocité et rotation
CREATE OR REPLACE FUNCTION public.calculate_inventory_metrics()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  sales_last_30_days INTEGER;
  avg_stock DECIMAL;
BEGIN
  -- Calculer les ventes des 30 derniers jours
  SELECT COALESCE(SUM(psi.quantity), 0)
  INTO sales_last_30_days
  FROM pharmacy_sale_items psi
  JOIN pharmacy_sales ps ON psi.sale_id = ps.id
  WHERE psi.pharmacy_inventory_id = NEW.id
    AND ps.sale_date >= CURRENT_DATE - INTERVAL '30 days';
  
  -- Calculer la vélocité (ventes par jour)
  NEW.sales_velocity := sales_last_30_days / 30.0;
  
  -- Calculer le stock moyen
  avg_stock := (NEW.current_stock + NEW.optimal_stock) / 2.0;
  
  -- Calculer le taux de rotation annuel
  IF avg_stock > 0 THEN
    NEW.rotation_rate := (sales_last_30_days * 12.0) / avg_stock;
  ELSE
    NEW.rotation_rate := 0;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER calculate_metrics_on_update
  BEFORE UPDATE ON public.pharmacy_inventory
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_inventory_metrics();