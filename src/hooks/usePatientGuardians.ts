
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TablesInsert } from '@/integrations/supabase/types';

export const usePatientGuardians = (patientId?: string) => {
  return useQuery({
    queryKey: ['patient-guardians', patientId],
    queryFn: async () => {
      const query = supabase
        .from('patient_guardians')
        .select(`
          *,
          patient:patients(*),
          guardian:profiles(*)
        `);
      
      if (patientId) {
        query.eq('patient_id', patientId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!patientId,
  });
};

export const useMyPatients = () => {
  return useQuery({
    queryKey: ['my-patients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patient_guardians')
        .select(`
          *,
          patient:patients(
            *,
            profile:profiles(*)
          )
        `);

      if (error) throw error;
      return data;
    },
  });
};

export const useCreatePatientGuardian = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (guardian: TablesInsert<'patient_guardians'>) => {
      const { data, error } = await supabase
        .from('patient_guardians')
        .insert(guardian)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-guardians'] });
      queryClient.invalidateQueries({ queryKey: ['my-patients'] });
    },
  });
};

export const useUpdatePatientGuardian = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<TablesInsert<'patient_guardians'>>) => {
      const { data, error } = await supabase
        .from('patient_guardians')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-guardians'] });
      queryClient.invalidateQueries({ queryKey: ['my-patients'] });
    },
  });
};

export const useDeletePatientGuardian = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('patient_guardians')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-guardians'] });
      queryClient.invalidateQueries({ queryKey: ['my-patients'] });
    },
  });
};
