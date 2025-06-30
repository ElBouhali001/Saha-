
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
          profile:profiles(*),
          doctor_specialties!inner(
            id,
            is_primary,
            specialty:specialties(*)
          )
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
      console.log('Fetching available doctors for date:', date);
      
      const { data, error } = await supabase
        .from('doctors')
        .select(`
          *,
          profile:profiles(*),
          doctor_specialties(
            id,
            is_primary,
            specialty:specialties(*)
          )
        `)
        .eq('availability_status', 'available');

      if (error) {
        console.error('Error fetching doctors:', error);
        throw error;
      }
      
      console.log('Fetched doctors:', data);
      
      // Filtrer seulement les médecins qui ont des spécialités
      const doctorsWithSpecialties = data?.filter(doctor => 
        doctor.doctor_specialties && doctor.doctor_specialties.length > 0
      ) || [];
      
      console.log('Doctors with specialties:', doctorsWithSpecialties);
      return doctorsWithSpecialties;
    },
    enabled: !!date,
  });
};

export const useDoctorSpecialties = () => {
  return useQuery({
    queryKey: ['doctor-specialties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('doctor_specialties')
        .select(`
          *,
          doctor:doctors(*),
          specialty:specialties(*)
        `);

      if (error) throw error;
      return data;
    },
  });
};
