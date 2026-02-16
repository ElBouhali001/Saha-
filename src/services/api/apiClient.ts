import { API_CONFIG } from './config';
import { tokenStorage } from './tokenStorage';

// Types pour les réponses API
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

// Classe pour les erreurs API
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

// Client API avec gestion automatique du token JWT
class ApiClient {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  // Construire les headers avec le token JWT
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      ...API_CONFIG.HEADERS,
    };

    const token = tokenStorage.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  // Gérer les erreurs de réponse
  private async handleResponse<T>(response: Response): Promise<T> {
    if (response.status === 401) {
      // Token expiré ou invalide - déconnecter l'utilisateur
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
      } catch {
        // Ignorer les erreurs de parsing JSON
      }

      throw new ApiException(errorMessage, response.status, errors);
    }

    // Si la réponse est vide (204 No Content)
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // Requête GET
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    let url = `${this.baseUrl}${endpoint}`;
    
    if (params) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method: 'GET',
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

  // Requête POST
  async post<T>(endpoint: string, data?: unknown): Promise<T> {
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

  // Requête PUT
  async put<T>(endpoint: string, data?: unknown): Promise<T> {
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

  // Requête DELETE
  async delete<T>(endpoint: string): Promise<T> {
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

  // Requête PATCH
  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
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

// Instance unique du client API
export const apiClient = new ApiClient();
