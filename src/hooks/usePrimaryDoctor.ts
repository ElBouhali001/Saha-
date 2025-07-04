
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

// Hook pour récupérer les demandes de médecin traitant
export const usePrimaryDoctorRequests = (doctorId?: string) => {
  return useQuery({
    queryKey: ['primary-doctor-requests', doctorId],
    queryFn: async () => {
      let query = (supabase as any)
        .from('primary_doctor_requests')
        .select(`
          *,
          patient:patients(
            *,
            profile:profiles(*)
          ),
          doctor:doctors(
            *,
            profile:profiles(*)
          )
        `)
        .order('request_date', { ascending: false });

      if (doctorId) {
        query = query.eq('doctor_id', doctorId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

// Hook pour créer une demande de médecin traitant
export const useCreatePrimaryDoctorRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (requestData: {
      patient_id: string;
      doctor_id: string;
      request_message?: string;
      change_reason?: string;
    }) => {
      const { data, error } = await (supabase as any)
        .from('primary_doctor_requests')
        .insert(requestData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['primary-doctor-requests'] });
      toast({
        title: "Succès",
        description: "Demande de médecin traitant envoyée",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'envoi de la demande",
        variant: "destructive",
      });
    },
  });
};

// Hook pour répondre à une demande de médecin traitant
export const useRespondToPrimaryDoctorRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      requestId, 
      status, 
      response_message 
    }: { 
      requestId: string; 
      status: 'accepted' | 'rejected'; 
      response_message?: string; 
    }) => {
      const { data, error } = await (supabase as any)
        .from('primary_doctor_requests')
        .update({
          status,
          response_message,
          response_date: new Date().toISOString()
        })
        .eq('id', requestId)
        .select()
        .single();

      if (error) throw error;

      // Si accepté, créer la relation médecin traitant
      if (status === 'accepted') {
        const { error: relationError } = await (supabase as any)
          .from('patients')
          .update({
            primary_doctor_id: data.doctor_id,
            primary_doctor_since: new Date().toISOString().split('T')[0]
          })
          .eq('id', data.patient_id);

        if (relationError) throw relationError;

        // Ajouter à l'historique
        await (supabase as any)
          .from('primary_doctor_history')
          .insert({
            patient_id: data.patient_id,
            doctor_id: data.doctor_id,
            start_date: new Date().toISOString().split('T')[0]
          });
      }

      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['primary-doctor-requests'] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast({
        title: "Succès",
        description: variables.status === 'accepted' 
          ? "Demande acceptée - Patient ajouté à votre suivi" 
          : "Demande refusée",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Erreur lors de la réponse à la demande",
        variant: "destructive",
      });
    },
  });
};

// Hook pour récupérer l'historique des médecins traitants d'un patient
export const usePrimaryDoctorHistory = (patientId?: string) => {
  return useQuery({
    queryKey: ['primary-doctor-history', patientId],
    queryFn: async () => {
      if (!patientId) return [];

      const { data, error } = await (supabase as any)
        .from('primary_doctor_history')
        .select(`
          *,
          doctor:doctors(
            *,
            profile:profiles(*)
          )
        `)
        .eq('patient_id', patientId)
        .order('start_date', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!patientId,
  });
};
