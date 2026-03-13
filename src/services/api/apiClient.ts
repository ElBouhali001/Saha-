import { API_CONFIG } from './config';
import { tokenStorage } from './tokenStorage';
import { IS_DEMO } from '@/config/app';

// --- TYPES ---

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
}

export class ApiException extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiException';
    this.status = status;
    this.errors = errors;
  }
}

// --- MOCK DATA ENGINE ---

class ApiClient {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  private getMockData(endpoint: string): any {
    if (endpoint.includes('/doctors') || endpoint.includes('/medecins')) {
      return [
        { id: '18', firstName: 'Cheikh',  lastName: 'Diop',   speciality: 'Médecine Générale', consultationFee: 10000, currency: 'FCFA', availability: 'Disponible' },
        { id: '21', firstName: 'Marie',   lastName: 'Dubois', speciality: 'Cardiologie',        consultationFee: 25000, currency: 'FCFA', availability: 'Sur RDV' },
      ];
    }
    if (endpoint.includes('/appointments') || endpoint.includes('/rendez-vous')) {
      return [
        { id: '101', doctorName: 'Dr. Cheikh Diop', date: '2026-03-20', time: '10:00', type: 'Téléconsultation', status: 'Confirmé' },
      ];
    }
    if (endpoint.includes('/notifications')) {
      return [
        { id: 'n1', title: 'Rappel RDV',   message: 'Votre consultation avec Dr. Diop est demain à 10h.', read: false },
        { id: 'n2', title: 'Médicament',   message: 'Il est temps de prendre votre Paracétamol.',          read: false },
      ];
    }
    if (endpoint.includes('/prescriptions')) {
      return [
        { id: 'p1', medicationName: 'Paracétamol', dosage: '1g', frequency: '3x/jour', duration: '5 jours', doctorName: 'Dr. Diop', adherence: '95%' },
      ];
    }
    if (endpoint.includes('/analyses') || endpoint.includes('/medical-records') || endpoint.includes('/lab-tests')) {
      return { bloodType: 'O+', allergies: ['Pénicilline'], status: 'Dossier Complet' };
    }
    if (endpoint.includes('/specialities')) {
      return ['Médecine Générale', 'Cardiologie', 'Pédiatrie', 'Dermatologie'];
    }
    if (endpoint.includes('/profile')) {
      return { id: '17', firstName: 'Amadou', lastName: 'Fall', email: 'amadou.qa-test@email.com', role: 'patient' };
    }
    if (endpoint.includes('/payments')) {
      return { status: 'success', amount: 10000, currency: 'FCFA', method: 'Mobile Money' };
    }
    // Safe default — return empty array rather than undefined
    return [];
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = { ...API_CONFIG.HEADERS };
    const token = tokenStorage.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (response.status === 401) {
      tokenStorage.clearAuth();
      window.location.href = '/login';
      throw new ApiException('Session expirée, veuillez vous reconnecter', 401);
    }

    if (!response.ok) {
      let errorMessage = 'Une erreur est survenue';
      let errors: Record<string, string[]> | undefined;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
        errors = errorData.errors;
      } catch { }
      throw new ApiException(errorMessage, response.status, errors);
    }

    if (response.status === 204) return {} as T;

    return response.json();
  }

  // --- GET ---
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    if (IS_DEMO) return Promise.resolve(this.getMockData(endpoint) as T);

    let url = `${this.baseUrl}${endpoint}`;
    if (params) {
      url += `?${new URLSearchParams(params).toString()}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, { method: 'GET', headers: this.getHeaders(), signal: controller.signal });
      clearTimeout(timeoutId);
      return this.handleResponse<T>(response);
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof ApiException) throw error;
      throw new ApiException('Erreur de connexion au serveur', 0);
    }
  }

  // --- POST ---
  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    if (IS_DEMO) return Promise.resolve({ success: true } as unknown as T);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return this.handleResponse<T>(response);
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof ApiException) throw error;
      throw new ApiException('Erreur de connexion au serveur', 0);
    }
  }

  // --- PUT ---
  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    if (IS_DEMO) return Promise.resolve({ success: true } as unknown as T);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return this.handleResponse<T>(response);
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof ApiException) throw error;
      throw new ApiException('Erreur de connexion au serveur', 0);
    }
  }

  // --- DELETE ---
  async delete<T>(endpoint: string): Promise<T> {
    if (IS_DEMO) return Promise.resolve({ success: true } as unknown as T);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return this.handleResponse<T>(response);
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof ApiException) throw error;
      throw new ApiException('Erreur de connexion au serveur', 0);
    }
  }

  // --- PATCH ---
  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    if (IS_DEMO) return Promise.resolve({ success: true } as unknown as T);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return this.handleResponse<T>(response);
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof ApiException) throw error;
      throw new ApiException('Erreur de connexion au serveur', 0);
    }
  }
}

export const apiClient = new ApiClient();