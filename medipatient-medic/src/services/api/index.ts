export { apiClient, ApiException } from './apiClient';
export { authService } from './authService';
export { patientService } from './patientService';
export { tokenStorage } from './tokenStorage';
export { API_CONFIG, API_ENDPOINTS } from './config';
export type { StoredUser } from './tokenStorage';
export type { LoginRequest, LoginResponse, ProfileDto, AuthResult } from './authService';
export type { BackendPatient, PatientDto } from './patientService';
