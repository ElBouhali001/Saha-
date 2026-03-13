import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/integrations/supabase/client';
import Sidebar from './Sidebar';
import ModuleComponent from '@/modules/ModuleLoader';
import AdminDashboard from '../dashboard/AdminDashboard';
import DoctorDashboard from '../dashboard/DoctorDashboard';
import AgentDashboard from '../dashboard/AgentDashboard';
import PatientDashboard from '../dashboard/PatientDashboard';
import PatientInsuranceDashboard from '../insurance/PatientInsuranceDashboard';
import { useModuleAccess } from '@/hooks/useModuleAccess';
import QRDisplaySettings from '@/components/settings/QRDisplaySettings';
import DoctorTelemedicine from '@/components/telemedicine/DoctorTelemedicine';
import PrescriptionHistory from "@/components/patient/PrescriptionHistory.tsx";
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
// Ajout de FileQuestion et ArrowLeft pour le message d'erreur
import { Menu, Loader2, Zap, FileQuestion, ArrowLeft } from 'lucide-react';

import LanguageSwitcher from '@/components/common/LanguageSwitcher';

const MainLayout = () => {
    const { t } = useTranslation();
    const { user } = useSupabaseAuth();
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [userRole, setUserRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const { canAccessModule } = useModuleAccess();
    const isMobile = useIsMobile();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const fetchUserRole = async () => {
            if (!user?.id) {
                setLoading(false);
                return;
            }

            try {
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                if (error) {
                    console.error('Error fetching user role:', error);
                    setUserRole(user.user_metadata?.role || 'patient');
                } else {
                    setUserRole(profile?.role || 'patient');
                }

                const { data: isAdmin, error: adminCheckError } = await supabase.rpc('is_admin', { _user_id: user.id });
                if (adminCheckError) {
                    console.warn('Admin check failed:', adminCheckError);
                } else if (isAdmin === true) {
                    setUserRole('admin');
                }
            } catch (error) {
                console.error('Error:', error);
                setUserRole(user.user_metadata?.role || 'patient');
            } finally {
                setLoading(false);
            }
        };

        fetchUserRole();
    }, [user]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-4">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow mx-auto animate-glow-pulse">
                            <Zap className="w-8 h-8 text-primary-foreground" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                        <p className="text-muted-foreground font-mono text-sm">Chargement...</p>
                    </div>
                </div>
            </div>
        );
    }

    const renderPageContent = () => {
        switch (currentPage) {
            case 'dashboard':
                switch (userRole || 'patient') {
                    case 'admin':
                        return <AdminDashboard />;
                    case 'doctor':
                        return <DoctorDashboard onNavigate={setCurrentPage} />;
                    case 'agent':
                        return <AgentDashboard />;
                    case 'patient':
                        return <PatientDashboard onNavigate={setCurrentPage} />;
                    // ... autres rôles
                    default:
                        return <PatientDashboard onNavigate={setCurrentPage} />;
                }

            // --- Vos cases de modules existants ---
            case 'patient-interface':
                return canAccessModule('patient-management') ?
                    <ModuleComponent moduleId="patient-management" componentName="PatientApp" /> :
                    <div className="p-6 text-muted-foreground">Module non disponible</div>;

            case 'prescriptions':
            case 'pharmacy':
                return <PrescriptionHistory onNavigate={setCurrentPage} />;

            case 'telemedicine':
                return (userRole === 'doctor' || userRole === 'admin') ?
                    <DoctorTelemedicine onNavigate={setCurrentPage} /> :
                    <div className="p-6 text-muted-foreground text-center">
                        <p>Accès réservé aux médecins.</p>
                        <Button onClick={() => setCurrentPage('dashboard')} variant="link">Retour</Button>
                    </div>;

            case 'insurance':
                return <PatientInsuranceDashboard />;

            case 'qr-settings':
                return <QRDisplaySettings />;

            // --- LE BLOC DEFAULT CORRIGÉ (EMPTY STATE) ---
            default:
                return (
                    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-fade-in p-6">
                        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                            <FileQuestion className="w-10 h-10 text-muted-foreground" />
                        </div>
                        <div className="space-y-2 max-w-sm">
                            <h2 className="text-2xl font-bold text-foreground">
                                Aucune donnée disponible
                            </h2>
                            <p className="text-muted-foreground">
                                Cette section ({currentPage}) est soit vide, soit encore en cours de configuration pour votre profil.
                            </p>
                        </div>
                        <Button
                            onClick={() => setCurrentPage('dashboard')}
                            variant="outline"
                            className="gap-2 border-primary/20 hover:bg-primary/5 transition-all"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Retour au tableau de bord
                        </Button>
                    </div>
                );
        }
    };

    return (
        <div className="flex h-screen bg-background overflow-hidden">
            {/* Background effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/5 blur-[120px]" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-accent/5 blur-[120px]" />
            </div>

            {/* Mobile Header */}
            {isMobile && (
                <div className="fixed top-0 left-0 right-0 z-50 header-premium p-4 flex items-center justify-between mobile-header">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="touch-target text-foreground hover:bg-muted/50 rounded-xl"
                    >
                        <Menu className="w-5 h-5" />
                    </Button>
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
                            <Zap className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <h1 className="font-display font-bold text-base text-gradient">MediPatient</h1>
                    </div>
                    <LanguageSwitcher />
                </div>
            )}

            {/* Sidebar */}
            <Sidebar
                currentPage={currentPage}
                onPageChange={(page) => {
                    setCurrentPage(page);
                    if (isMobile) setSidebarOpen(false);
                }}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                userRole={userRole}
            />

            {/* Main Content */}
            <main className={`flex-1 overflow-auto ${isMobile ? 'pt-16' : ''} p-4 md:p-6 mobile-safe-area scrollbar-premium relative z-10`}>
                <div className="max-w-full overflow-x-hidden animate-fade-in">
                    {renderPageContent()}
                </div>
            </main>
        </div>
    );
};

export default MainLayout;