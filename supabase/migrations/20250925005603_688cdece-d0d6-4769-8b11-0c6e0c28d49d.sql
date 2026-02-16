-- Créer les données de démonstration de base pour le module officine

-- 1. Ajouter le rôle pharmacist aux valeurs autorisées
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
CHECK (role = ANY (ARRAY['patient'::text, 'doctor'::text, 'admin'::text, 'agent'::text, 'pharmacist'::text, 'lab_technician'::text, 'insurance_agent'::text]));

-- 2. Créer quelques clients de pharmacie (sans lien vers des profils spécifiques pour l'instant)
WITH pharmacy_id AS (
  SELECT id FROM public.pharmacies WHERE name = 'Pharmacie Central Dakar' LIMIT 1
)
INSERT INTO public.pharmacy_customers (
  pharmacy_id, customer_number, loyalty_points, total_purchases, 
  last_purchase_date, is_vip, notes
) 
SELECT 
  pharmacy_id.id,
  customers.customer_number,
  customers.loyalty_points,
  customers.total_purchases,
  customers.last_purchase_date::date,
  customers.is_vip,
  customers.notes
FROM pharmacy_id,
(VALUES 
  ('CLI001', 2800, 85000, '2024-01-20', true, 'Client VIP - achats réguliers de médicaments spécialisés'),
  ('CLI002', 1200, 35000, '2024-01-18', false, 'Client fidèle - préfère les génériques'),
  ('CLI003', 4500, 120000, '2024-01-22', true, 'Client VIP - pharmacie familiale'),
  ('CLI004', 800, 22000, '2024-01-15', false, 'Nouveau client - potentiel de croissance'),
  ('CLI005', 650, 18500, '2024-01-17', false, 'Client occasionnel')
) AS customers(customer_number, loyalty_points, total_purchases, last_purchase_date, is_vip, notes)
WHERE EXISTS (SELECT 1 FROM pharmacy_id);

-- 3. Créer quelques ventes d'exemple des derniers jours (sans utilisateur créateur spécifique)
WITH pharmacy_id AS (
  SELECT id FROM public.pharmacies WHERE name = 'Pharmacie Central Dakar' LIMIT 1
)
INSERT INTO public.pharmacy_sales (
  pharmacy_id, sale_number, sale_date, total_amount, payment_method
)
SELECT 
  pharmacy_id.id,
  sales.sale_number,
  sales.sale_date::timestamp,
  sales.total_amount,
  sales.payment_method
FROM pharmacy_id,
(VALUES 
  ('VTE-000001', '2024-01-22 09:15:00', 4500, 'cash'),
  ('VTE-000002', '2024-01-22 10:30:00', 2800, 'mobile_money'),
  ('VTE-000003', '2024-01-22 14:20:00', 6200, 'card'),
  ('VTE-000004', '2024-01-21 16:45:00', 3200, 'cash'),
  ('VTE-000005', '2024-01-21 11:30:00', 5800, 'insurance'),
  ('VTE-000006', '2024-01-20 13:15:00', 1900, 'mobile_money')
) AS sales(sale_number, sale_date, total_amount, payment_method)
WHERE EXISTS (SELECT 1 FROM pharmacy_id);

-- Message de confirmation
SELECT 'Module officine configuré avec succès!' as message,
       'Données de démonstration créées' as status,
       'Créez un compte utilisateur et changez son rôle en pharmacist pour tester' as instructions;