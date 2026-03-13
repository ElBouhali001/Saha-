// Configuration de l'API Backend
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:7080',
  TIMEOUT: 30000,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// Endpoints de l'API
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },
  PATIENTS: {
    LIST: '/patients',
    GET: (id: string) => `/patients/${id}`,
    CREATE: '/patients',
    UPDATE: (id: string) => `/patients/${id}`,
    DELETE: (id: string) => `/patients/${id}`,
  },
  APPOINTMENTS: {
    LIST: '/appointments',
    GET: (id: string) => `/appointments/${id}`,
    CREATE: '/appointments',
    UPDATE: (id: string) => `/appointments/${id}`,
    DELETE: (id: string) => `/appointments/${id}`,
  },
  PRESCRIPTIONS: {
    LIST: '/prescriptions',
    GET: (id: string) => `/prescriptions/${id}`,
    CREATE: '/prescriptions',
  },
  CONSULTATIONS: {
    LIST: '/consultations',
    GET: (id: string) => `/consultations/${id}`,
    CREATE: '/consultations',
  },
};
