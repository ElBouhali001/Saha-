
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

// Hook pour récupérer les compagnies d'assurance
export const useInsuranceCompanies = () => {
  return useQuery({
    queryKey: ['insurance-companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('insurances')
        .select('*')
        .order('name');

      if (error) throw error;
      return data;
    },
  });
};

// Hook pour récupérer les assurances d'un patient
export const usePatientInsurances = (patientId?: string) => {
  return useQuery({
    queryKey: ['patient-insurances', patientId],
    queryFn: async () => {
      if (!patientId) return [];
      
      const { data, error } = await supabase
        .from('patient_insurances')
        .select(`
          *,
          insurance_company:insurance_companies(*)
        `)
        .eq('patient_id', patientId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!patientId,
  });
};

// Hook pour créer une affiliation d'assurance
export const useCreatePatientInsurance = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (insuranceData: any) => {
      const { data, error } = await supabase
        .from('patient_insurances')
        .insert(insuranceData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-insurances'] });
      toast({
        title: "Succès",
        description: "Assurance ajoutée avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'ajout de l'assurance",
        variant: "destructive",
      });
    },
  });
};

// Hook pour les demandes de remboursement
export const useInsuranceClaims = (patientInsuranceId?: string) => {
  return useQuery({
    queryKey: ['insurance-claims', patientInsuranceId],
    queryFn: async () => {
      let query = (supabase as any)
        .from('insurance_claims')
        .select(`
          *,
          patient_insurance:patient_insurances(
            *,
            insurance_company:insurance_companies(*)
          ),
          consultation:consultations(*)
        `)
        .order('created_at', { ascending: false });

      if (patientInsuranceId) {
        query = query.eq('patient_insurance_id', patientInsuranceId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

// Hook pour créer une demande de remboursement
export const useCreateInsuranceClaim = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (claimData: any) => {
      const { data, error } = await (supabase as any)
        .from('insurance_claims')
        .insert(claimData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insurance-claims'] });
      toast({
        title: "Succès",
        description: "Demande de remboursement créée",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Erreur lors de la création de la demande",
        variant: "destructive",
      });
    },
  });
};
