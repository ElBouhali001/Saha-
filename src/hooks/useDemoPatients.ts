import { useState } from 'react';
import { Patient, MedicalRecord, Prescription } from '@/types/patient';

export interface DemoPatient extends Patient {
  consultations: number;
  lastVisit: string;
  primaryDoctor?: string;
  insurance?: string;
  urgencyLevel?: 'low' | 'medium' | 'high';
}

const generateDemoPatients = (): DemoPatient[] => [
  {
    id: '1',
    firstName: 'Aïcha',
    lastName: 'Diabaté',
    dateOfBirth: '1985-03-15',
    phone: '+225 07 12 34 56 78',
    address: 'Cocody, Abidjan',
    email: 'aicha.diabate@email.com',
    emergencyContact: {
      name: 'Ibrahim Diabaté',
      phone: '+225 05 98 76 54 32',
      relationship: 'époux'
    },
    consultations: 8,
    lastVisit: '2024-01-15',
    primaryDoctor: 'Dr. Kouamé',
    insurance: 'CNPS',
    urgencyLevel: 'medium',
    medicalHistory: [
      {
        id: 'mr1',
        patientId: '1',
        date: '2024-01-15',
        doctorId: 'doc1',
        doctorName: 'Dr. Kouamé',
        diagnosis: 'Hypertension artérielle',
        symptoms: 'Maux de tête, fatigue, étourdissements',
        treatment: 'Antihypertenseur, régime pauvre en sel',
        notes: 'Suivi régulier nécessaire, contrôle dans 3 mois',
        prescriptions: [
          {
            id: 'p1',
            medicationName: 'Amlodipine',
            dosage: '5mg',
            frequency: '1 fois par jour',
            duration: '3 mois',
            instructions: 'À prendre le matin avec un verre d\'eau',
            prescribed_date: '2024-01-15'
          }
        ],
        followUpDate: '2024-04-15'
      },
      {
        id: 'mr2',
        patientId: '1',
        date: '2023-11-20',
        doctorId: 'doc1',
        doctorName: 'Dr. Kouamé',
        diagnosis: 'Diabète type 2',
        symptoms: 'Soif excessive, fatigue, vision floue',
        treatment: 'Metformine, régime diabétique',
        notes: 'Éducation thérapeutique dispensée',
        prescriptions: [
          {
            id: 'p2',
            medicationName: 'Metformine',
            dosage: '500mg',
            frequency: '2 fois par jour',
            duration: '6 mois',
            instructions: 'Pendant les repas',
            prescribed_date: '2023-11-20'
          }
        ]
      }
    ],
    createdAt: '2023-01-10T10:00:00.000Z',
    updatedAt: '2024-01-15T14:30:00.000Z'
  },
  {
    id: '2',
    firstName: 'Ibrahim',
    lastName: 'Koné',
    dateOfBirth: '1978-07-22',
    phone: '+225 01 23 45 67 89',
    address: 'Plateau, Abidjan',
    email: 'ibrahim.kone@email.com',
    emergencyContact: {
      name: 'Fatou Koné',
      phone: '+225 07 65 43 21 98',
      relationship: 'épouse'
    },
    consultations: 12,
    lastVisit: '2024-01-20',
    primaryDoctor: 'Dr. Traoré',
    insurance: 'MUGEF-CI',
    urgencyLevel: 'low',
    medicalHistory: [
      {
        id: 'mr3',
        patientId: '2',
        date: '2024-01-20',
        doctorId: 'doc2',
        doctorName: 'Dr. Traoré',
        diagnosis: 'Gastrite chronique',
        symptoms: 'Douleurs épigastriques, nausées',
        treatment: 'IPP, régime alimentaire',
        notes: 'Éviter les aliments épicés et l\'alcool',
        prescriptions: [
          {
            id: 'p3',
            medicationName: 'Oméprazole',
            dosage: '20mg',
            frequency: '1 fois par jour',
            duration: '2 mois',
            instructions: 'À jeun le matin',
            prescribed_date: '2024-01-20'
          }
        ],
        followUpDate: '2024-03-20'
      }
    ],
    createdAt: '2022-05-15T09:00:00.000Z',
    updatedAt: '2024-01-20T11:15:00.000Z'
  },
  {
    id: '3',
    firstName: 'Mariam',
    lastName: 'Bamba',
    dateOfBirth: '1992-12-08',
    phone: '+225 05 87 65 43 21',
    address: 'Yopougon, Abidjan',
    email: 'mariam.bamba@email.com',
    emergencyContact: {
      name: 'Seydou Bamba',
      phone: '+225 07 11 22 33 44',
      relationship: 'frère'
    },
    consultations: 15,
    lastVisit: '2024-01-18',
    primaryDoctor: 'Dr. Kouamé',
    insurance: 'CMU',
    urgencyLevel: 'high',
    medicalHistory: [
      {
        id: 'mr4',
        patientId: '3',
        date: '2024-01-18',
        doctorId: 'doc1',
        doctorName: 'Dr. Kouamé',
        diagnosis: 'Asthme bronchique',
        symptoms: 'Dyspnée, toux sèche, sifflements',
        treatment: 'Bronchodilatateurs, corticoïdes inhalés',
        notes: 'Éviter les allergènes, avoir toujours l\'inhalateur',
        prescriptions: [
          {
            id: 'p4',
            medicationName: 'Salbutamol',
            dosage: '100mcg',
            frequency: 'À la demande',
            duration: '6 mois',
            instructions: '2 bouffées en cas de crise',
            prescribed_date: '2024-01-18'
          },
          {
            id: 'p5',
            medicationName: 'Fluticasone',
            dosage: '125mcg',
            frequency: '2 fois par jour',
            duration: '3 mois',
            instructions: 'Rincer la bouche après utilisation',
            prescribed_date: '2024-01-18'
          }
        ],
        followUpDate: '2024-02-18'
      }
    ],
    createdAt: '2023-03-20T08:30:00.000Z',
    updatedAt: '2024-01-18T16:45:00.000Z'
  },
  {
    id: '4',
    firstName: 'Moussa',
    lastName: 'Soro',
    dateOfBirth: '1965-09-14',
    phone: '+225 02 34 56 78 90',
    address: 'Adjamé, Abidjan',
    email: 'moussa.soro@email.com',
    emergencyContact: {
      name: 'Aminata Soro',
      phone: '+225 01 99 88 77 66',
      relationship: 'épouse'
    },
    consultations: 25,
    lastVisit: '2024-01-12',
    primaryDoctor: 'Dr. Kouamé',
    insurance: 'CNPS',
    urgencyLevel: 'medium',
    medicalHistory: [
      {
        id: 'mr5',
        patientId: '4',
        date: '2024-01-12',
        doctorId: 'doc1',
        doctorName: 'Dr. Kouamé',
        diagnosis: 'Arthrose lombaire',
        symptoms: 'Douleurs lombaires, raideur matinale',
        treatment: 'Anti-inflammatoires, kinésithérapie',
        notes: 'Exercices d\'étirement recommandés',
        prescriptions: [
          {
            id: 'p6',
            medicationName: 'Diclofénac',
            dosage: '50mg',
            frequency: '2 fois par jour',
            duration: '1 mois',
            instructions: 'Après les repas',
            prescribed_date: '2024-01-12'
          }
        ],
        followUpDate: '2024-02-12'
      }
    ],
    createdAt: '2021-08-05T14:20:00.000Z',
    updatedAt: '2024-01-12T10:30:00.000Z'
  },
  {
    id: '5',
    firstName: 'Fatou',
    lastName: 'Touré',
    dateOfBirth: '1990-05-30',
    phone: '+225 07 55 44 33 22',
    address: 'Marcory, Abidjan',
    email: 'fatou.toure@email.com',
    emergencyContact: {
      name: 'Mamadou Touré',
      phone: '+225 05 77 88 99 00',
      relationship: 'époux'
    },
    consultations: 6,
    lastVisit: '2024-01-25',
    primaryDoctor: 'Dr. Traoré',
    insurance: 'Mutuelle',
    urgencyLevel: 'low',
    medicalHistory: [
      {
        id: 'mr6',
        patientId: '5',
        date: '2024-01-25',
        doctorId: 'doc2',
        doctorName: 'Dr. Traoré',
        diagnosis: 'Suivi grossesse',
        symptoms: 'Aucun symptôme particulier',
        treatment: 'Vitamines prénatales, surveillance',
        notes: 'Grossesse évoluant normalement à 20 SA',
        prescriptions: [
          {
            id: 'p7',
            medicationName: 'Acide folique',
            dosage: '5mg',
            frequency: '1 fois par jour',
            duration: 'Jusqu\'à l\'accouchement',
            instructions: 'Le matin à jeun',
            prescribed_date: '2024-01-25'
          }
        ],
        followUpDate: '2024-02-25'
      }
    ],
    createdAt: '2023-09-10T11:00:00.000Z',
    updatedAt: '2024-01-25T09:15:00.000Z'
  },
  {
    id: '6',
    firstName: 'Amadou',
    lastName: 'Fall',
    dateOfBirth: '1998-06-15',
    phone: '+221 77 123 45 67',
    address: 'Dakar, Sénégal',
    email: 'amadou.qa-test@email.com',
    emergencyContact: {
      name: 'Khady Fall',
      phone: '+221 77 987 65 43',
      relationship: 'sœur'
    },
    consultations: 0,
    lastVisit: '2024-03-10',
    primaryDoctor: 'Dr. Diop',
    insurance: 'Aucune',
    urgencyLevel: 'medium',
    medicalHistory: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const useDemoPatients = () => {
  const [patients] = useState<DemoPatient[]>(generateDemoPatients());
  
  const getPatientById = (id: string): DemoPatient | undefined => {
    return patients.find(patient => patient.id === id);
  };

  const searchPatients = (query: string): DemoPatient[] => {
    if (!query.trim()) return patients;
    
    const lowercaseQuery = query.toLowerCase();
    return patients.filter(patient =>
      `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(lowercaseQuery) ||
      patient.phone.includes(query) ||
      patient.email?.toLowerCase().includes(lowercaseQuery)
    );
  };

  return {
    patients,
    getPatientById,
    searchPatients
  };
};