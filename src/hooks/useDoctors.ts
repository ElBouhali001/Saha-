
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useDoctors = () => {
  return useQuery({
    queryKey: ['doctors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('doctors')
        .select(`
          *,
          specialty:specialties(*),
          profile:profiles(*)
        `);

      if (error) throw error;
      return data;
    },
  });
};

export const useSpecialties = () => {
  return useQuery({
    queryKey: ['specialties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('specialties')
        .select('*')
        .order('name');

      if (error) throw error;
      return data;
    },
  });
};

export const useAvailableDoctors = (date?: string) => {
  return useQuery({
    queryKey: ['available-doctors', date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('doctors')
        .select(`
          *,
          specialty:specialties(*),
          profile:profiles(*)
        `)
        .eq('availability_status', 'available');

      if (error) throw error;
      return data;
    },
    enabled: !!date,
  });
};
