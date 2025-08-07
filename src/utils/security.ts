
import CryptoJS from 'crypto-js';

// Clé de chiffrement - Utilise une clé générée de manière sécurisée
const getEncryptionKey = (): string => {
  // En production, cette clé devrait être générée de manière sécurisée et stockée de manière appropriée
  let key = localStorage.getItem('app_encryption_key');
  if (!key) {
    // Générer une nouvelle clé sécurisée
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    key = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    localStorage.setItem('app_encryption_key', key);
  }
  return key;
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

// Chiffrement des données sensibles
export const encryptData = (data: string): string => {
  return CryptoJS.AES.encrypt(data, getEncryptionKey()).toString();
};

// Déchiffrement des données
export const decryptData = (encryptedData: string): string => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, getEncryptionKey());
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
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

// Vérification d'expiration des tokens (24h)
export const isTokenExpired = (token: string): boolean => {
  try {
    const tokenData = JSON.parse(decryptData(token));
    const expirationTime = tokenData.timestamp + (24 * 60 * 60 * 1000); // 24h
    return Date.now() > expirationTime;
  } catch (error) {
    return true;
  }
};

// Stockage sécurisé dans localStorage
export const secureStorage = {
  setItem: (key: string, value: string) => {
    const encryptedValue = encryptData(value);
    localStorage.setItem(key, encryptedValue);
  },
  
  getItem: (key: string): string | null => {
    const encryptedValue = localStorage.getItem(key);
    if (!encryptedValue) return null;
    
    const decryptedValue = decryptData(encryptedValue);
    return decryptedValue || null;
  },
  
  removeItem: (key: string) => {
    localStorage.removeItem(key);
  }
};
