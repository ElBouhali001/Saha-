import { apiClient } from './apiClient';
import { API_ENDPOINTS } from './config';

// Types basés sur les DTOs du backend
export interface ProfileDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PatientDto {
  id: string;
  user: ProfileDto;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  bloodType?: string;
  allergies: string[];
  chronicConditions: string[];
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// Interface compatible avec le frontend existant (DemoPatient)
export interface BackendPatient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone?: string;
  address?: string;
  email?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  consultations: number;
  lastVisit: string;
  primaryDoctor?: string;
  insurance?: string;
  urgencyLevel?: 'low' | 'medium' | 'high';
  medicalHistory: any[];
  createdAt: string;
  updatedAt: string;
  // Champs additionnels du backend
  gender?: string;
  bloodType?: string;
  allergies?: string[];
  chronicConditions?: string[];
}

// Convertir PatientDto du backend vers le format frontend
const mapPatientDtoToBackendPatient = (dto: PatientDto): BackendPatient => {
  return {
    id: dto.id,
    firstName: dto.user.firstName,
    lastName: dto.user.lastName,
    dateOfBirth: dto.dateOfBirth,
    phone: dto.user.phone,
    email: dto.user.email,
    emergencyContact: dto.emergencyContactName ? {
      name: dto.emergencyContactName,
      phone: dto.emergencyContactPhone || '',
      relationship: dto.emergencyContactRelationship || '',
    } : undefined,
    consultations: 0, // À récupérer via un autre endpoint si nécessaire
    lastVisit: dto.updatedAt,
    primaryDoctor: undefined, // À récupérer via un autre endpoint si nécessaire
    insurance: undefined, // À récupérer via un autre endpoint si nécessaire
    urgencyLevel: 'low',
    medicalHistory: [],
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    gender: dto.gender?.toLowerCase(),
    bloodType: dto.bloodType,
    allergies: dto.allergies,
    chronicConditions: dto.chronicConditions,
  };
};

// Service de gestion des patients
export const patientService = {
  // Récupérer tous les patients
  getAll: async (page: number = 0, size: number = 100, search?: string): Promise<{ patients: BackendPatient[]; total: number }> => {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('size', size.toString());
      if (search) {
        params.append('search', search);
      }
      
      const response = await apiClient.get<PageResponse<PatientDto>>(
        `${API_ENDPOINTS.PATIENTS.LIST}?${params.toString()}`
      );
      
      return {
        patients: response.content.map(mapPatientDtoToBackendPatient),
        total: response.totalElements,
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des patients:', error);
      return { patients: [], total: 0 };
    }
  },

  // Récupérer un patient par ID
  getById: async (id: string): Promise<BackendPatient | null> => {
    try {
      const response = await apiClient.get<PatientDto>(API_ENDPOINTS.PATIENTS.GET(id));
      return mapPatientDtoToBackendPatient(response);
    } catch (error) {
      console.error('Erreur lors de la récupération du patient:', error);
      return null;
    }
  },

  // Rechercher des patients
  search: async (query: string): Promise<BackendPatient[]> => {
    try {
      const response = await apiClient.get<PageResponse<PatientDto>>(
        `${API_ENDPOINTS.PATIENTS.LIST}?search=${encodeURIComponent(query)}&size=50`
      );
      return response.content.map(mapPatientDtoToBackendPatient);
    } catch (error) {
      console.error('Erreur lors de la recherche des patients:', error);
      return [];
    }
  },
};
