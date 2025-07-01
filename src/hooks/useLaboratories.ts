
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const useLaboratories = () => {
  return useQuery({
    queryKey: ['laboratories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('laboratories')
        .select('*')
        .order('name');

      if (error) throw error;
      return data;
    },
  });
};

export const useLabTests = (patientId?: string) => {
  return useQuery({
    queryKey: ['lab-tests', patientId],
    queryFn: async () => {
      let query = supabase
        .from('lab_tests')
        .select(`
          *,
          patient:patients(
            *,
            profile:profiles(*)
          ),
          doctor:doctors(
            *, 
            profile:profiles(*)
          ),
          laboratory:laboratories(*),
          consultation:consultations(*)
        `)
        .order('created_at', { ascending: false });

      if (patientId) {
        query = query.eq('patient_id', patientId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateLabTest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (labTest: any) => {
      const { data, error } = await supabase
        .from('lab_tests')
        .insert(labTest)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-tests'] });
      toast({
        title: "Succès",
        description: "Analyse prescrite avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Erreur lors de la prescription de l'analyse",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateLabTest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from('lab_tests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-tests'] });
      toast({
        title: "Succès",
        description: "Analyse mise à jour avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour de l'analyse",
        variant: "destructive",
      });
    },
  });
};
