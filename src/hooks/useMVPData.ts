import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Types
export interface MVPPatient {
  name: string;
  age: number;
  phone: string;
  allergies: string[];
  gender: string;
  blood_type: string;
}

export interface MVPConsultationType {
  name: string;
  price: number;
  duration: number;
}

export interface MVPMedication {
  name: string;
  dosage: string;
}

// Hook pour récupérer les données de démo
export const useMVPDemoData = (dataType: string) => {
  return useQuery({
    queryKey: ['mvp-demo-data', dataType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mvp_demo_data')
        .select('*')
        .eq('data_type', dataType);

      if (error) throw error;
      return data;
    },
  });
};

// Hook pour récupérer les patients
export const useMVPPatients = () => {
  return useQuery({
    queryKey: ['mvp-patients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mvp_demo_data')
        .select('demo_data')
        .eq('data_type', 'patient');

      if (error) throw error;
      return data?.map(item => item.demo_data as unknown as MVPPatient) || [];
    },
  });
};

// Hook pour récupérer les consultations
export const useMVPConsultations = () => {
  return useQuery({
    queryKey: ['mvp-consultations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mvp_consultations')
        .select('*')
        .order('consultation_date', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
};

// Hook pour récupérer les rendez-vous
export const useMVPAppointments = () => {
  return useQuery({
    queryKey: ['mvp-appointments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mvp_appointments')
        .select('*')
        .order('appointment_date', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });
};

// Hook pour créer une consultation
export const useCreateConsultation = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (consultation: {
      patient_id?: string;
      doctor_id?: string;
      symptoms?: string;
      diagnosis?: string;
      treatment_plan?: string;
    }) => {
      const { data, error } = await supabase
        .from('consultations')
        .insert([consultation])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mvp-consultations'] });
      toast({
        title: "Consultation créée",
        description: "La consultation a été enregistrée avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Hook pour créer un rendez-vous
export const useCreateAppointment = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointment: {
      patient_id?: string;
      doctor_id?: string;
      appointment_date: string;
      appointment_time: string;
      reason?: string;
      consultation_type?: string;
    }) => {
      const { data, error } = await supabase
        .from('appointments')
        .insert([appointment])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mvp-appointments'] });
      toast({
        title: "Rendez-vous créé",
        description: "Le rendez-vous a été confirmé",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Hook pour créer une ordonnance
export const useCreatePrescription = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (prescription: {
      patient_id?: string;
      doctor_id?: string;
      medications: any[];
      instructions?: string;
    }) => {
      const { data, error } = await supabase
        .from('prescriptions')
        .insert([{
          ...prescription,
          medications: prescription.medications,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      toast({
        title: "Ordonnance créée",
        description: "L'ordonnance a été générée avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Hook pour récupérer les types de consultation
export const useMVPConsultationTypes = () => {
  return useQuery({
    queryKey: ['mvp-consultation-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mvp_demo_data')
        .select('demo_data')
        .eq('data_type', 'consultation_type');

      if (error) throw error;
      return data?.map(item => item.demo_data as unknown as MVPConsultationType) || [];
    },
  });
};

// Hook pour récupérer les médicaments
export const useMVPMedications = () => {
  return useQuery({
    queryKey: ['mvp-medications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mvp_demo_data')
        .select('demo_data')
        .eq('data_type', 'medication');

      if (error) throw error;
      return data?.map(item => item.demo_data as unknown as MVPMedication) || [];
    },
  });
};
