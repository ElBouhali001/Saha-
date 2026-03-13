
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '@/types/user';
import { hashPassword, verifyPassword, secureStorage, generateSecureToken } from '@/utils/security';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: Partial<User>, password: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Utilisateurs avec mots de passe hachés (simulation base de données)
const mockUsers: Array<User & { passwordHash: string }> = [
  {
    id: '1',
    email: 'admin@medipatient.com',
    passwordHash: hashPassword('admin123'),
    firstName: 'Admin',
    lastName: 'Structure',
    role: 'admin',
    structureId: 'struct-1',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    email: 'dr.kouame@medipatient.com', 
    passwordHash: hashPassword('doctor123'),
    firstName: 'Dr. Kouamé',
    lastName: 'Adjoua',
    role: 'doctor',
    speciality: 'Médecine Générale',
    structureId: 'struct-1',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    email: 'agent@medipatient.com',
    passwordHash: hashPassword('agent123'), 
    firstName: 'Marie',
    lastName: 'Traoré',
    role: 'agent',
    structureId: 'struct-1',
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    email: 'patient@medipatient.com',
    passwordHash: hashPassword('patient123'),
    firstName: 'Jean',
    lastName: 'Koné',
    role: 'patient',
    phone: '+225-01-02-03-04',
    createdAt: new Date().toISOString(),
  },
  {
    id: '5',
    email: 'labo@medipatient.com',
    passwordHash: hashPassword('labo123'),
    firstName: 'Sophie',
    lastName: 'Diabaté',
    role: 'lab_technician',
    structureType: 'laboratory',
    structureId: 'lab-1',
    phone: '+225-05-06-07-08',
    createdAt: new Date().toISOString(),
  },
  {
    id: '6',
    email: 'pharmacien@medipatient.com',
    passwordHash: hashPassword('pharma123'),
    firstName: 'Ahmed',
    lastName: 'Touré',
    role: 'pharmacist',
    structureType: 'pharmacy',
    structureId: 'pharma-1',
    phone: '+225-09-10-11-12',
    createdAt: new Date().toISOString(),
  },
  {
    id: '7',
    email: 'assurance@medipatient.com',
    passwordHash: hashPassword('assurance123'),
    firstName: 'Fatou',
    lastName: 'Sangaré',
    role: 'insurance_agent',
    structureType: 'insurance',
    structureId: 'ins-1',
    phone: '+225-13-14-15-16',
    createdAt: new Date().toISOString(),
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    // Vérification de session sécurisée
    const storedUser = secureStorage.getItem('medipatient_user');
    const storedToken = secureStorage.getItem('medipatient_token');
    
    if (storedUser && storedToken) {
      try {
        const user = JSON.parse(storedUser);
        const tokenData = JSON.parse(storedToken);
        
        // Vérifier l'expiration du token
        const isExpired = Date.now() > tokenData.expiresAt;
        
        if (!isExpired) {
          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          // Token expiré, nettoyer le stockage
          secureStorage.removeItem('medipatient_user');
          secureStorage.removeItem('medipatient_token');
          setAuthState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de session:', error);
        secureStorage.removeItem('medipatient_user');
        secureStorage.removeItem('medipatient_token');
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    // Simulation délai API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = mockUsers.find(u => u.email === email);
    
    if (user && verifyPassword(password, user.passwordHash)) {
      const { passwordHash: _, ...userWithoutPassword } = user;
      
      // Créer un token de session avec expiration
      const token = {
        value: generateSecureToken(),
        expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24h
        userId: user.id
      };
      
      // Stockage sécurisé
      secureStorage.setItem('medipatient_user', JSON.stringify(userWithoutPassword));
      secureStorage.setItem('medipatient_token', JSON.stringify(token));
      
      // Audit log
      console.log(`[AUDIT] Connexion réussie - User: ${user.email} - Time: ${new Date().toISOString()}`);
      
      setAuthState({
        user: userWithoutPassword,
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    } else {
      // Audit log pour tentative échouée
      console.log(`[AUDIT] Tentative de connexion échouée - Email: ${email} - Time: ${new Date().toISOString()}`);
      
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  };

  const logout = () => {
    // Audit log
    console.log(`[AUDIT] Déconnexion - User: ${authState.user?.email} - Time: ${new Date().toISOString()}`);
    
    secureStorage.removeItem('medipatient_user');
    secureStorage.removeItem('medipatient_token');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const register = async (userData: Partial<User>, password: string): Promise<boolean> => {
    // Implémentation future avec validation et hachage
    console.log('Tentative d\'inscription:', userData);
    return false;
  };

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      logout,
      register,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
