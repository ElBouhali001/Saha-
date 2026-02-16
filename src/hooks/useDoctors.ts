
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
          { id: 'mock-spec-5', name: 'Gynécologie', description: 'Spécialiste de la santé féminine' },
          { id: 'mock-spec-6', name: 'Neurologie', description: 'Spécialiste du système nerveux' },
          { id: 'mock-spec-7', name: 'Orthopédie', description: 'Spécialiste des troubles musculo-squelettiques' },
          { id: 'mock-spec-8', name: 'Ophtalmologie', description: 'Spécialiste des maladies des yeux' }
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
            consultation_fee: 35000,
            availability_status: 'available',
            tenant_id: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            profile: {
              id: 'mock-user-1',
              first_name: 'Marie',
              last_name: 'Koné',
              email: 'marie.kone@chu-abidjan.ci',
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
                  name: 'Cardiologie',
                  description: 'Spécialiste des maladies cardiovasculaires',
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
            consultation_fee: 30000,
            availability_status: 'available',
            tenant_id: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            profile: {
              id: 'mock-user-2',
              first_name: 'Paul',
              last_name: 'Traoré',
              email: 'paul.traore@hopital-yopougon.ci',
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
                  name: 'Dermatologie',
                  description: 'Spécialiste des maladies de la peau',
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
            consultation_fee: 40000,
            availability_status: 'available',
            tenant_id: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            profile: {
              id: 'mock-user-3',
              first_name: 'Fatou',
              last_name: 'Diabaté',
              email: 'fatou.diabate@polyclinique-abidjan.ci',
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
                  name: 'Neurologie',
                  description: 'Spécialiste des maladies du système nerveux',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }
              }
            ]
          },
          {
            id: 'mock-4',
            user_id: 'mock-user-4',
            specialty_id: null,
            license_number: 'DOC004',
            consultation_fee: 38000,
            availability_status: 'available',
            tenant_id: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            profile: {
              id: 'mock-user-4',
              first_name: 'Kouamé',
              last_name: 'N\'Guessan',
              email: 'kouame.nguessan@chu-cocody.ci',
              phone: '+225 07 44 55 66 77',
              role: 'doctor',
              tenant_id: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              structure_type: 'medical_center'
            },
            doctor_specialties: [
              {
                id: 'mock-ds-4',
                is_primary: true,
                specialty: {
                  id: 'mock-spec-4',
                  name: 'Orthopédie',
                  description: 'Spécialiste des troubles musculo-squelettiques',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }
              }
            ]
          },
          {
            id: 'mock-5',
            user_id: 'mock-user-5',
            specialty_id: null,
            license_number: 'DOC005',
            consultation_fee: 42000,
            availability_status: 'available',
            tenant_id: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            profile: {
              id: 'mock-user-5',
              first_name: 'Awa',
              last_name: 'Camara',
              email: 'awa.camara@clinique-treichville.ci',
              phone: '+225 07 55 66 77 88',
              role: 'doctor',
              tenant_id: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              structure_type: 'medical_center'
            },
            doctor_specialties: [
              {
                id: 'mock-ds-5',
                is_primary: true,
                specialty: {
                  id: 'mock-spec-5',
                  name: 'Gynécologie',
                  description: 'Spécialiste de la santé féminine',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }
              }
            ]
          },
          {
            id: 'mock-6',
            user_id: 'mock-user-6',
            specialty_id: null,
            license_number: 'DOC006',
            consultation_fee: 36000,
            availability_status: 'available',
            tenant_id: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            profile: {
              id: 'mock-user-6',
              first_name: 'Ibrahim',
              last_name: 'Ouattara',
              email: 'ibrahim.ouattara@hopital-bouake.ci',
              phone: '+225 07 66 77 88 99',
              role: 'doctor',
              tenant_id: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              structure_type: 'medical_center'
            },
            doctor_specialties: [
              {
                id: 'mock-ds-6',
                is_primary: true,
                specialty: {
                  id: 'mock-spec-6',
                  name: 'Pédiatrie',
                  description: 'Spécialiste des soins aux enfants',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }
              }
            ]
          },
          {
            id: 'mock-7',
            user_id: 'mock-user-7',
            specialty_id: null,
            license_number: 'DOC007',
            consultation_fee: 45000,
            availability_status: 'available',
            tenant_id: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            profile: {
              id: 'mock-user-7',
              first_name: 'Adjoa',
              last_name: 'Assouan',
              email: 'adjoa.assouan@clinique-marcory.ci',
              phone: '+225 07 77 88 99 00',
              role: 'doctor',
              tenant_id: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              structure_type: 'medical_center'
            },
            doctor_specialties: [
              {
                id: 'mock-ds-7',
                is_primary: true,
                specialty: {
                  id: 'mock-spec-7',
                  name: 'Ophtalmologie',
                  description: 'Spécialiste des maladies des yeux',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }
              }
            ]
          },
          {
            id: 'mock-8',
            user_id: 'mock-user-8',
            specialty_id: null,
            license_number: 'DOC008',
            consultation_fee: 39000,
            availability_status: 'available',
            tenant_id: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            profile: {
              id: 'mock-user-8',
              first_name: 'Youssouf',
              last_name: 'Bakayoko',
              email: 'youssouf.bakayoko@chu-treichville.ci',
              phone: '+225 07 88 99 00 11',
              role: 'doctor',
              tenant_id: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              structure_type: 'medical_center'
            },
            doctor_specialties: [
              {
                id: 'mock-ds-8',
                is_primary: true,
                specialty: {
                  id: 'mock-spec-8',
                  name: 'Psychiatrie',
                  description: 'Spécialiste des troubles mentaux',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }
              }
            ]
          },
          // Médecins spécialistes supplémentaires
          {
            id: 'mock-doctor-cardio-1',
            user_id: 'cardio1',
            license_number: 'C001',
            consultation_fee: 8000, // 80€
            availability_status: 'available',
            tenant_id: 'mock-tenant',
            specialty_id: 'mock-spec-2',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            profile: {
              id: 'cardio1',
              first_name: 'Marie',
              last_name: 'Dubois',
              email: 'cardio.dubois@medipatient.com',
              phone: '+33 1 45 67 89 01',
              role: 'doctor',
              tenant_id: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              structure_type: 'medical_center'
            },
            doctor_specialties: [{
              id: 'cardio1-spec',
              is_primary: true,
              specialty: {
                id: 'mock-spec-2',
                name: 'Cardiologie',
                description: 'Spécialiste des maladies cardiovasculaires',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            }]
          },
          {
            id: 'mock-doctor-dermato-1',
            user_id: 'dermato1',
            license_number: 'D001',
            consultation_fee: 7500, // 75€
            availability_status: 'available',
            tenant_id: 'mock-tenant',
            specialty_id: 'mock-spec-3',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            profile: {
              id: 'dermato1',
              first_name: 'Pierre',
              last_name: 'Moreau',
              email: 'dermato.moreau@medipatient.com',
              phone: '+33 1 45 67 89 02',
              role: 'doctor',
              tenant_id: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              structure_type: 'medical_center'
            },
            doctor_specialties: [{
              id: 'dermato1-spec',
              is_primary: true,
              specialty: {
                id: 'mock-spec-3',
                name: 'Dermatologie',
                description: 'Spécialiste des maladies de la peau',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            }]
          },
          {
            id: 'mock-doctor-pediatre-1',
            user_id: 'pediatre1',
            license_number: 'P001',
            consultation_fee: 6500, // 65€
            availability_status: 'available',
            tenant_id: 'mock-tenant',
            specialty_id: 'mock-spec-4',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            profile: {
              id: 'pediatre1',
              first_name: 'Sophie',
              last_name: 'Lemaire',
              email: 'pediatre.lemaire@medipatient.com',
              phone: '+33 1 45 67 89 03',
              role: 'doctor',
              tenant_id: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              structure_type: 'medical_center'
            },
            doctor_specialties: [{
              id: 'pediatre1-spec',
              is_primary: true,
              specialty: {
                id: 'mock-spec-4',
                name: 'Pédiatrie',
                description: 'Spécialiste des soins aux enfants',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            }]
          },
          {
            id: 'mock-doctor-gyneco-1',
            user_id: 'gyneco1',
            license_number: 'G001',
            consultation_fee: 7000, // 70€
            availability_status: 'available',
            tenant_id: 'mock-tenant',
            specialty_id: 'mock-spec-5',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            profile: {
              id: 'gyneco1',
              first_name: 'Claire',
              last_name: 'Bernard',
              email: 'gyneco.bernard@medipatient.com',
              phone: '+33 1 45 67 89 04',
              role: 'doctor',
              tenant_id: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              structure_type: 'medical_center'
            },
            doctor_specialties: [{
              id: 'gyneco1-spec',
              is_primary: true,
              specialty: {
                id: 'mock-spec-5',
                name: 'Gynécologie',
                description: 'Spécialiste de la santé féminine',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            }]
          },
          {
            id: 'mock-doctor-neuro-1',
            user_id: 'neuro1',
            license_number: 'N001',
            consultation_fee: 9000, // 90€
            availability_status: 'available',
            tenant_id: 'mock-tenant',
            specialty_id: 'mock-spec-6',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            profile: {
              id: 'neuro1',
              first_name: 'Thomas',
              last_name: 'Rousseau',
              email: 'neuro.rousseau@medipatient.com',
              phone: '+33 1 45 67 89 05',
              role: 'doctor',
              tenant_id: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              structure_type: 'medical_center'
            },
            doctor_specialties: [{
              id: 'neuro1-spec',
              is_primary: true,
              specialty: {
                id: 'mock-spec-6',
                name: 'Neurologie',
                description: 'Spécialiste du système nerveux',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            }]
          },
          {
            id: 'mock-doctor-ortho-1',
            user_id: 'ortho1',
            license_number: 'O001',
            consultation_fee: 8500, // 85€
            availability_status: 'available',
            tenant_id: 'mock-tenant',
            specialty_id: 'mock-spec-7',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            profile: {
              id: 'ortho1',
              first_name: 'Lucas',
              last_name: 'Girard',
              email: 'ortho.girard@medipatient.com',
              phone: '+33 1 45 67 89 06',
              role: 'doctor',
              tenant_id: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              structure_type: 'medical_center'
            },
            doctor_specialties: [{
              id: 'ortho1-spec',
              is_primary: true,
              specialty: {
                id: 'mock-spec-7',
                name: 'Orthopédie',
                description: 'Spécialiste des troubles musculo-squelettiques',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            }]
          },
          {
            id: 'mock-doctor-ophtalmo-1',
            user_id: 'ophtalmo1',
            license_number: 'OP001',
            consultation_fee: 7500, // 75€
            availability_status: 'available',
            tenant_id: 'mock-tenant',
            specialty_id: 'mock-spec-8',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            profile: {
              id: 'ophtalmo1',
              first_name: 'Emma',
              last_name: 'Leroy',
              email: 'ophtalmo.leroy@medipatient.com',
              phone: '+33 1 45 67 89 07',
              role: 'doctor',
              tenant_id: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              structure_type: 'medical_center'
            },
            doctor_specialties: [{
              id: 'ophtalmo1-spec',
              is_primary: true,
              specialty: {
                id: 'mock-spec-8',
                name: 'Ophtalmologie',
                description: 'Spécialiste des maladies des yeux',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            }]
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
