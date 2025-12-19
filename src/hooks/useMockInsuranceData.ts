import { useState, useMemo } from 'react';

// Types pour les données mock
export interface MockPatient {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  insuranceId?: string;
  policyNumber?: string;
  planId?: string;
}

export interface MockInsurance {
  id: string;
  name: string;
  coverageRate: number;
  annualLimit: number;
  plans: MockInsurancePlan[];
}

export interface MockInsurancePlan {
  id: string;
  insuranceId: string;
  name: string;
  coverageRate: number;
  annualLimit: number;
  limits: {
    consultation_generale: number;
    consultation_specialisee: number;
    actes_medicaux: number;
    pharmacie: number;
  };
}

export interface MockPatientConsumption {
  patientId: string;
  year: number;
  consumption: {
    consultation_generale: { consumed: number; covered: number };
    consultation_specialisee: { consumed: number; covered: number };
    actes_medicaux: { consumed: number; covered: number };
    pharmacie: { consumed: number; covered: number };
  };
}

export interface MockAuthorizationRequest {
  id: string;
  patientId: string;
  careType: string;
  requestedAmount: number;
  careDescription: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedAmount?: number;
  rejectionReason?: string;
  requestedAt: string;
  respondedAt?: string;
  validityDate?: string;
}

// Données mock des mutuelles/assurances
export const MOCK_INSURANCES: MockInsurance[] = [
  {
    id: 'ins-1',
    name: 'NSIA Assurances Vie',
    coverageRate: 80,
    annualLimit: 5000000,
    plans: [
      {
        id: 'plan-1a',
        insuranceId: 'ins-1',
        name: 'Formule Essentielle',
        coverageRate: 70,
        annualLimit: 2000000,
        limits: {
          consultation_generale: 500000,
          consultation_specialisee: 600000,
          actes_medicaux: 600000,
          pharmacie: 300000
        }
      },
      {
        id: 'plan-1b',
        insuranceId: 'ins-1',
        name: 'Formule Confort',
        coverageRate: 80,
        annualLimit: 3500000,
        limits: {
          consultation_generale: 800000,
          consultation_specialisee: 1000000,
          actes_medicaux: 1200000,
          pharmacie: 500000
        }
      },
      {
        id: 'plan-1c',
        insuranceId: 'ins-1',
        name: 'Formule Premium',
        coverageRate: 90,
        annualLimit: 5000000,
        limits: {
          consultation_generale: 1200000,
          consultation_specialisee: 1500000,
          actes_medicaux: 1800000,
          pharmacie: 500000
        }
      }
    ]
  },
  {
    id: 'ins-2',
    name: 'AXA Assurances Côte d\'Ivoire',
    coverageRate: 85,
    annualLimit: 8000000,
    plans: [
      {
        id: 'plan-2a',
        insuranceId: 'ins-2',
        name: 'AXA Santé Basic',
        coverageRate: 75,
        annualLimit: 2500000,
        limits: {
          consultation_generale: 600000,
          consultation_specialisee: 700000,
          actes_medicaux: 800000,
          pharmacie: 400000
        }
      },
      {
        id: 'plan-2b',
        insuranceId: 'ins-2',
        name: 'AXA Santé Plus',
        coverageRate: 85,
        annualLimit: 5000000,
        limits: {
          consultation_generale: 1000000,
          consultation_specialisee: 1500000,
          actes_medicaux: 2000000,
          pharmacie: 500000
        }
      }
    ]
  },
  {
    id: 'ins-3',
    name: 'Saham Assurance',
    coverageRate: 75,
    annualLimit: 4000000,
    plans: [
      {
        id: 'plan-3a',
        insuranceId: 'ins-3',
        name: 'Saham Famille',
        coverageRate: 70,
        annualLimit: 2000000,
        limits: {
          consultation_generale: 500000,
          consultation_specialisee: 500000,
          actes_medicaux: 600000,
          pharmacie: 400000
        }
      },
      {
        id: 'plan-3b',
        insuranceId: 'ins-3',
        name: 'Saham Entreprise',
        coverageRate: 80,
        annualLimit: 4000000,
        limits: {
          consultation_generale: 1000000,
          consultation_specialisee: 1200000,
          actes_medicaux: 1300000,
          pharmacie: 500000
        }
      }
    ]
  },
  {
    id: 'ins-4',
    name: 'Allianz Côte d\'Ivoire',
    coverageRate: 90,
    annualLimit: 10000000,
    plans: [
      {
        id: 'plan-4a',
        insuranceId: 'ins-4',
        name: 'Allianz Gold',
        coverageRate: 90,
        annualLimit: 7000000,
        limits: {
          consultation_generale: 1500000,
          consultation_specialisee: 2000000,
          actes_medicaux: 2500000,
          pharmacie: 1000000
        }
      },
      {
        id: 'plan-4b',
        insuranceId: 'ins-4',
        name: 'Allianz Platinum',
        coverageRate: 95,
        annualLimit: 10000000,
        limits: {
          consultation_generale: 2000000,
          consultation_specialisee: 3000000,
          actes_medicaux: 4000000,
          pharmacie: 1000000
        }
      }
    ]
  }
];

// Données mock des patients avec leurs souscriptions
export const MOCK_PATIENTS: MockPatient[] = [
  {
    id: 'patient-1',
    firstName: 'Aminata',
    lastName: 'Koné',
    phone: '+225 07 12 34 56 78',
    email: 'aminata.kone@email.ci',
    dateOfBirth: '1985-03-15',
    insuranceId: 'ins-1',
    policyNumber: 'NSIA-2024-001234',
    planId: 'plan-1b'
  },
  {
    id: 'patient-2',
    firstName: 'Moussa',
    lastName: 'Diallo',
    phone: '+225 05 98 76 54 32',
    email: 'moussa.diallo@email.ci',
    dateOfBirth: '1978-08-22',
    insuranceId: 'ins-2',
    policyNumber: 'AXA-2024-005678',
    planId: 'plan-2b'
  },
  {
    id: 'patient-3',
    firstName: 'Fatou',
    lastName: 'Traoré',
    phone: '+225 01 45 67 89 12',
    email: 'fatou.traore@email.ci',
    dateOfBirth: '1992-11-08',
    insuranceId: 'ins-3',
    policyNumber: 'SAH-2024-009012',
    planId: 'plan-3a'
  },
  {
    id: 'patient-4',
    firstName: 'Ibrahim',
    lastName: 'Ouattara',
    phone: '+225 07 65 43 21 09',
    email: 'ibrahim.ouattara@email.ci',
    dateOfBirth: '1965-05-30',
    insuranceId: 'ins-4',
    policyNumber: 'ALZ-2024-003456',
    planId: 'plan-4a'
  },
  {
    id: 'patient-5',
    firstName: 'Awa',
    lastName: 'Coulibaly',
    phone: '+225 05 11 22 33 44',
    email: 'awa.coulibaly@email.ci',
    dateOfBirth: '1990-01-20'
    // Pas d'assurance
  },
  {
    id: 'patient-6',
    firstName: 'Seydou',
    lastName: 'Bakayoko',
    phone: '+225 01 99 88 77 66',
    email: 'seydou.bakayoko@email.ci',
    dateOfBirth: '1988-07-14',
    insuranceId: 'ins-1',
    policyNumber: 'NSIA-2024-007890',
    planId: 'plan-1c'
  }
];

// Consommations mock des patients
export const MOCK_CONSUMPTIONS: MockPatientConsumption[] = [
  {
    patientId: 'patient-1',
    year: 2024,
    consumption: {
      consultation_generale: { consumed: 120000, covered: 96000 },
      consultation_specialisee: { consumed: 75000, covered: 60000 },
      actes_medicaux: { consumed: 250000, covered: 200000 },
      pharmacie: { consumed: 45000, covered: 36000 }
    }
  },
  {
    patientId: 'patient-2',
    year: 2024,
    consumption: {
      consultation_generale: { consumed: 200000, covered: 170000 },
      consultation_specialisee: { consumed: 350000, covered: 297500 },
      actes_medicaux: { consumed: 1500000, covered: 1275000 },
      pharmacie: { consumed: 120000, covered: 102000 }
    }
  },
  {
    patientId: 'patient-3',
    year: 2024,
    consumption: {
      consultation_generale: { consumed: 450000, covered: 315000 },
      consultation_specialisee: { consumed: 480000, covered: 336000 },
      actes_medicaux: { consumed: 100000, covered: 70000 },
      pharmacie: { consumed: 350000, covered: 245000 }
    }
  },
  {
    patientId: 'patient-4',
    year: 2024,
    consumption: {
      consultation_generale: { consumed: 300000, covered: 270000 },
      consultation_specialisee: { consumed: 600000, covered: 540000 },
      actes_medicaux: { consumed: 800000, covered: 720000 },
      pharmacie: { consumed: 200000, covered: 180000 }
    }
  },
  {
    patientId: 'patient-6',
    year: 2024,
    consumption: {
      consultation_generale: { consumed: 1100000, covered: 990000 },
      consultation_specialisee: { consumed: 800000, covered: 720000 },
      actes_medicaux: { consumed: 500000, covered: 450000 },
      pharmacie: { consumed: 400000, covered: 360000 }
    }
  }
];

// Demandes d'autorisation mock
export const MOCK_AUTH_REQUESTS: MockAuthorizationRequest[] = [
  {
    id: 'auth-1',
    patientId: 'patient-3',
    careType: 'consultation_generale',
    requestedAmount: 150000,
    careDescription: 'Consultation de suivi diabète + bilan sanguin complet',
    status: 'pending',
    requestedAt: '2024-12-18T10:30:00Z'
  },
  {
    id: 'auth-2',
    patientId: 'patient-6',
    careType: 'consultation_generale',
    requestedAmount: 100000,
    careDescription: 'Consultation généraliste - Symptômes grippaux',
    status: 'approved',
    approvedAmount: 90000,
    requestedAt: '2024-12-15T14:20:00Z',
    respondedAt: '2024-12-16T09:00:00Z',
    validityDate: '2024-12-31'
  },
  {
    id: 'auth-3',
    patientId: 'patient-2',
    careType: 'actes_medicaux',
    requestedAmount: 800000,
    careDescription: 'IRM cérébrale - Investigation migraine chronique',
    status: 'approved',
    approvedAmount: 680000,
    requestedAt: '2024-12-10T08:45:00Z',
    respondedAt: '2024-12-11T16:30:00Z',
    validityDate: '2025-01-10'
  },
  {
    id: 'auth-4',
    patientId: 'patient-1',
    careType: 'pharmacie',
    requestedAmount: 250000,
    careDescription: 'Traitement antibiotique prolongé - Infection respiratoire',
    status: 'rejected',
    rejectionReason: 'Montant dépassant le plafond restant. Veuillez soumettre une demande pour le montant restant disponible (180 000 FCFA)',
    requestedAt: '2024-12-12T11:15:00Z',
    respondedAt: '2024-12-13T10:00:00Z'
  }
];

// Hook principal pour utiliser les données mock
export function useMockInsuranceData() {
  const [patients] = useState<MockPatient[]>(MOCK_PATIENTS);
  const [insurances] = useState<MockInsurance[]>(MOCK_INSURANCES);
  const [consumptions, setConsumptions] = useState<MockPatientConsumption[]>(MOCK_CONSUMPTIONS);
  const [authRequests, setAuthRequests] = useState<MockAuthorizationRequest[]>(MOCK_AUTH_REQUESTS);

  // Récupérer un patient par ID
  const getPatient = (patientId: string) => {
    return patients.find(p => p.id === patientId);
  };

  // Récupérer la mutuelle d'un patient
  const getPatientInsurance = (patientId: string) => {
    const patient = getPatient(patientId);
    if (!patient?.insuranceId) return null;

    const insurance = insurances.find(i => i.id === patient.insuranceId);
    if (!insurance) return null;

    const plan = insurance.plans.find(p => p.id === patient.planId);

    return {
      insurance,
      plan,
      policyNumber: patient.policyNumber
    };
  };

  // Récupérer la consommation d'un patient
  const getPatientConsumption = (patientId: string) => {
    return consumptions.find(c => c.patientId === patientId);
  };

  // Calculer le statut de couverture complet d'un patient
  const getPatientCoverageStatus = (patientId: string) => {
    const insuranceData = getPatientInsurance(patientId);
    if (!insuranceData) return null;

    const { insurance, plan } = insuranceData;
    const consumption = getPatientConsumption(patientId);
    const limits = plan?.limits || {
      consultation_generale: insurance.annualLimit * 0.25,
      consultation_specialisee: insurance.annualLimit * 0.30,
      actes_medicaux: insurance.annualLimit * 0.35,
      pharmacie: insurance.annualLimit * 0.10
    };

    const careTypes = ['consultation_generale', 'consultation_specialisee', 'actes_medicaux', 'pharmacie'] as const;
    
    const consumptionByType = careTypes.map(careType => {
      const limit = limits[careType];
      const consumed = consumption?.consumption[careType]?.consumed || 0;
      const covered = consumption?.consumption[careType]?.covered || 0;
      const remaining = Math.max(0, limit - covered);
      
      return {
        care_type: careType,
        consumed,
        covered,
        limit,
        remaining,
        percentUsed: limit > 0 ? (covered / limit) * 100 : 0
      };
    });

    const totalConsumed = consumptionByType.reduce((sum, c) => sum + c.consumed, 0);
    const totalCovered = consumptionByType.reduce((sum, c) => sum + c.covered, 0);
    const overallLimit = plan?.annualLimit || insurance.annualLimit;

    return {
      patientId,
      insuranceName: insurance.name,
      planName: plan?.name || 'Formule Standard',
      coverageRate: plan?.coverageRate || insurance.coverageRate,
      annualLimit: overallLimit,
      policyNumber: insuranceData.policyNumber,
      consumptionByType,
      totalConsumed,
      totalCovered,
      overallRemaining: Math.max(0, overallLimit - totalCovered)
    };
  };

  // Récupérer les demandes d'autorisation d'un patient
  const getPatientAuthRequests = (patientId: string) => {
    return authRequests.filter(r => r.patientId === patientId);
  };

  // Récupérer toutes les demandes en attente (pour l'agent assureur)
  const getPendingAuthRequests = () => {
    return authRequests.filter(r => r.status === 'pending');
  };

  // Ajouter une demande d'autorisation
  const addAuthRequest = (request: Omit<MockAuthorizationRequest, 'id' | 'status' | 'requestedAt'>) => {
    const newRequest: MockAuthorizationRequest = {
      ...request,
      id: `auth-${Date.now()}`,
      status: 'pending',
      requestedAt: new Date().toISOString()
    };
    setAuthRequests(prev => [...prev, newRequest]);
    return newRequest;
  };

  // Répondre à une demande (approve/reject)
  const respondToAuthRequest = (
    requestId: string, 
    status: 'approved' | 'rejected',
    options?: { approvedAmount?: number; rejectionReason?: string; validityDate?: string }
  ) => {
    setAuthRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        return {
          ...r,
          status,
          approvedAmount: options?.approvedAmount,
          rejectionReason: options?.rejectionReason,
          validityDate: options?.validityDate,
          respondedAt: new Date().toISOString()
        };
      }
      return r;
    }));
  };

  return {
    patients,
    insurances,
    getPatient,
    getPatientInsurance,
    getPatientConsumption,
    getPatientCoverageStatus,
    getPatientAuthRequests,
    getPendingAuthRequests,
    addAuthRequest,
    respondToAuthRequest,
    authRequests
  };
}

// Fonction utilitaire pour récupérer l'assurance d'un patient (sans hook)
export function getPatientInsuranceData(patientId: string) {
  const patient = MOCK_PATIENTS.find(p => p.id === patientId);
  if (!patient?.insuranceId) return null;

  const insurance = MOCK_INSURANCES.find(i => i.id === patient.insuranceId);
  if (!insurance) return null;

  const plan = insurance.plans.find(p => p.id === patient.planId);

  return {
    insurance,
    plan,
    policyNumber: patient.policyNumber
  };
}

// Hook simplifié pour la liste des patients avec recherche
export function useMockPatientSearch() {
  const searchPatients = (query: string): MockPatient[] => {
    if (!query || query.length < 2) return [];
    
    const lowerQuery = query.toLowerCase();
    return MOCK_PATIENTS.filter(p => 
      p.firstName.toLowerCase().includes(lowerQuery) ||
      p.lastName.toLowerCase().includes(lowerQuery) ||
      p.phone.includes(query)
    );
  };

  const getPatientInsurance = (patientId: string) => {
    return getPatientInsuranceData(patientId);
  };

  return { patients: MOCK_PATIENTS, searchPatients, getPatientInsurance };
}
