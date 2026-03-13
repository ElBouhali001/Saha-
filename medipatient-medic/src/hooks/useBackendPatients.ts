import { useState, useEffect, useCallback } from 'react';
import { patientService, BackendPatient } from '@/services/api';

export interface UseBackendPatientsResult {
  patients: BackendPatient[];
  isLoading: boolean;
  error: string | null;
  total: number;
  refetch: () => Promise<void>;
  searchPatients: (query: string) => BackendPatient[];
  getPatientById: (id: string) => BackendPatient | undefined;
}

export const useBackendPatients = (): UseBackendPatientsResult => {
  const [patients, setPatients] = useState<BackendPatient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchPatients = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await patientService.getAll(0, 100);
      setPatients(result.patients);
      setTotal(result.total);
    } catch (err) {
      setError('Erreur lors du chargement des patients');
      console.error('Erreur:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const searchPatients = useCallback((query: string): BackendPatient[] => {
    if (!query.trim()) return patients;
    
    const lowerQuery = query.toLowerCase();
    return patients.filter(patient => 
      patient.firstName.toLowerCase().includes(lowerQuery) ||
      patient.lastName.toLowerCase().includes(lowerQuery) ||
      patient.email?.toLowerCase().includes(lowerQuery) ||
      patient.phone?.includes(query)
    );
  }, [patients]);

  const getPatientById = useCallback((id: string): BackendPatient | undefined => {
    return patients.find(p => p.id === id);
  }, [patients]);

  return {
    patients,
    isLoading,
    error,
    total,
    refetch: fetchPatients,
    searchPatients,
    getPatientById,
  };
};
