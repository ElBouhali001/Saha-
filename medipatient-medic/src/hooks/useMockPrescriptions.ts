
import { useState } from 'react';

export interface MockPrescription {
  id: string;
  date: string;
  doctor: string;
  medications: string[];
  status: 'active' | 'completed';
}

export const useMockPrescriptions = () => {
  const [prescriptions] = useState<MockPrescription[]>([
    {
      id: '1',
      date: '2024-01-20',
      doctor: 'Dr. Kouamé Adjoua',
      medications: [
        'Paracétamol 500mg - 3 fois/jour pendant 7 jours',
        'Amoxicilline 250mg - 2 fois/jour pendant 10 jours',
        'Vitamine C 1000mg - 1 fois/jour pendant 15 jours'
      ],
      status: 'active'
    },
    {
      id: '2',
      date: '2024-01-15',
      doctor: 'Dr. Mamadou Diallo',
      medications: [
        'Lisinopril 10mg - 1 fois/jour pendant 30 jours',
        'Aspirine 75mg - 1 fois/jour en continu'
      ],
      status: 'active'
    },
    {
      id: '3',
      date: '2024-01-10',
      doctor: 'Dr. Aïcha Keita',
      medications: [
        'Ibuprofène 400mg - Au besoin pour la douleur',
        'Crème anti-inflammatoire - Application locale 2 fois/jour'
      ],
      status: 'completed'
    },
    {
      id: '4',
      date: '2024-01-05',
      doctor: 'Dr. Ahmed Touré',
      medications: [
        'Metformine 500mg - 2 fois/jour pendant 30 jours',
        'Gliclazide 30mg - 1 fois/jour pendant 30 jours'
      ],
      status: 'completed'
    },
    {
      id: '5',
      date: '2023-12-28',
      doctor: 'Dr. Fatou Sangaré',
      medications: [
        'Crème hydratante médicale - Application 2 fois/jour',
        'Antihistaminique 10mg - 1 fois/jour pendant 14 jours'
      ],
      status: 'completed'
    }
  ]);

  return { data: prescriptions, isLoading: false };
};
