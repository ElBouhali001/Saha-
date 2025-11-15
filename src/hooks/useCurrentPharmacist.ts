import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { IS_DEMO } from '@/config/app';

export const useCurrentPharmacist = () => {
  return useQuery({
    queryKey: ['current-pharmacist'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // En mode démo, retourner des données simulées pour le pharmacien
      if (IS_DEMO && (!user || user.email === 'pharmacien@medipatient.com')) {
        return {
          id: 'demo-pharmacist-1',
          user_id: '6',
          pharmacy_id: '44e81d5a-47c8-45e7-afbd-3fa56cc8d221', // Pharmacie de la Paix
          license_number: 'PHARM-CI-2024-DEMO',
          tenant_id: 'demo-tenant',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          pharmacy: {
            id: '44e81d5a-47c8-45e7-afbd-3fa56cc8d221',
            name: 'Pharmacie de la Paix',
            address: '789 Rue de la Paix, Abidjan',
            phone: '+225-09-10-11-12',
            email: 'contact@pharmaciepaix.ci',
            api_endpoint: null,
            created_at: '2025-07-01T02:23:24.020211+00:00',
            updated_at: '2025-07-01T02:23:24.020211+00:00'
          }
        };
      }
      
      if (!user) throw new Error('No user logged in');
      
      const { data, error } = await supabase
        .from('pharmacists')
        .select(`
          *,
          pharmacy:pharmacies(*)
        `)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });
};
