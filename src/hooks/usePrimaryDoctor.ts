
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const usePrimaryDoctorRequests = (doctorId?: string) => {
  return useQuery({
    queryKey: ['primary-doctor-requests', doctorId],
    queryFn: async () => {
      let query = supabase
        .from('primary_doctor_requests')
        .select(`
          *,
          patient:patients(*, profile:profiles(*)),
          doctor:doctors(*, profile:profiles(*))
        `)
        .order('created_at', { ascending: false });

      if (doctorId) {
        query = query.eq('doctor_id', doctorId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

export const usePrimaryDoctors = (patientId?: string) => {
  return useQuery({
    queryKey: ['primary-doctors', patientId],
    queryFn: async () => {
      let query = supabase
        .from('primary_doctors')
        .select(`
          *,
          patient:patients(*, profile:profiles(*)),
          doctor:doctors(*, profile:profiles(*))
        `)
        .eq('is_active', true)
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

export const useCreatePrimaryDoctorRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (request: any) => {
      const { data, error } = await supabase
        .from('primary_doctor_requests')
        .insert(request)
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

export const useRespondToPrimaryDoctorRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      requestId, 
      status, 
      responseMessage 
    }: { 
      requestId: string; 
      status: 'accepted' | 'refused'; 
      responseMessage?: string 
    }) => {
      const { data: request, error: requestError } = await supabase
        .from('primary_doctor_requests')
        .update({
          status,
          response_message: responseMessage,
          response_date: new Date().toISOString()
        })
        .eq('id', requestId)
        .select()
        .single();

      if (requestError) throw requestError;

      // Si accepté, créer la relation médecin traitant
      if (status === 'accepted') {
        const { error: primaryDoctorError } = await supabase
          .from('primary_doctors')
          .insert({
            patient_id: request.patient_id,
            doctor_id: request.doctor_id,
            is_active: true
          });

        if (primaryDoctorError) throw primaryDoctorError;
      }

      return request;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['primary-doctor-requests'] });
      queryClient.invalidateQueries({ queryKey: ['primary-doctors'] });
      
      toast({
        title: "Succès",
        description: variables.status === 'accepted' 
          ? "Demande acceptée - Vous êtes maintenant médecin traitant"
          : "Demande refusée",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Erreur lors du traitement de la demande",
        variant: "destructive",
      });
    },
  });
};
