// Gestion sécurisée du token JWT
const TOKEN_KEY = 'medipatient_jwt_token';
const USER_KEY = 'medipatient_user';
const EXPIRES_AT_KEY = 'medipatient_expires_at';

export interface StoredUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
}

export const tokenStorage = {
  // Sauvegarder le token
  setToken: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  // Récupérer le token
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  // Supprimer le token
  removeToken: (): void => {
    localStorage.removeItem(TOKEN_KEY);
  },

  // Sauvegarder l'utilisateur
  setUser: (user: StoredUser): void => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  // Récupérer l'utilisateur
  getUser: (): StoredUser | null => {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  // Supprimer l'utilisateur
  removeUser: (): void => {
    localStorage.removeItem(USER_KEY);
  },

  // Sauvegarder la date d'expiration
  setExpiresAt: (expiresAt: string): void => {
    localStorage.setItem(EXPIRES_AT_KEY, expiresAt);
  },

  // Vérifier si le token est expiré
  isTokenExpired: (): boolean => {
    const expiresAt = localStorage.getItem(EXPIRES_AT_KEY);
    if (!expiresAt) return true;
    return new Date(expiresAt) < new Date();
  },

  // Nettoyer toutes les données d'authentification
  clearAuth: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(EXPIRES_AT_KEY);
  },

  // Vérifier si l'utilisateur est authentifié
  isAuthenticated: (): boolean => {
    const token = tokenStorage.getToken();
    return !!token && !tokenStorage.isTokenExpired();
  },
};
