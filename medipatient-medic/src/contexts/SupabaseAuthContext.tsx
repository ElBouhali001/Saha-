import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { IS_DEMO, AUTH_MODE, API_BASE_URL } from '@/config/app';
import { authService } from '@/services/api';

// --- TYPES & INTERFACES (Pour éviter les 'any') ---

interface BackendUser {
    id: string;
    email: string;
    username?: string; // Spring Security utilise souvent username
    firstName?: string;
    lastName?: string;
    roles?: string[];  // Si le backend renvoie une liste
    role?: string;     // Si le backend renvoie un string simple
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

// --- DONNÉES DE DÉMO (Déplacées hors du composant pour la lisibilité) ---
const DEMO_USERS = [
    { id: '1', email: 'admin@medipatient.com', first_name: 'Admin', last_name: 'Structure', role: 'admin' },
    { id: '2', email: 'dr.kouame@medipatient.com', first_name: 'Dr. Kouamé', last_name: 'Adjoua', role: 'admin', speciality: 'Médecine Générale' },
    { id: '3', email: 'agent@medipatient.com', first_name: 'Marie', last_name: 'Traoré', role: 'agent' },
    { id: '4', email: 'patient@medipatient.com', first_name: 'Jean', last_name: 'Koné', role: 'patient' },
    { id: '5', email: 'labo@medipatient.com', first_name: 'Sophie', last_name: 'Diabaté', role: 'lab_technician' },
    { id: '6', email: 'pharmacien@medipatient.com', first_name: 'Ahmed', last_name: 'Touré', role: 'pharmacist' },
    { id: '7', email: 'assurance@medipatient.com', first_name: 'Fatou', last_name: 'Sangaré', role: 'insurance_agent' },
    // Médecins spécialistes
    { id: '8', email: 'cardio.dubois@medipatient.com', first_name: 'Marie', last_name: 'Dubois', role: 'doctor', speciality: 'Cardiologie' },
    { id: '9', email: 'dermato.moreau@medipatient.com', first_name: 'Pierre', last_name: 'Moreau', role: 'doctor', speciality: 'Dermatologie' },
    { id: '10', email: 'pediatre.lemaire@medipatient.com', first_name: 'Sophie', last_name: 'Lemaire', role: 'doctor', speciality: 'Pédiatrie' },
    { id: '11', email: 'gyneco.bernard@medipatient.com', first_name: 'Claire', last_name: 'Bernard', role: 'doctor', speciality: 'Gynécologie' },
    { id: '12', email: 'neuro.rousseau@medipatient.com', first_name: 'Julien', last_name: 'Rousseau', role: 'doctor', speciality: 'Neurologie' },
    { id: '13', email: 'ortho.girard@medipatient.com', first_name: 'Luc', last_name: 'Girard', role: 'doctor', speciality: 'Orthopédie' },
    { id: '14', email: 'ophtalmo.leroy@medipatient.com', first_name: 'Anne', last_name: 'Leroy', role: 'doctor', speciality: 'Ophtalmologie' },
    { id: '15', email: 'dentiste.demo@medipatient.com', first_name: 'Aïcha', last_name: 'Diallo', role: 'doctor', speciality: 'Dentiste' },
    { id: '16', email: 'admin.demo@medipatient.com', first_name: 'Admin', last_name: 'Demo', role: 'admin' },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const SupabaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // --- HELPER : ADAPTATEUR BACKEND -> FRONTEND ---
    // Transforme l'objet reçu de Spring Boot en objet User Supabase
    const formatBackendUserToSupabase = (userData: BackendUser): User => {
        // Détermination du rôle (gère tableau ou string)
        const userRole = userData.roles && userData.roles.length > 0
            ? userData.roles[0]
            : (userData.role || 'patient');

        return ({
            id: userData.id,
            email: userData.email,
            phone: userData.phone || '',
            app_metadata: { provider: AUTH_MODE, providers: [AUTH_MODE] },
            user_metadata: {
                role: userRole.toLowerCase(), // On force minuscule pour éviter les bugs
                first_name: userData.firstName || userData.username || 'Utilisateur',
                last_name: userData.lastName || '',
            },
            aud: 'authenticated',
            created_at: new Date().toISOString(),
            // Champs requis par le type User de Supabase mais inutiles pour nous :
            identities: [],
            factors: [],
            last_sign_in_at: new Date().toISOString(),
            confirmed_at: new Date().toISOString(),
            email_confirmed_at: new Date().toISOString(),
        } as unknown) as User; // Le cast unknown est nécessaire car on mocke un type interne complexe
    };

    // --- INITIALISATION (useEffect) ---
    useEffect(() => {
        const initAuth = async () => {
            // 1. MODE BACKEND (Prioritaire)
            if (AUTH_MODE === 'backend' && !IS_DEMO) {
                const token = localStorage.getItem('medipatient_token');
                const storedUser = localStorage.getItem('medipatient_user');

                if (token && storedUser) {
                    try {
                        const parsedUser = JSON.parse(storedUser);
                        const formattedUser = formatBackendUserToSupabase(parsedUser);

                        setUser(formattedUser);
                        setSession({ access_token: token, refresh_token: '', user: formattedUser } as Session);
                    } catch (e) {
                        console.error("Session locale corrompue, déconnexion.", e);
                        localStorage.removeItem('medipatient_token');
                        localStorage.removeItem('medipatient_user');
                    }
                }
                setIsLoading(false);
                return;
            }

            // 2. MODE SUPABASE
            if (AUTH_MODE === 'supabase') {
                const { data } = await supabase.auth.getSession();
                setSession(data.session);
                setUser(data.session?.user ?? null);
                setIsLoading(false);

                const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
                    setSession(session);
                    setUser(session?.user ?? null);
                    setIsLoading(false);
                });

                return () => subscription.unsubscribe();
            }

            // 3. MODE DEMO
            if (IS_DEMO) {
                // En mode démo, on vérifie aussi s'il y a un user en local storage pour la persistance au refresh
                const storedDemoUser = localStorage.getItem('medipatient_user');
                if (storedDemoUser) {
                    try {
                        // On réhydrate l'utilisateur démo
                        const parsed = JSON.parse(storedDemoUser);
                        // On s'assure qu'il est au bon format
                        setUser(formatBackendUserToSupabase(parsed));
                    } catch(e) { /* ignore */ }
                }
                setIsLoading(false);
            }
        };

        initAuth();
    }, []);

    // --- SIGN IN ---
    const signIn = async (email: string, password: string): Promise<AuthResponse> => {
        setIsLoading(true);

        // CAS 1 : MODE BACKEND API (Votre cas actuel)
        if (AUTH_MODE === 'backend' && !IS_DEMO) {
            try {
                // Nettoyage de l'URL pour éviter les doubles slashs
                const baseUrl = API_BASE_URL.replace(/\/$/, '');
                console.log(`Connexion vers : ${baseUrl}/api/auth/login`);

                const response = await fetch(`${baseUrl}/api/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email,
                        username: email, // On envoie les deux pour compatibilité Spring Security
                        password
                    }),
                });

                const data = await response.json();
                const receivedToken = data.sessionId || data.token || data.acessToken || data.jwt

                if (!response.ok) {
                    throw new Error(data.message || `Erreur serveur (${response.status})`);
                }

                if (!receivedToken) {
                    throw new Error("Token d'authentification manquant dans la réponse.");
                }

                // Construction de l'objet utilisateur à partir de la réponse JSON
                const userData = data.user || data

                const rawUser: BackendUser = {
                    id: userData.id || userData.userId || '1',
                    email: userData.email || email,
                    firstName: userData.firstName || userData.username || 'Utilisateur',
                    lastName: userData.lastName || '',
                    roles: userData.roles || [],
                    role: userData.role // ex: "ADMIN"
                };

                // Sauvegarde Locale
                localStorage.setItem('medipatient_token', receivedToken);
                localStorage.setItem('medipatient_user', JSON.stringify(rawUser));

                // Mise à jour de l'état React
                const formattedUser = formatBackendUserToSupabase(rawUser);
                setUser(formattedUser);
                setSession({ access_token: receivedToken, refresh_token: '', user: formattedUser } as Session);

                setIsLoading(false);
                return { error: null };

            } catch (error: any) {
                console.error("Erreur Login Backend:", error);
                setIsLoading(false);
                return { error: { message: error.message || "Impossible de joindre le serveur." } };
            }
        }

        // CAS 2 : MODE DEMO
        if (IS_DEMO) {
            // Simulation délai réseau
            await new Promise(r => setTimeout(r, 800));

            const demoUser = DEMO_USERS.find(u => u.email === email && u.password === password);

            if (demoUser) {
                const rawUser: BackendUser = {
                    id: demoUser.id,
                    email: demoUser.email,
                    firstName: demoUser.first_name,
                    lastName: demoUser.last_name,
                    role: demoUser.role
                };

                localStorage.setItem('medipatient_user', JSON.stringify(rawUser));
                setUser(formatBackendUserToSupabase(rawUser));
                setIsLoading(false);
                return { error: null };
            }

            setIsLoading(false);
            return { error: { message: "Identifiants de démonstration invalides." } };
        }

        // CAS 3 : MODE SUPABASE (Fallback)
        if (AUTH_MODE === 'supabase') {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            setIsLoading(false);
            return { error: error ? { message: error.message } : null };
        }

        setIsLoading(false);
        return { error: { message: "Configuration d'authentification invalide." } };
    };

    // --- SIGN UP ---
    const signUp = async (email: string, password: string, firstName: string, lastName: string, phone?: string, role: 'PATIENT' | 'DOCTOR' = 'PATIENT'): Promise<AuthResponse> => {
        setIsLoading(true);

        if (AUTH_MODE === 'backend' && !IS_DEMO) {
            try {
                const baseUrl = API_BASE_URL.replace(/\/$/, '');

                // On appelle votre endpoint de création de profil
                const response = await fetch(`${baseUrl}/api/profiles`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        firstName,
                        lastName,
                        email,
                        phone,
                        password,
                        role
                    }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Erreur lors de l'inscription");
                }

                // --- GESTION POST-INSCRIPTION ---
                const receivedToken = data.sessionId || data.token || data.accessToken || data.jwt;

                if (receivedToken) {
                    // Cas A : L'API nous connecte directement
                    const userData = data.user || data;

                    const rawUser: BackendUser = {
                        id: userData.id || 'new',
                        email: email,
                        firstName: firstName,
                        lastName: lastName,
                        role: role,
                        roles: [role]
                    };

                    localStorage.setItem('medipatient_token', receivedToken);
                    localStorage.setItem('medipatient_user', JSON.stringify(rawUser));

                    // Mise à jour de l'état pour que l'app sache qu'on est connecté
                    setUser(formatBackendUserToSupabase(rawUser));
                    setSession({ access_token: receivedToken, user: formatBackendUserToSupabase(rawUser) } as Session);
                }

                // Si pas de token (Cas B), ce n'est pas grave, on renvoie juste le succès
                // Le composant LoginForm affichera un Toast "Compte créé" et demandera de se connecter.

                setIsLoading(false);
                return { error: null };

            } catch (error: any) {
                setIsLoading(false);
                return { error: { message: error.message || "Erreur serveur lors de la création du profil" } };
            }
        }

        if (IS_DEMO) {
            setIsLoading(false);
            return { error: { message: "L'inscription est désactivée en mode démo." } };
        }

        // Supabase Fallback
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { first_name: firstName, last_name: lastName, role } }
        });

        setIsLoading(false);
        return { error: error ? { message: error.message } : null };
    };

    // --- SIGN OUT ---
    const signOut = async () => {
        setIsLoading(true);

        // Nettoyage Local
        localStorage.removeItem('medipatient_token');
        localStorage.removeItem('medipatient_user');

        // Nettoyage Supabase si nécessaire
        if (AUTH_MODE === 'supabase') {
            await supabase.auth.signOut();
        }

        // Nettoyage État
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