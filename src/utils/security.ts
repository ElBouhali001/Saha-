
import CryptoJS from 'crypto-js';
import { supabase } from '@/integrations/supabase/client';

// DEPRECATED: Client-side encryption removed for security
// All encryption now handled server-side via secure Edge Functions
const showDeprecationWarning = () => {
  console.warn('⚠️ Client-side encryption is deprecated. Use server-side encryption service.');
};

export interface SecurityUtils {
  hashPassword: (password: string) => string;
  verifyPassword: (password: string, hash: string) => boolean;
  encryptData: (data: string) => string;
  decryptData: (encryptedData: string) => string;
  generateSecureToken: () => string;
  generateSecureTicket: () => string;
  isTokenExpired: (token: string) => boolean;
}

// Hachage sécurisé des mots de passe
export const hashPassword = (password: string): string => {
  const salt = CryptoJS.lib.WordArray.random(128/8);
  const hash = CryptoJS.PBKDF2(password, salt, {
    keySize: 256/32,
    iterations: 10000
  });
  return salt.toString() + ':' + hash.toString();
};

// Vérification des mots de passe
export const verifyPassword = (password: string, hash: string): boolean => {
  try {
    const [salt, originalHash] = hash.split(':');
    const testHash = CryptoJS.PBKDF2(password, CryptoJS.enc.Hex.parse(salt), {
      keySize: 256/32,
      iterations: 10000
    });
    return testHash.toString() === originalHash;
  } catch (error) {
    return false;
  }
};

// Secure server-side encryption via Edge Function
export const encryptData = async (data: string): Promise<string> => {
  showDeprecationWarning();
  
  try {
    const { data: result, error } = await supabase.functions.invoke('secure-data-handler', {
      body: { action: 'encrypt', data }
    });

    if (error) throw error;
    return result.encrypted;
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt data securely');
  }
};

// Secure server-side decryption via Edge Function  
export const decryptData = async (encryptedData: string): Promise<string> => {
  showDeprecationWarning();
  
  try {
    const { data: result, error } = await supabase.functions.invoke('secure-data-handler', {
      body: { action: 'decrypt', encryptedData }
    });

    if (error) throw error;
    return result.decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    return '';
  }
};

// Génération de tokens sécurisés
export const generateSecureToken = (): string => {
  const timestamp = Date.now().toString();
  const random = CryptoJS.lib.WordArray.random(128/8).toString();
  return CryptoJS.SHA256(timestamp + random).toString();
};

// Génération de codes tickets sécurisés
export const generateSecureTicket = (): string => {
  const prefix = 'TK';
  const timestamp = Date.now().toString(36);
  const random = CryptoJS.lib.WordArray.random(64/8).toString().substring(0, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

// Vérification d'expiration des tokens (24h) - simplified for security
export const isTokenExpired = (token: string): boolean => {
  try {
    // Simplified token validation without decryption for security
    // In production, implement proper JWT validation
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    
    const payload = JSON.parse(atob(parts[1]));
    const expirationTime = payload.exp ? payload.exp * 1000 : payload.timestamp + (24 * 60 * 60 * 1000);
    return Date.now() > expirationTime;
  } catch (error) {
    return true;
  }
};

// Secure session storage (no longer uses client-side encryption)
export const secureStorage = {
  setItem: (key: string, value: string) => {
    // Store directly without client-side encryption for non-sensitive data
    // For sensitive data, use server-side encryption via Edge Functions
    console.warn('⚠️ Use server-side encryption for sensitive data');
    sessionStorage.setItem(key, value);
  },
  
  getItem: (key: string): string | null => {
    return sessionStorage.getItem(key);
  },
  
  removeItem: (key: string) => {
    sessionStorage.removeItem(key);
  }
};
