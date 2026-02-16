
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TransmissionCreate, SecureTransmission } from '@/types/transmission';

export const useTransmissions = () => {
  return useQuery({
    queryKey: ['transmissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('secure_transmissions')
        .select(`
          *,
          consultation:consultations(*),
          recipient:profiles(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

export const useCreateTransmission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transmission: TransmissionCreate) => {
      // Generate secure access code
      const accessCode = generateSecureCode();
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + (transmission.validity_hours || 48));

      const { data, error } = await supabase
        .from('secure_transmissions')
        .insert({
          consultation_id: transmission.consultation_id,
          recipient_id: transmission.recipient_id,
          recipient_type: transmission.recipient_type,
          access_code: accessCode,
          expiry_date: expiryDate.toISOString(),
          transmitted_elements: transmission.transmitted_elements,
          reason: transmission.reason,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;
      return { ...data, access_code: accessCode };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transmissions'] });
    },
  });
};

export const useAccessTransmission = () => {
  return useMutation({
    mutationFn: async (accessCode: string) => {
      const { data, error } = await supabase
        .from('secure_transmissions')
        .select(`
          *,
          consultation:consultations(*),
          patient:patients(*, profile:profiles(*))
        `)
        .eq('access_code', accessCode)
        .eq('status', 'active')
        .gt('expiry_date', new Date().toISOString())
        .single();

      if (error) throw error;

      // Log access
      await supabase.from('transmission_accesses').insert({
        transmission_id: data.id,
        access_date: new Date().toISOString(),
        ip_address: 'client_ip' // Would be populated by Edge Function
      });

      return data;
    },
  });
};

export const useSubmitFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ transmissionId, feedback }: { transmissionId: string; feedback: string }) => {
      const { data, error } = await supabase
        .from('secure_transmissions')
        .update({
          specialist_feedback: feedback,
          feedback_date: new Date().toISOString(),
          status: 'completed'
        })
        .eq('id', transmissionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transmissions'] });
    },
  });
};

// Utility function to generate secure access code
function generateSecureCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result.match(/.{1,4}/g)?.join('-') || result;
}
