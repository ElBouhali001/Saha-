import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useCurrentPharmacist = () => {
  return useQuery({
    queryKey: ['current-pharmacist'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
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
