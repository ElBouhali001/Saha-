import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { IS_DEMO, AUTH_MODE, API_BASE_URL } from '@/config/app';

// --- TYPES & INTERFACES ---

interface BackendUser {
    id: string;
    email: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    roles?: string[];
    role?: string;
    phone?: string;
}

interface AuthError {
    message: string;
}

interface AuthResponse {
    error: AuthError | null;
    data?: {
        user: User | null;
        session: Session | null;
    };
}

interface AuthContextType {
    user: User | null;
    session: Session | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    signIn: (email: string, password: string) => Promise<AuthResponse>;
    signUp: (email: string, password: string, firstName: string, lastName: string, phone?: string, role?: 'PATIENT' | 'DOCTOR') => Promise<AuthResponse>;
    signOut: () => Promise<void>;
}

// --- DEMO USERS ---

const DEMO_USERS = [
    { id: '1',  email: 'admin@medipatient.com',           password: 'password123', first_name: 'Admin',    last_name: 'Structure', role: 'admin' },
    { id: '2',  email: 'dr.kouame@medipatient.com',       password: 'password123', first_name: 'Dr. Kouamé', last_name: 'Adjoua',  role: 'admin',   speciality: 'Médecine Générale' },
    { id: '3',  email: 'agent@medipatient.com',           password: 'password123', first_name: 'Marie',    last_name: 'Traoré',   role: 'agent' },
    { id: '4',  email: 'patient@medipatient.com',         password: 'password123', first_name: 'Jean',     last_name: 'Koné',     role: 'patient' },
    { id: '5',  email: 'labo@medipatient.com',            password: 'password123', first_name: 'Sophie',   last_name: 'Diabaté',  role: 'lab_technician' },
    { id: '6',  email: 'pharmacien@medipatient.com',      password: 'password123', first_name: 'Ahmed',    last_name: 'Touré',    role: 'pharmacist' },
    { id: '7',  email: 'assurance@medipatient.com',       password: 'password123', first_name: 'Fatou',    last_name: 'Sangaré',  role: 'insurance_agent' },
    { id: '8',  email: 'cardio.dubois@medipatient.com',   password: 'password123', first_name: 'Marie',    last_name: 'Dubois',   role: 'doctor',  speciality: 'Cardiologie' },
    { id: '9',  email: 'dermato.moreau@medipatient.com',  password: 'password123', first_name: 'Pierre',   last_name: 'Moreau',   role: 'doctor',  speciality: 'Dermatologie' },
    { id: '10', email: 'pediatre.lemaire@medipatient.com',password: 'password123', first_name: 'Sophie',   last_name: 'Lemaire',  role: 'doctor',  speciality: 'Pédiatrie' },
    { id: '11', email: 'gyneco.bernard@medipatient.com',  password: 'password123', first_name: 'Claire',   last_name: 'Bernard',  role: 'doctor',  speciality: 'Gynécologie' },
    { id: '12', email: 'neuro.rousseau@medipatient.com',  password: 'password123', first_name: 'Julien',   last_name: 'Rousseau', role: 'doctor',  speciality: 'Neurologie' },
    { id: '13', email: 'ortho.girard@medipatient.com',    password: 'password123', first_name: 'Luc',      last_name: 'Girard',   role: 'doctor',  speciality: 'Orthopédie' },
    { id: '14', email: 'ophtalmo.leroy@medipatient.com',  password: 'password123', first_name: 'Anne',     last_name: 'Leroy',    role: 'doctor',  speciality: 'Ophtalmologie' },
    { id: '15', email: 'dentiste.demo@medipatient.com',   password: 'password123', first_name: 'Aïcha',    last_name: 'Diallo',   role: 'doctor',  speciality: 'Dentiste' },
    { id: '16', email: 'admin.demo@medipatient.com',      password: 'password123', first_name: 'Admin',    last_name: 'Demo',     role: 'admin' },
    // QA Test Users
    { id: '17', email: 'amadou.qa-test@email.com',        password: 'password123', first_name: 'Amadou',   last_name: 'Fall',     role: 'patient' },
    { id: '18', email: 'dr.diop@email.com',               password: 'password123', first_name: 'Cheikh',   last_name: 'Diop',     role: 'doctor',  speciality: 'Médecine Générale' },
];

// --- CONTEXT ---

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const SupabaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // --- HELPER: Convert any user shape into a Supabase-compatible User object ---
    const formatBackendUserToSupabase = (userData: BackendUser): User => {
        const userRole = userData.roles && userData.roles.length > 0
            ? userData.roles[0]
            : (userData.role || 'patient');

        return ({
            id: userData.id,
            email: userData.email,
            phone: userData.phone || '',
            app_metadata: { provider: AUTH_MODE, providers: [AUTH_MODE] },
            user_metadata: {
                role: userRole.toLowerCase(),
                first_name: userData.firstName || userData.username || 'Utilisateur',
                last_name: userData.lastName || '',
            },
            aud: 'authenticated',
            created_at: new Date().toISOString(),
            identities: [],
            factors: [],
            last_sign_in_at: new Date().toISOString(),
            confirmed_at: new Date().toISOString(),
            email_confirmed_at: new Date().toISOString(),
        } as unknown) as User;
    };

    // --- INIT: Restore session on page load/refresh ---
    useEffect(() => {
        const initAuth = async () => {
            try {
                // ✅ IS_DEMO is ALWAYS checked first — prevents any real network call to
                // Supabase or the Spring Boot backend when running in demo mode.
                if (IS_DEMO) {
                    const storedDemoUser = localStorage.getItem('medipatient_user');
                    if (storedDemoUser) {
                        try {
                            const parsed = JSON.parse(storedDemoUser);
                            setUser(formatBackendUserToSupabase(parsed));
                        } catch (e) {
                            // Corrupted storage — wipe it
                            localStorage.removeItem('medipatient_user');
                        }
                    }
                    return; // Hard stop — nothing below runs in demo mode
                }

                // Restore session from Spring Boot JWT
                if (AUTH_MODE === 'backend') {
                    const token = localStorage.getItem('medipatient_token');
                    const storedUser = localStorage.getItem('medipatient_user');

                    if (token && storedUser) {
                        try {
                            const parsedUser = JSON.parse(storedUser);
                            const formattedUser = formatBackendUserToSupabase(parsedUser);
                            setUser(formattedUser);
                            setSession({ access_token: token, refresh_token: '', user: formattedUser } as Session);
                        } catch (e) {
                            localStorage.removeItem('medipatient_token');
                            localStorage.removeItem('medipatient_user');
                        }
                    }
                    return;
                }

                // Restore session from Supabase
                if (AUTH_MODE === 'supabase') {
                    const { data } = await supabase.auth.getSession();
                    setSession(data.session);
                    setUser(data.session?.user ?? null);

                    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
                        setSession(session);
                        setUser(session?.user ?? null);
                        setIsLoading(false);
                    });

                    return () => subscription.unsubscribe();
                }

            } finally {
                // ✅ Safety net — this ALWAYS runs, even if a condition above
                // is misconfigured or throws an unexpected error.
                // The app will never be stuck on a loading screen.
                setIsLoading(false);
            }
        };

        initAuth();
    }, []);

    // --- SIGN IN ---
    const signIn = async (email: string, password: string): Promise<AuthResponse> => {
        setIsLoading(true);

        // DEMO mode — check against local DEMO_USERS list
        if (IS_DEMO) {
            await new Promise(r => setTimeout(r, 800)); // Simulate network delay

            const demoUser = DEMO_USERS.find(u => u.email === email && u.password === password);

            if (demoUser) {
                const rawUser: BackendUser = {
                    id: demoUser.id,
                    email: demoUser.email,
                    firstName: demoUser.first_name,
                    lastName: demoUser.last_name,
                    role: demoUser.role,
                };

                localStorage.setItem('medipatient_user', JSON.stringify(rawUser));
                setUser(formatBackendUserToSupabase(rawUser));
                setIsLoading(false);
                return { error: null };
            }

            setIsLoading(false);
            return { error: { message: "Identifiants de démonstration invalides." } };
        }

        // BACKEND mode — authenticate against Spring Boot
        if (AUTH_MODE === 'backend') {
            try {
                const baseUrl = API_BASE_URL.replace(/\/$/, '');
                const response = await fetch(`${baseUrl}/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, username: email, password }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || `Erreur serveur (${response.status})`);
                }

                const receivedToken = data.sessionId || data.token || data.accessToken || data.jwt;

                if (!receivedToken) {
                    throw new Error("Token d'authentification manquant dans la réponse.");
                }

                const userData = data.user || data;
                const rawUser: BackendUser = {
                    id: userData.id || userData.userId || '1',
                    email: userData.email || email,
                    firstName: userData.firstName || userData.username || 'Utilisateur',
                    lastName: userData.lastName || '',
                    roles: userData.roles || [],
                    role: userData.role,
                };

                localStorage.setItem('medipatient_token', receivedToken);
                localStorage.setItem('medipatient_user', JSON.stringify(rawUser));

                const formattedUser = formatBackendUserToSupabase(rawUser);
                setUser(formattedUser);
                setSession({ access_token: receivedToken, refresh_token: '', user: formattedUser } as Session);

                setIsLoading(false);
                return { error: null };

            } catch (error: any) {
                setIsLoading(false);
                return { error: { message: error.message || "Impossible de joindre le serveur." } };
            }
        }

        // SUPABASE mode — fallback
        if (AUTH_MODE === 'supabase') {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            setIsLoading(false);
            return { error: error ? { message: error.message } : null };
        }

        setIsLoading(false);
        return { error: { message: "Configuration d'authentification invalide." } };
    };

    // --- SIGN UP ---
    const signUp = async (
        email: string,
        password: string,
        firstName: string,
        lastName: string,
        phone?: string,
        role: 'PATIENT' | 'DOCTOR' = 'PATIENT'
    ): Promise<AuthResponse> => {
        setIsLoading(true);

        // Demo mode — registration is disabled
        if (IS_DEMO) {
            setIsLoading(false);
            return { error: { message: "L'inscription est désactivée en mode démo." } };
        }

        // Backend mode — create profile via Spring Boot
        if (AUTH_MODE === 'backend') {
            try {
                const baseUrl = API_BASE_URL.replace(/\/$/, '');
                const response = await fetch(`${baseUrl}/api/profiles`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ firstName, lastName, email, phone, password, role }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Erreur lors de l'inscription");
                }

                // If the API returns a token, log the user in immediately
                const receivedToken = data.sessionId || data.token || data.accessToken || data.jwt;
                if (receivedToken) {
                    const rawUser: BackendUser = {
                        id: data.user?.id || 'new',
                        email,
                        firstName,
                        lastName,
                        role,
                        roles: [role],
                    };

                    localStorage.setItem('medipatient_token', receivedToken);
                    localStorage.setItem('medipatient_user', JSON.stringify(rawUser));

                    const formattedUser = formatBackendUserToSupabase(rawUser);
                    setUser(formattedUser);
                    setSession({ access_token: receivedToken, user: formattedUser } as Session);
                }

                setIsLoading(false);
                return { error: null };

            } catch (error: any) {
                setIsLoading(false);
                return { error: { message: error.message || "Erreur serveur lors de la création du profil" } };
            }
        }

        // Supabase fallback
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { first_name: firstName, last_name: lastName, role } },
        });

        setIsLoading(false);
        return { error: error ? { message: error.message } : null };
    };

    // --- SIGN OUT ---
    const signOut = async () => {
        setIsLoading(true);

        localStorage.removeItem('medipatient_token');
        localStorage.removeItem('medipatient_user');

        if (AUTH_MODE === 'supabase') {
            await supabase.auth.signOut();
        }

        setUser(null);
        setSession(null);
        setIsLoading(false);
    };

    return (
        <AuthContext.Provider value={{
            user,
            session,
            isAuthenticated: !!user,
            isLoading,
            signIn,
            signUp,
            signOut,
        }}>
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