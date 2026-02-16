import { apiClient, ApiException } from './apiClient';
import { tokenStorage, StoredUser } from './tokenStorage';
import { API_ENDPOINTS } from './config';

// Types basés sur les DTOs du backend
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  role?: 'PATIENT' | 'DOCTOR';
}

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

export interface LoginResponse {
  sessionId: string;
  user: ProfileDto;
  expiresAt: string;
  rememberMe: boolean;
  message: string;
  ipAddress?: string;
  loginTime: string;
}

export interface AuthResult {
  success: boolean;
  user?: StoredUser;
  error?: string;
}

// Service d'authentification
export const authService = {
  // Connexion
  login: async (email: string, password: string): Promise<AuthResult> => {
    try {
      const response = await apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, {
        email,
        password,
      } as LoginRequest);

      // Stocker le token (sessionId contient le JWT)
      tokenStorage.setToken(response.sessionId);
      tokenStorage.setExpiresAt(response.expiresAt);

      // Stocker les informations utilisateur
      // Le backend renvoie le rôle en majuscules (ADMIN), le frontend attend des minuscules (admin)
      const user: StoredUser = {
        id: response.user.id,
        email: response.user.email,
        firstName: response.user.firstName,
        lastName: response.user.lastName,
        role: response.user.role.toLowerCase(),
        phone: response.user.phone,
      };
      tokenStorage.setUser(user);

      return { success: true, user };
    } catch (error) {
      if (error instanceof ApiException) {
        return { success: false, error: error.message };
      }
      return { success: false, error: 'Erreur de connexion' };
    }
  },

  // Inscription patient
  register: async (data: RegisterRequest): Promise<AuthResult> => {
    try {
      const response = await apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH.REGISTER, data);

      // Stocker le token (sessionId contient le JWT)
      tokenStorage.setToken(response.sessionId);
      tokenStorage.setExpiresAt(response.expiresAt);

      // Stocker les informations utilisateur
      // Le backend renvoie le rôle en majuscules (ADMIN), le frontend attend des minuscules (admin)
      const user: StoredUser = {
        id: response.user.id,
        email: response.user.email,
        firstName: response.user.firstName,
        lastName: response.user.lastName,
        role: response.user.role.toLowerCase(),
        phone: response.user.phone,
      };
      tokenStorage.setUser(user);

      return { success: true, user };
    } catch (error) {
      if (error instanceof ApiException) {
        return { success: false, error: error.message };
      }
      return { success: false, error: "Erreur lors de l'inscription" };
    }
  },

  // Déconnexion
  logout: async (): Promise<void> => {
    try {
      // Appel au backend pour notifier la déconnexion
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch {
      // Ignorer les erreurs - on déconnecte quand même côté client
    } finally {
      // Nettoyer le stockage local
      tokenStorage.clearAuth();
    }
  },

  // Récupérer l'utilisateur courant depuis le backend
  getCurrentUser: async (): Promise<StoredUser | null> => {
    try {
      const response = await apiClient.get<ProfileDto>(API_ENDPOINTS.AUTH.ME);
      
      // Le backend renvoie le rôle en majuscules (ADMIN), le frontend attend des minuscules (admin)
      const user: StoredUser = {
        id: response.id,
        email: response.email,
        firstName: response.firstName,
        lastName: response.lastName,
        role: response.role.toLowerCase(),
        phone: response.phone,
      };
      
      // Mettre à jour le stockage local
      tokenStorage.setUser(user);
      
      return user;
    } catch {
      return null;
    }
  },

  // Récupérer l'utilisateur depuis le stockage local
  getStoredUser: (): StoredUser | null => {
    return tokenStorage.getUser();
  },

  // Vérifier si l'utilisateur est authentifié
  isAuthenticated: (): boolean => {
    return tokenStorage.isAuthenticated();
  },

  // Récupérer le token
  getToken: (): string | null => {
    return tokenStorage.getToken();
  },
};
