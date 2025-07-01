
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const usePharmacies = () => {
  return useQuery({
    queryKey: ['pharmacies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pharmacies')
        .select('*')
        .order('name');

      if (error) throw error;
      return data;
    },
  });
};

export const usePharmacyPrescriptions = (pharmacyId?: string) => {
  return useQuery({
    queryKey: ['pharmacy-prescriptions', pharmacyId],
    queryFn: async () => {
      let query = supabase
        .from('pharmacy_prescriptions')
        .select(`
          *,
          prescription:prescriptions(
            *,
            patient:patients(
              *,
              profile:profiles(*)
            ),
            doctor:doctors(
              *, 
              profile:profiles(*)
            )
          ),
          pharmacy:pharmacies(*)
        `)
        .order('created_at', { ascending: false });

      if (pharmacyId) {
        query = query.eq('pharmacy_id', pharmacyId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

export const useCreatePharmacyPrescription = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (pharmacyPrescription: any) => {
      const { data, error } = await supabase
        .from('pharmacy_prescriptions')
        .insert(pharmacyPrescription)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pharmacy-prescriptions'] });
      toast({
        title: "Succès",
        description: "Ordonnance transmise à la pharmacie",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Erreur lors de la transmission de l'ordonnance",
        variant: "destructive",
      });
    },
  });
};

export const useUpdatePharmacyPrescription = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from('pharmacy_prescriptions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pharmacy-prescriptions'] });
      toast({
        title: "Succès",
        description: "Statut de l'ordonnance mis à jour",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour",
        variant: "destructive",
      });
    },
  });
};
