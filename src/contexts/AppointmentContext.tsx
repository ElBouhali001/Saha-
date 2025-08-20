import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty?: string;
  date: string;
  time: string;
  type: 'consultation' | 'follow-up' | 'urgent' | 'preventive' | 'specialist';
  reason: string;
  notes?: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  createdAt: string;
  updatedAt: string;
}

interface AppointmentContextType {
  appointments: Appointment[];
  loading: boolean;
  addAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Appointment>;
  updateAppointment: (id: string, updates: Partial<Appointment>) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  getPatientAppointments: (patientId: string) => Appointment[];
  getDoctorAppointments: (doctorId: string) => Appointment[];
  getAppointmentsByDate: (date: string) => Appointment[];
  refreshAppointments: () => Promise<void>;
}

const AppointmentContext = createContext<AppointmentContextType | undefined>(undefined);

export const useAppointments = () => {
  const context = useContext(AppointmentContext);
  if (!context) {
    throw new Error('useAppointments must be used within an AppointmentProvider');
  }
  return context;
};

interface AppointmentProviderProps {
  children: ReactNode;
}

export const AppointmentProvider: React.FC<AppointmentProviderProps> = ({ children }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  // Données de démonstration
  const generateDemoAppointments = (): Appointment[] => [
    {
      id: 'apt1',
      patientId: '1',
      patientName: 'Aïcha Diabaté',
      doctorId: 'doc1',
      doctorName: 'Dr. Kouamé',
      doctorSpecialty: 'Médecine générale',
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      type: 'consultation',
      reason: 'Suivi hypertension',
      notes: 'Contrôle tension artérielle',
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'apt2',
      patientId: '2',
      patientName: 'Ibrahim Koné',
      doctorId: 'doc2',
      doctorName: 'Dr. Traoré',
      doctorSpecialty: 'Cardiologie',
      date: new Date().toISOString().split('T')[0],
      time: '10:30',
      type: 'follow-up',
      reason: 'Contrôle gastrite',
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'apt3',
      patientId: '3',
      patientName: 'Mariam Bamba',
      doctorId: 'doc1',
      doctorName: 'Dr. Kouamé',
      doctorSpecialty: 'Médecine générale',
      date: new Date().toISOString().split('T')[0],
      time: '14:00',
      type: 'urgent',
      reason: 'Crise d\'asthme',
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'apt4',
      patientId: '4',
      patientName: 'Moussa Soro',
      doctorId: 'doc1',
      doctorName: 'Dr. Kouamé',
      doctorSpecialty: 'Médecine générale',
      date: new Date().toISOString().split('T')[0],
      time: '15:30',
      type: 'consultation',
      reason: 'Douleurs lombaires',
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const loadAppointments = async () => {
    try {
      setLoading(true);
      
      // En mode démo, utiliser les données simulées
      const demoAppointments = generateDemoAppointments();
      setAppointments(demoAppointments);

      // TODO: Remplacer par un appel Supabase réel
      // const { data, error } = await supabase
      //   .from('appointments')
      //   .select('*')
      //   .order('date', { ascending: true })
      //   .order('time', { ascending: true });
      
      // if (error) throw error;
      // setAppointments(data || []);

    } catch (error) {
      console.error('Erreur lors du chargement des rendez-vous:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les rendez-vous",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addAppointment = async (appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment> => {
    try {
      const newAppointment: Appointment = {
        ...appointmentData,
        id: `apt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'scheduled'
      };

      // TODO: Remplacer par un appel Supabase réel
      // const { data, error } = await supabase
      //   .from('appointments')
      //   .insert(newAppointment)
      //   .select()
      //   .single();
      
      // if (error) throw error;

      // Mise à jour locale immédiate
      setAppointments(prev => [...prev, newAppointment].sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.time.localeCompare(b.time);
      }));

      toast({
        title: "Rendez-vous créé",
        description: `RDV programmé pour ${appointmentData.patientName} le ${new Date(appointmentData.date).toLocaleDateString('fr-FR')} à ${appointmentData.time}`,
      });

      return newAppointment;
    } catch (error) {
      console.error('Erreur lors de la création du rendez-vous:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le rendez-vous",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateAppointment = async (id: string, updates: Partial<Appointment>): Promise<void> => {
    try {
      const updatedAppointment = {
        ...updates,
        updatedAt: new Date().toISOString()
      };

      // TODO: Remplacer par un appel Supabase réel
      // const { error } = await supabase
      //   .from('appointments')
      //   .update(updatedAppointment)
      //   .eq('id', id);
      
      // if (error) throw error;

      // Mise à jour locale immédiate
      setAppointments(prev => prev.map(apt => 
        apt.id === id ? { ...apt, ...updatedAppointment } : apt
      ));

      toast({
        title: "Rendez-vous modifié",
        description: "Les modifications ont été enregistrées",
      });
    } catch (error) {
      console.error('Erreur lors de la modification du rendez-vous:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le rendez-vous",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteAppointment = async (id: string): Promise<void> => {
    try {
      // TODO: Remplacer par un appel Supabase réel
      // const { error } = await supabase
      //   .from('appointments')
      //   .delete()
      //   .eq('id', id);
      
      // if (error) throw error;

      // Mise à jour locale immédiate
      setAppointments(prev => prev.filter(apt => apt.id !== id));

      toast({
        title: "Rendez-vous supprimé",
        description: "Le rendez-vous a été annulé",
      });
    } catch (error) {
      console.error('Erreur lors de la suppression du rendez-vous:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le rendez-vous",
        variant: "destructive"
      });
      throw error;
    }
  };

  const getPatientAppointments = (patientId: string): Appointment[] => {
    return appointments.filter(apt => apt.patientId === patientId);
  };

  const getDoctorAppointments = (doctorId: string): Appointment[] => {
    return appointments.filter(apt => apt.doctorId === doctorId);
  };

  const getAppointmentsByDate = (date: string): Appointment[] => {
    return appointments.filter(apt => apt.date === date);
  };

  const refreshAppointments = async (): Promise<void> => {
    await loadAppointments();
  };

  // Chargement initial
  useEffect(() => {
    loadAppointments();
  }, []);

  // Configuration de Supabase Realtime pour les updates en temps réel
  useEffect(() => {
    // TODO: Activer quand la table appointments sera créée en base
    // const channel = supabase
    //   .channel('schema-db-changes')
    //   .on(
    //     'postgres_changes',
    //     {
    //       event: '*',
    //       schema: 'public',
    //       table: 'appointments'
    //     },
    //     (payload) => {
    //       console.log('Appointment change detected:', payload);
    //       refreshAppointments();
    //     }
    //   )
    //   .subscribe();

    // return () => {
    //   supabase.removeChannel(channel);
    // };
  }, []);

  const contextValue: AppointmentContextType = {
    appointments,
    loading,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    getPatientAppointments,
    getDoctorAppointments,
    getAppointmentsByDate,
    refreshAppointments
  };

  return (
    <AppointmentContext.Provider value={contextValue}>
      {children}
    </AppointmentContext.Provider>
  );
};