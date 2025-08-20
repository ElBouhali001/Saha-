import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BlockedSlot {
  id: string;
  doctor_id: string;
  date: string;
  time: string;
  reason?: string;
  blocked_by: string;
  created_at: string;
  updated_at: string;
}

export const useBlockedSlots = (doctorId?: string, date?: string) => {
  return useQuery({
    queryKey: ['blocked-slots', doctorId, date],
    queryFn: async () => {
      let query = supabase
        .from('blocked_time_slots')
        .select('*');

      if (doctorId) {
        query = query.eq('doctor_id', doctorId);
      }

      if (date) {
        query = query.eq('date', date);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
    enabled: !!(doctorId || date),
  });
};

export const useBlockSlot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      doctorId,
      date,
      time,
      reason
    }: {
      doctorId: string;
      date: string;
      time: string;
      reason?: string;
    }) => {
      const { data, error } = await supabase
        .from('blocked_time_slots')
        .insert({
          doctor_id: doctorId,
          date,
          time,
          reason,
          blocked_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked-slots'] });
      toast.success('Créneau bloqué avec succès');
    },
    onError: (error: any) => {
      if (error.code === '23505') {
        toast.error('Ce créneau est déjà bloqué');
      } else {
        toast.error('Erreur lors du blocage du créneau');
      }
    },
  });
};

export const useUnblockSlot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      doctorId,
      date,
      time
    }: {
      doctorId: string;
      date: string;
      time: string;
    }) => {
      const { error } = await supabase
        .from('blocked_time_slots')
        .delete()
        .eq('doctor_id', doctorId)
        .eq('date', date)
        .eq('time', time);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked-slots'] });
      toast.success('Créneau débloqué avec succès');
    },
    onError: () => {
      toast.error('Erreur lors du déblocage du créneau');
    },
  });
};