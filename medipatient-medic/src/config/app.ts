export const IS_DEMO = false;

// Mode d'authentification : 'supabase' | 'backend'
// - 'supabase' : utilise Supabase Auth (par défaut, mode démo ou production Supabase)
// - 'backend' : utilise le backend Spring Boot avec JWT
export const AUTH_MODE: 'supabase' | 'backend' = 'backend';

// URL du backend API (utilisé uniquement si AUTH_MODE === 'backend')
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:7080';

// Liens officiels des stores (à configurer lorsqu'ils seront disponibles)
export const APP_STORE_URL = 'https://apps.apple.com/app/idXXXXXXXXX';
export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=your.package.name';

