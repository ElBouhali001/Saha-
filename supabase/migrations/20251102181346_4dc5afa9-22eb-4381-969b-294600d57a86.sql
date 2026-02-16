-- Recréer la fonction handle_profile_update avec toutes les tables

DROP FUNCTION IF EXISTS public.handle_profile_update() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_profile_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Supprimer les entrées des tables de rôles
  DELETE FROM public.patients WHERE user_id = NEW.id;
  DELETE FROM public.doctors WHERE user_id = NEW.id;
  DELETE FROM public.agents WHERE user_id = NEW.id;
  DELETE FROM public.lab_technicians WHERE user_id = NEW.id;
  DELETE FROM public.pharmacists WHERE user_id = NEW.id;
  DELETE FROM public.insurance_agents WHERE user_id = NEW.id;

  -- Réinsérer dans la bonne table selon le nouveau rôle
  IF NEW.role = 'patient' THEN
    INSERT INTO public.patients (user_id, tenant_id)
    VALUES (NEW.id, NEW.tenant_id)
    ON CONFLICT (user_id) DO NOTHING;
    
  ELSIF NEW.role = 'doctor' THEN
    INSERT INTO public.doctors (user_id, tenant_id)
    VALUES (NEW.id, NEW.tenant_id)
    ON CONFLICT (user_id) DO NOTHING;
    
  ELSIF NEW.role = 'agent' THEN
    INSERT INTO public.agents (user_id, tenant_id)
    VALUES (NEW.id, NEW.tenant_id)
    ON CONFLICT (user_id) DO NOTHING;
    
  ELSIF NEW.role = 'lab_technician' THEN
    INSERT INTO public.lab_technicians (user_id, tenant_id)
    VALUES (NEW.id, NEW.tenant_id)
    ON CONFLICT (user_id) DO NOTHING;
    
  ELSIF NEW.role = 'pharmacist' THEN
    INSERT INTO public.pharmacists (user_id, tenant_id)
    VALUES (NEW.id, NEW.tenant_id)
    ON CONFLICT (user_id) DO NOTHING;
    
  ELSIF NEW.role = 'insurance_agent' THEN
    INSERT INTO public.insurance_agents (user_id, tenant_id)
    VALUES (NEW.id, NEW.tenant_id)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$function$;

-- Recréer le trigger
DROP TRIGGER IF EXISTS on_profile_update ON profiles;
CREATE TRIGGER on_profile_update
  AFTER UPDATE ON profiles
  FOR EACH ROW
  WHEN (OLD.role IS DISTINCT FROM NEW.role)
  EXECUTE FUNCTION public.handle_profile_update();