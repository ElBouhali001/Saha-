
import { useState } from 'react';

export interface MockDoctor {
  id: string;
  profile: {
    first_name: string;
    last_name: string;
  };
  consultation_fee: number;
  availability_status: 'available' | 'busy' | 'unavailable';
  doctor_specialties: Array<{
    id: string;
    is_primary: boolean;
    specialty_id: string;
    specialty: {
      id: string;
      name: string;
    };
  }>;
}

export interface MockSpecialty {
  id: string;
  name: string;
}

export const useMockDoctors = () => {
  const [doctors] = useState<MockDoctor[]>([
    {
      id: '1',
      profile: {
        first_name: 'Kouamé',
        last_name: 'Adjoua'
      },
      consultation_fee: 15000,
      availability_status: 'available',
      doctor_specialties: [
        {
          id: '1',
          is_primary: true,
          specialty_id: '1',
          specialty: {
            id: '1',
            name: 'Médecine Générale'
          }
        }
      ]
    },
    {
      id: '2',
      profile: {
        first_name: 'Mamadou',
        last_name: 'Diallo'
      },
      consultation_fee: 25000,
      availability_status: 'available',
      doctor_specialties: [
        {
          id: '2',
          is_primary: true,
          specialty_id: '2',
          specialty: {
            id: '2',
            name: 'Cardiologie'
          }
        }
      ]
    },
    {
      id: '3',
      profile: {
        first_name: 'Aïcha',
        last_name: 'Keita'
      },
      consultation_fee: 20000,
      availability_status: 'available',
      doctor_specialties: [
        {
          id: '3',
          is_primary: true,
          specialty_id: '3',
          specialty: {
            id: '3',
            name: 'Pédiatrie'
          }
        }
      ]
    },
    {
      id: '4',
      profile: {
        first_name: 'Ahmed',
        last_name: 'Touré'
      },
      consultation_fee: 30000,
      availability_status: 'available',
      doctor_specialties: [
        {
          id: '4',
          is_primary: true,
          specialty_id: '4',
          specialty: {
            id: '4',
            name: 'Gynécologie'
          }
        }
      ]
    },
    {
      id: '5',
      profile: {
        first_name: 'Fatou',
        last_name: 'Sangaré'
      },
      consultation_fee: 22000,
      availability_status: 'available',
      doctor_specialties: [
        {
          id: '5',
          is_primary: true,
          specialty_id: '5',
          specialty: {
            id: '5',
            name: 'Dermatologie'
          }
        }
      ]
    }
  ]);

  return { data: doctors, isLoading: false };
};

export const useMockSpecialties = () => {
  const [specialties] = useState<MockSpecialty[]>([
    { id: '1', name: 'Médecine Générale' },
    { id: '2', name: 'Cardiologie' },
    { id: '3', name: 'Pédiatrie' },
    { id: '4', name: 'Gynécologie' },
    { id: '5', name: 'Dermatologie' }
  ]);

  return { data: specialties, isLoading: false };
};
