
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

// Hook pour récupérer tous les laboratoires
export const useEnhancedLaboratories = () => {
  return useQuery({
    queryKey: ['enhanced-laboratories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('laboratories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data;
    },
  });
};

// Hook pour récupérer les demandes d'analyses
export const useLabAnalysisRequests = (patientId?: string, doctorId?: string) => {
  return useQuery({
    queryKey: ['lab-analysis-requests', patientId, doctorId],
    queryFn: async () => {
      let query = supabase
        .from('lab_analysis_requests')
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
          consultation:consultations(*),
          lab_analysis_results(*)
        `)
        .order('requested_date', { ascending: false });

      if (patientId) {
        query = query.eq('patient_id', patientId);
      }

      if (doctorId) {
        query = query.eq('doctor_id', doctorId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

// Hook pour créer une demande d'analyse
export const useCreateLabAnalysisRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (requestData: {
      patient_id: string;
      doctor_id: string;
      consultation_id?: string;
      laboratory_id: string;
      analysis_types: any[];
      patient_preparation?: string;
      fasting_required?: boolean;
      priority?: 'normal' | 'urgent' | 'critical';
    }) => {
      const { data, error } = await supabase
        .from('lab_analysis_requests')
        .insert(requestData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-analysis-requests'] });
      toast({
        title: "Succès",
        description: "Demande d'analyse créée avec succès",
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

// Hook pour mettre à jour le statut d'une demande d'analyse
export const useUpdateLabAnalysisRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      requestId, 
      updates 
    }: { 
      requestId: string; 
      updates: any; 
    }) => {
      const { data, error } = await supabase
        .from('lab_analysis_requests')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-analysis-requests'] });
      toast({
        title: "Succès",
        description: "Demande d'analyse mise à jour",
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

// Hook pour ajouter des résultats d'analyse
export const useCreateLabAnalysisResult = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (resultData: {
      analysis_request_id: string;
      performed_by?: string;
      validated_by?: string;
      results: any;
      pdf_report_url?: string;
    }) => {
      const { data, error } = await supabase
        .from('lab_analysis_results')
        .insert(resultData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-analysis-requests'] });
      toast({
        title: "Succès",
        description: "Résultats d'analyse ajoutés",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'ajout des résultats",
        variant: "destructive",
      });
    },
  });
};

// Hook pour valider des résultats d'analyse
export const useValidateLabAnalysisResult = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      resultId, 
      validatorId 
    }: { 
      resultId: string; 
      validatorId: string; 
    }) => {
      const { data, error } = await supabase
        .from('lab_analysis_results')
        .update({
          validated_by: validatorId,
          validated_at: new Date().toISOString()
        })
        .eq('id', resultId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-analysis-requests'] });
      toast({
        title: "Succès",
        description: "Résultats validés",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Erreur lors de la validation",
        variant: "destructive",
      });
    },
  });
};
