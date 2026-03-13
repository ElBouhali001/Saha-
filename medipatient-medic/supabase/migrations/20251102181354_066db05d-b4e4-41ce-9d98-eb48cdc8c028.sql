-- Attribuer les droits admin aux comptes demo

-- Pour dr.kouame@medipatient.com
UPDATE profiles 
SET role = 'admin', updated_at = now()
WHERE email = 'dr.kouame@medipatient.com';

INSERT INTO user_roles (user_id, role, is_primary, tenant_id)
SELECT p.id, 'admin', true, p.tenant_id
FROM profiles p
WHERE p.email = 'dr.kouame@medipatient.com'
ON CONFLICT (user_id, role, tenant_id) 
DO UPDATE SET is_primary = true, updated_at = now();

INSERT INTO user_roles (user_id, role, is_primary, tenant_id)
SELECT p.id, 'doctor', false, p.tenant_id
FROM profiles p
WHERE p.email = 'dr.kouame@medipatient.com'
ON CONFLICT (user_id, role, tenant_id) DO NOTHING;

-- Pour dentiste.demo (recherche large)
UPDATE profiles 
SET role = 'admin', updated_at = now()
WHERE email LIKE '%dentiste%demo%' 
   OR email LIKE 'dentiste.demo%'
   OR first_name ILIKE '%dentiste%'
   OR last_name ILIKE '%dentiste%';

INSERT INTO user_roles (user_id, role, is_primary, tenant_id)
SELECT p.id, 'admin', true, p.tenant_id
FROM profiles p
WHERE email LIKE '%dentiste%demo%' 
   OR email LIKE 'dentiste.demo%'
   OR first_name ILIKE '%dentiste%'
   OR last_name ILIKE '%dentiste%'
ON CONFLICT (user_id, role, tenant_id) 
DO UPDATE SET is_primary = true, updated_at = now();

INSERT INTO user_roles (user_id, role, is_primary, tenant_id)
SELECT p.id, 'doctor', false, p.tenant_id
FROM profiles p
WHERE email LIKE '%dentiste%demo%' 
   OR email LIKE 'dentiste.demo%'
   OR first_name ILIKE '%dentiste%'
   OR last_name ILIKE '%dentiste%'
ON CONFLICT (user_id, role, tenant_id) DO NOTHING;