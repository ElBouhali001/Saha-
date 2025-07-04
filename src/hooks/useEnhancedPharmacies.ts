
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

// Hook pour récupérer toutes les pharmacies
export const useEnhancedPharmacies = () => {
  return useQuery({
    queryKey: ['enhanced-pharmacies'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('pharmacies')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data;
    },
  });
};

// Hook pour récupérer les prescriptions en pharmacie
export const usePharmacyPrescriptions = (pharmacyId?: string, patientId?: string) => {
  return useQuery({
    queryKey: ['pharmacy-prescriptions', pharmacyId, patientId],
    queryFn: async () => {
      let query = (supabase as any)
        .from('pharmacy_prescriptions')
        .select(`
          *,
          prescription:prescriptions(
            *,
            doctor:doctors(
              *,
              profile:profiles(*)
            )
          ),
          pharmacy:pharmacies(*),
          patient:patients(
            *,
            profile:profiles(*)
          ),
          prepared_by_user:pharmacists!prepared_by(
            *,
            user:profiles(*)
          ),
          dispensed_by_user:pharmacists!dispensed_by(
            *,
            user:profiles(*)
          )
        `)
        .order('received_at', { ascending: false });

      if (pharmacyId) {
        query = query.eq('pharmacy_id', pharmacyId);
      }

      if (patientId) {
        query = query.eq('patient_id', patientId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

// Hook pour envoyer une prescription à une pharmacie
export const useCreatePharmacyPrescription = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (prescriptionData: {
      prescription_id: string;
      pharmacy_id: string;
      patient_id: string;
      medications: any[];
    }) => {
      const { data, error } = await (supabase as any)
        .from('pharmacy_prescriptions')
        .insert(prescriptionData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pharmacy-prescriptions'] });
      toast({
        title: "Succès",
        description: "Prescription envoyée à la pharmacie",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'envoi de la prescription",
        variant: "destructive",
      });
    },
  });
};

// Hook pour mettre à jour le statut d'une prescription en pharmacie
export const useUpdatePharmacyPrescriptionStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      prescriptionId, 
      status, 
      updates 
    }: { 
      prescriptionId: string; 
      status: 'received' | 'preparing' | 'partially_ready' | 'ready' | 'dispensed' | 'cancelled';
      updates?: any;
    }) => {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
        ...updates
      };

      // Ajouter les timestamps selon le statut
      switch (status) {
        case 'preparing':
          updateData.preparation_started_at = new Date().toISOString();
          break;
        case 'ready':
          updateData.ready_at = new Date().toISOString();
          break;
        case 'dispensed':
          updateData.dispensed_at = new Date().toISOString();
          break;
      }

      const { data, error } = await (supabase as any)
        .from('pharmacy_prescriptions')
        .update(updateData)
        .eq('id', prescriptionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pharmacy-prescriptions'] });
      toast({
        title: "Succès",
        description: "Statut de la prescription mis à jour",
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

// Hook pour gérer les substitutions
export const useAddSubstitution = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      prescriptionId, 
      substitution 
    }: { 
      prescriptionId: string; 
      substitution: {
        original_cis: string;
        original_name: string;
        substituted_cis: string;
        substituted_name: string;
        reason: string;
        patient_consent: boolean;
      };
    }) => {
      // Récupérer les substitutions existantes
      const { data: currentPrescription, error: fetchError } = await (supabase as any)
        .from('pharmacy_prescriptions')
        .select('substitutions')
        .eq('id', prescriptionId)
        .single();

      if (fetchError) throw fetchError;

      const currentSubstitutions = currentPrescription.substitutions || [];
      const updatedSubstitutions = [...currentSubstitutions, substitution];

      const { data, error } = await (supabase as any)
        .from('pharmacy_prescriptions')
        .update({
          substitutions: updatedSubstitutions,
          updated_at: new Date().toISOString()
        })
        .eq('id', prescriptionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pharmacy-prescriptions'] });
      toast({
        title: "Succès",
        description: "Substitution ajoutée",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'ajout de la substitution",
        variant: "destructive",
      });
    },
  });
};

// Hook pour l'inventaire pharmacie
export const usePharmacyInventory = (pharmacyId?: string) => {
  return useQuery({
    queryKey: ['pharmacy-inventory', pharmacyId],
    queryFn: async () => {
      if (!pharmacyId) return [];

      const { data, error } = await (supabase as any)
        .from('pharmacy_inventory')
        .select('*')
        .eq('pharmacy_id', pharmacyId)
        .order('medication_name');

      if (error) throw error;
      return data;
    },
    enabled: !!pharmacyId,
  });
};
