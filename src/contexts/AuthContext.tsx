
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '@/types/user';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: Partial<User>, password: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for development
const mockUsers: Array<User & { password: string }> = [
  {
    id: '1',
    email: 'admin@medipatient.com',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'Structure',
    role: 'admin',
    structureId: 'struct-1',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    email: 'dr.kouame@medipatient.com', 
    password: 'doctor123',
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
    password: 'agent123', 
    firstName: 'Marie',
    lastName: 'Traoré',
    role: 'agent',
    structureId: 'struct-1',
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    email: 'patient@medipatient.com',
    password: 'patient123',
    firstName: 'Jean',
    lastName: 'Koné',
    role: 'patient',
    phone: '+225-01-02-03-04',
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
    // Check for stored user session
    const storedUser = localStorage.getItem('medipatient_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('medipatient_user');
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = mockUsers.find(u => u.email === email && u.password === password);
    
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      localStorage.setItem('medipatient_user', JSON.stringify(userWithoutPassword));
      setAuthState({
        user: userWithoutPassword,
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('medipatient_user');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const register = async (userData: Partial<User>, password: string): Promise<boolean> => {
    // This would typically make an API call
    console.log('Register attempt:', userData);
    return false; // Not implemented for now
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
