import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { IS_DEMO } from '@/config/app';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, userData: { firstName: string, lastName: string }) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const SupabaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Demo users for offline/demo mode
  const demoUsers = IS_DEMO
    ? [
        { id: '1', email: 'admin@medipatient.com', first_name: 'Admin', last_name: 'Structure', role: 'admin' },
        { id: '2', email: 'dr.kouame@medipatient.com', first_name: 'Dr. Kouamé', last_name: 'Adjoua', role: 'doctor', speciality: 'Médecine Générale' },
        { id: '3', email: 'agent@medipatient.com', first_name: 'Marie', last_name: 'Traoré', role: 'agent' },
        { id: '4', email: 'patient@medipatient.com', first_name: 'Jean', last_name: 'Koné', role: 'patient' },
        { id: '5', email: 'labo@medipatient.com', first_name: 'Sophie', last_name: 'Diabaté', role: 'lab_technician' },
        { id: '6', email: 'pharmacien@medipatient.com', first_name: 'Ahmed', last_name: 'Touré', role: 'pharmacist' },
        { id: '7', email: 'assurance@medipatient.com', first_name: 'Fatou', last_name: 'Sangaré', role: 'insurance_agent' },
      ]
    : [];

  useEffect(() => {
    if (IS_DEMO) {
      // In demo mode, no remote session to fetch
      setIsLoading(false);
      return;
    }

    // Supabase live auth in normal mode
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    if (IS_DEMO) {
      setIsLoading(true);
      // Accept known demo combinations
      const validPasswords: Record<string, string> = {
        'admin@medipatient.com': 'admin123',
        'dr.kouame@medipatient.com': 'doctor123',
        'agent@medipatient.com': 'agent123',
        'patient@medipatient.com': 'patient123',
        'labo@medipatient.com': 'labo123',
        'pharmacien@medipatient.com': 'pharma123',
        'assurance@medipatient.com': 'assurance123',
      };

      const demo = demoUsers.find((u) => u.email === email);
      const ok = demo && validPasswords[email] === password;

      if (ok && demo) {
        const demoUser: User = ({
          id: demo.id,
          email: demo.email,
          phone: null,
          app_metadata: { provider: 'demo', providers: ['demo'] },
          user_metadata: {
            role: (demo as any).role,
            first_name: (demo as any).first_name,
            last_name: (demo as any).last_name,
            speciality: (demo as any).speciality,
          },
          aud: 'authenticated',
          created_at: new Date().toISOString(),
          identities: [],
          confirmed_at: new Date().toISOString(),
          email_confirmed_at: new Date().toISOString(),
          last_sign_in_at: new Date().toISOString(),
          factors: [],
        } as unknown) as User;

        setUser(demoUser);
        setSession(null);
        setIsLoading(false);
        return { error: null };
      }

      setIsLoading(false);
      return { error: { message: 'Identifiants démo invalides' } };
    }

    // Normal Supabase sign in
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setIsLoading(false);
    return { error };
  };

  const signUp = async (email: string, password: string, userData: { firstName: string; lastName: string }) => {
    if (IS_DEMO) {
      return { error: { message: 'Inscription désactivée en mode démo' } };
    }

    setIsLoading(true);
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { first_name: userData.firstName, last_name: userData.lastName },
      },
    });
    setIsLoading(false);
    return { error };
  };

  const signOut = async () => {
    if (IS_DEMO) {
      setUser(null);
      setSession(null);
      return;
    }
    setIsLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: !!user,
        isLoading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useSupabaseAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
};