
import { useState, useEffect } from 'react';

export interface MockLabTest {
  id: string;
  test_name: string;
  test_type: string;
  status: 'prescribed' | 'scheduled' | 'completed' | 'results_available';
  patient: {
    profile: {
      first_name: string;
      last_name: string;
    };
  };
  doctor: {
    profile: {
      first_name: string;
      last_name: string;
    };
  };
  appointment_date?: string;
  appointment_time?: string;
  results_date?: string;
  preparation_instructions?: string[];
  results?: any;
}

export interface MockPharmacyPrescription {
  id: string;
  status: 'received' | 'preparing' | 'ready' | 'delivered';
  prescription: {
    medications: Array<{
      name: string;
      dosage: string;
      frequency: string;
      duration: string;
    }>;
    patient: {
      profile: {
        first_name: string;
        last_name: string;
      };
    };
    doctor: {
      profile: {
        first_name: string;
        last_name: string;
      };
    };
  };
  availability_status: 'available' | 'partial' | 'unavailable';
  ready_date?: string;
  delivered_date?: string;
  substitutions?: any;
}

export const useMockLabTests = () => {
  const [labTests] = useState<MockLabTest[]>([
    {
      id: '1',
      test_name: 'Bilan sanguin complet',
      test_type: 'Hématologie',
      status: 'prescribed',
      patient: {
        profile: {
          first_name: 'Jean',
          last_name: 'Koné'
        }
      },
      doctor: {
        profile: {
          first_name: 'Dr. Kouamé',
          last_name: 'Adjoua'
        }
      },
      preparation_instructions: [
        'Être à jeun depuis 12h',
        'Éviter l\'effort physique intense',
        'Bien s\'hydrater'
      ]
    },
    {
      id: '2',
      test_name: 'Glycémie à jeun',
      test_type: 'Biochimie',
      status: 'scheduled',
      patient: {
        profile: {
          first_name: 'Marie',
          last_name: 'Traoré'
        }
      },
      doctor: {
        profile: {
          first_name: 'Dr. Mamadou',
          last_name: 'Diallo'
        }
      },
      appointment_date: '2024-01-26',
      appointment_time: '08:00',
      preparation_instructions: [
        'Jeûne de 8h minimum',
        'Pas de médicaments le matin'
      ]
    },
    {
      id: '3',
      test_name: 'Électrocardiogramme',
      test_type: 'Cardiologie',
      status: 'completed',
      patient: {
        profile: {
          first_name: 'Fatou',
          last_name: 'Sangaré'
        }
      },
      doctor: {
        profile: {
          first_name: 'Dr. Ahmed',
          last_name: 'Touré'
        }
      },
      results_date: '2024-01-22T10:30:00Z',
      results: {
        rhythm: 'Sinusal normal',
        frequency: '72 bpm',
        conclusion: 'ECG normal'
      }
    },
    {
      id: '4',
      test_name: 'Radiographie thoracique',
      test_type: 'Imagerie',
      status: 'results_available',
      patient: {
        profile: {
          first_name: 'Amadou',
          last_name: 'Coulibaly'
        }
      },
      doctor: {
        profile: {
          first_name: 'Dr. Aïcha',
          last_name: 'Keita'
        }
      },
      results_date: '2024-01-23T14:15:00Z',
      results: {
        findings: 'Poumons clairs, pas d\'anomalie détectée',
        conclusion: 'Radiographie normale'
      }
    }
  ]);

  return { data: labTests, isLoading: false };
};

export const useMockPharmacyPrescriptions = () => {
  const [prescriptions] = useState<MockPharmacyPrescription[]>([
    {
      id: '1',
      status: 'received',
      prescription: {
        medications: [
          {
            name: 'Paracétamol',
            dosage: '500mg',
            frequency: '3 fois par jour',
            duration: '7 jours'
          },
          {
            name: 'Amoxicilline',
            dosage: '250mg',
            frequency: '2 fois par jour',
            duration: '10 jours'
          }
        ],
        patient: {
          profile: {
            first_name: 'Jean',
            last_name: 'Koné'
          }
        },
        doctor: {
          profile: {
            first_name: 'Dr. Kouamé',
            last_name: 'Adjoua'
          }
        }
      },
      availability_status: 'available'
    },
    {
      id: '2',
      status: 'preparing',
      prescription: {
        medications: [
          {
            name: 'Lisinopril',
            dosage: '10mg',
            frequency: '1 fois par jour',
            duration: '30 jours'
          }
        ],
        patient: {
          profile: {
            first_name: 'Marie',
            last_name: 'Traoré'
          }
        },
        doctor: {
          profile: {
            first_name: 'Dr. Mamadou',
            last_name: 'Diallo'
          }
        }
      },
      availability_status: 'available'
    },
    {
      id: '3',
      status: 'ready',
      prescription: {
        medications: [
          {
            name: 'Metformine',
            dosage: '500mg',
            frequency: '2 fois par jour',
            duration: '30 jours'
          }
        ],
        patient: {
          profile: {
            first_name: 'Fatou',
            last_name: 'Sangaré'
          }
        },
        doctor: {
          profile: {
            first_name: 'Dr. Ahmed',
            last_name: 'Touré'
          }
        }
      },
      availability_status: 'available',
      ready_date: '2024-01-24T16:00:00Z'
    },
    {
      id: '4',
      status: 'delivered',
      prescription: {
        medications: [
          {
            name: 'Ibuprofène',
            dosage: '400mg',
            frequency: 'Au besoin',
            duration: '5 jours'
          }
        ],
        patient: {
          profile: {
            first_name: 'Amadou',
            last_name: 'Coulibaly'
          }
        },
        doctor: {
          profile: {
            first_name: 'Dr. Aïcha',
            last_name: 'Keita'
          }
        }
      },
      availability_status: 'available',
      ready_date: '2024-01-23T10:00:00Z',
      delivered_date: '2024-01-23T18:30:00Z'
    }
  ]);

  return { data: prescriptions, isLoading: false };
};

export const useMockUpdateLabTest = () => {
  return {
    mutateAsync: async (data: { id: string; updates: any }) => {
      console.log('Mock update lab test:', data);
      return data;
    },
    isPending: false
  };
};

export const useMockUpdatePharmacyPrescription = () => {
  return {
    mutateAsync: async (data: { id: string; updates: any }) => {
      console.log('Mock update pharmacy prescription:', data);
      return data;
    },
    isPending: false
  };
};
