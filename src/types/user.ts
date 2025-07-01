
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'doctor' | 'agent' | 'patient' | 'lab_technician' | 'pharmacist' | 'insurance_agent';
  phone?: string;
  structureType?: 'medical_center' | 'laboratory' | 'pharmacy' | 'insurance';
  structureId?: string;
  speciality?: string; // For doctors
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'doctor' | 'agent' | 'patient' | 'lab_technician' | 'pharmacist' | 'insurance_agent';
  structure_type?: 'medical_center' | 'laboratory' | 'pharmacy' | 'insurance';
  created_at: string;
  updated_at: string;
}
