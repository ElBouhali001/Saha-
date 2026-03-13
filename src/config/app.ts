// Master switch — set to true for showroom/demo mode
export const IS_DEMO = true;

// Auth mode — must be 'backend' when IS_DEMO is true
// (demo auth bypasses both Supabase and Spring Boot)
export const AUTH_MODE: 'supabase' | 'backend' = 'backend';

// URL du backend API (utilisé uniquement si AUTH_MODE === 'backend' && !IS_DEMO)
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:7080';

// Liens officiels des stores (à configurer lorsqu'ils seront disponibles)
export const APP_STORE_URL = 'https://apps.apple.com/app/idXXXXXXXXX';
export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=your.package.name';