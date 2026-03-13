import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService, StoredUser } from '@/services/api';
import { IS_DEMO } from '@/config/app';

interface BackendAuthContextType {
  user: StoredUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const BackendAuthContext = createContext<BackendAuthContextType | undefined>(undefined);

// Demo users pour le mode démo (identiques à SupabaseAuthContext)
const demoUsers: StoredUser[] = [
  { id: '1', email: 'admin@medipatient.com', firstName: 'Admin', lastName: 'Structure', role: 'admin' },
  { id: '2', email: 'dr.kouame@medipatient.com', firstName: 'Dr. Kouamé', lastName: 'Adjoua', role: 'admin' },
  { id: '3', email: 'agent@medipatient.com', firstName: 'Marie', lastName: 'Traoré', role: 'agent' },
  { id: '4', email: 'patient@medipatient.com', firstName: 'Jean', lastName: 'Koné', role: 'patient' },
  { id: '5', email: 'labo@medipatient.com', firstName: 'Sophie', lastName: 'Diabaté', role: 'lab_technician' },
  { id: '6', email: 'pharmacien@medipatient.com', firstName: 'Ahmed', lastName: 'Touré', role: 'pharmacist' },
  { id: '7', email: 'assurance@medipatient.com', firstName: 'Fatou', lastName: 'Sangaré', role: 'insurance_agent' },
  { id: '8', email: 'cardio.dubois@medipatient.com', firstName: 'Marie', lastName: 'Dubois', role: 'doctor' },
  { id: '9', email: 'dermato.moreau@medipatient.com', firstName: 'Pierre', lastName: 'Moreau', role: 'doctor' },
  { id: '10', email: 'pediatre.lemaire@medipatient.com', firstName: 'Sophie', lastName: 'Lemaire', role: 'doctor' },
  { id: '11', email: 'gyneco.bernard@medipatient.com', firstName: 'Claire', lastName: 'Bernard', role: 'doctor' },
  { id: '12', email: 'neuro.rousseau@medipatient.com', firstName: 'Julien', lastName: 'Rousseau', role: 'doctor' },
  { id: '13', email: 'ortho.girard@medipatient.com', firstName: 'Luc', lastName: 'Girard', role: 'doctor' },
  { id: '14', email: 'ophtalmo.leroy@medipatient.com', firstName: 'Anne', lastName: 'Leroy', role: 'doctor' },
  { id: '15', email: 'dentiste.demo@medipatient.com', firstName: 'Aïcha', lastName: 'Diallo', role: 'doctor' },
  { id: '16', email: 'admin.demo@medipatient.com', firstName: 'Admin', lastName: 'Demo', role: 'admin' },
];

export const BackendAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialiser l'état depuis le stockage local
  useEffect(() => {
    const initAuth = async () => {
      if (IS_DEMO) {
        // Mode démo : vérifier si un utilisateur est stocké localement
        const storedUser = authService.getStoredUser();
        if (storedUser) {
          setUser(storedUser);
        }
        setIsLoading(false);
        return;
      }

      // Mode production : vérifier le token et récupérer l'utilisateur
      if (authService.isAuthenticated()) {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // Connexion
  const signIn = useCallback(async (email: string, password: string): Promise<{ error: any }> => {
    setIsLoading(true);

    try {
      if (IS_DEMO) {
        // Mode démo : vérifier contre les utilisateurs démo
        const demoUser = demoUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
        
        if (demoUser) {
          // Simuler un délai de connexion
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Stocker l'utilisateur localement
          localStorage.setItem('medipatient_user', JSON.stringify(demoUser));
          setUser(demoUser);
          setIsLoading(false);
          return { error: null };
        } else {
          setIsLoading(false);
          return { error: { message: 'Email ou mot de passe incorrect' } };
        }
      }

      // Mode production : appeler le backend
      const result = await authService.login(email, password);
      
      if (result.success && result.user) {
        setUser(result.user);
        setIsLoading(false);
        return { error: null };
      } else {
        setIsLoading(false);
        return { error: { message: result.error || 'Échec de la connexion' } };
      }
    } catch (error) {
      setIsLoading(false);
      return { error: { message: 'Erreur lors de la connexion' } };
    }
  }, []);

  // Déconnexion
  const signOut = useCallback(async (): Promise<void> => {
    setIsLoading(true);

    if (IS_DEMO) {
      // Mode démo : juste nettoyer le stockage local
      localStorage.removeItem('medipatient_user');
      setUser(null);
      setIsLoading(false);
      return;
    }

    // Mode production : appeler le backend et nettoyer
    await authService.logout();
    setUser(null);
    setIsLoading(false);
  }, []);

  // Rafraîchir les données utilisateur
  const refreshUser = useCallback(async (): Promise<void> => {
    if (IS_DEMO) return;

    if (authService.isAuthenticated()) {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    }
  }, []);

  const value: BackendAuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    signIn,
    signOut,
    refreshUser,
  };

  return (
    <BackendAuthContext.Provider value={value}>
      {children}
    </BackendAuthContext.Provider>
  );
};

export const useBackendAuth = (): BackendAuthContextType => {
  const context = useContext(BackendAuthContext);
  if (context === undefined) {
    throw new Error('useBackendAuth must be used within a BackendAuthProvider');
  }
  return context;
};
