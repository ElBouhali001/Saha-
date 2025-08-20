
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useDoctors = () => {
  return useQuery({
    queryKey: ['doctors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('doctors')
        .select(`
          *,
          profile:profiles(*),
          doctor_specialties!inner(
            id,
            is_primary,
            specialty:specialties(*)
          )
        `);

      if (error) throw error;
      return data;
    },
  });
};

export const useSpecialties = () => {
  return useQuery({
    queryKey: ['specialties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('specialties')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      
      // Si aucune spécialité réelle, retourner des données mock
      if (!data || data.length === 0) {
        return [
          { id: 'mock-spec-1', name: 'Médecine Générale', description: 'Consultation générale et soins de première ligne' },
          { id: 'mock-spec-2', name: 'Cardiologie', description: 'Spécialiste des maladies cardiovasculaires' },
          { id: 'mock-spec-3', name: 'Dermatologie', description: 'Spécialiste des maladies de la peau' },
          { id: 'mock-spec-4', name: 'Pédiatrie', description: 'Spécialiste des soins aux enfants' },
          { id: 'mock-spec-5', name: 'Gynécologie', description: 'Spécialiste de la santé féminine' }
        ];
      }
      
      return data;
    },
  });
};

export const useAvailableDoctors = (date?: string) => {
  return useQuery({
    queryKey: ['available-doctors', date],
    queryFn: async () => {
      console.log('Fetching available doctors for date:', date);
      
      const { data, error } = await supabase
        .from('doctors')
        .select(`
          *,
          profile:profiles(*),
          doctor_specialties(
            id,
            is_primary,
            specialty:specialties(*)
          )
        `)
        .eq('availability_status', 'available');

      if (error) {
        console.error('Error fetching doctors:', error);
        throw error;
      }
      
      console.log('Fetched doctors:', data);
      
      // Si aucun docteur réel, retourner des données mock
      if (!data || data.length === 0) {
        const mockDoctors = [
          {
            id: 'mock-1',
            user_id: 'mock-user-1',
            specialty_id: null,
            license_number: 'DOC001',
            consultation_fee: 25000,
            availability_status: 'available',
            tenant_id: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            profile: {
              id: 'mock-user-1',
              first_name: 'Jean',
              last_name: 'Dupont',
              email: 'jean.dupont@hopital.com',
              phone: '+225 07 11 22 33 44',
              role: 'doctor',
              tenant_id: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              structure_type: 'medical_center'
            },
            doctor_specialties: [
              {
                id: 'mock-ds-1',
                is_primary: true,
                specialty: {
                  id: 'mock-spec-1', 
                  name: 'Médecine Générale',
                  description: 'Consultation générale et soins de première ligne',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }
              }
            ]
          },
          {
            id: 'mock-2',
            user_id: 'mock-user-2',
            specialty_id: null,
            license_number: 'DOC002',
            consultation_fee: 35000,
            availability_status: 'available',
            tenant_id: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            profile: {
              id: 'mock-user-2',
              first_name: 'Marie',
              last_name: 'Martin',
              email: 'marie.martin@hopital.com',
              phone: '+225 07 22 33 44 55',
              role: 'doctor',
              tenant_id: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              structure_type: 'medical_center'
            },
            doctor_specialties: [
              {
                id: 'mock-ds-2',
                is_primary: true,
                specialty: {
                  id: 'mock-spec-2',
                  name: 'Cardiologie',
                  description: 'Spécialiste des maladies cardiovasculaires',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }
              }
            ]
          },
          {
            id: 'mock-3',
            user_id: 'mock-user-3',
            specialty_id: null,
            license_number: 'DOC003',
            consultation_fee: 30000,
            availability_status: 'available',
            tenant_id: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            profile: {
              id: 'mock-user-3',
              first_name: 'Paul',
              last_name: 'Bernard',
              email: 'paul.bernard@hopital.com',
              phone: '+225 07 33 44 55 66',
              role: 'doctor',
              tenant_id: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              structure_type: 'medical_center'
            },
            doctor_specialties: [
              {
                id: 'mock-ds-3',
                is_primary: true,
                specialty: {
                  id: 'mock-spec-3',
                  name: 'Dermatologie',
                  description: 'Spécialiste des maladies de la peau',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }
              }
            ]
          }
        ];
        console.log('Using mock doctors:', mockDoctors);
        return mockDoctors;
      }
      
      // Filtrer seulement les médecins qui ont des spécialités
      const doctorsWithSpecialties = data?.filter(doctor => 
        doctor.doctor_specialties && doctor.doctor_specialties.length > 0
      ) || [];
      
      console.log('Doctors with specialties:', doctorsWithSpecialties);
      return doctorsWithSpecialties;
    },
  });
};

export const useDoctorSpecialties = () => {
  return useQuery({
    queryKey: ['doctor-specialties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('doctor_specialties')
        .select(`
          *,
          doctor:doctors(*),
          specialty:specialties(*)
        `);

      if (error) throw error;
      return data;
    },
  });
};
