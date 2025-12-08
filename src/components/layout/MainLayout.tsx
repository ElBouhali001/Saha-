import React, { useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/integrations/supabase/client';
import Sidebar from './Sidebar';
import ModuleComponent from '@/modules/ModuleLoader';
import AdminDashboard from '../dashboard/AdminDashboard';
import DoctorDashboard from '../dashboard/DoctorDashboard';
import AgentDashboard from '../dashboard/AgentDashboard';
import PatientDashboard from '../dashboard/PatientDashboard';
import { useModuleAccess } from '@/hooks/useModuleAccess';
import QRDisplaySettings from '@/components/settings/QRDisplaySettings';
import DoctorTelemedicine from '@/components/telemedicine/DoctorTelemedicine';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Menu, Loader2, Zap } from 'lucide-react';

const MainLayout = () => {
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
          case 'lab_technician':
            if (canAccessModule('laboratory-integration')) {
              return <ModuleComponent moduleId="laboratory-integration" componentName="LaboratoryDashboard" />;
            }
            return <div className="p-6 text-muted-foreground">Module laboratoire non disponible</div>;
          case 'pharmacist':
            if (canAccessModule('pharmacy-integration')) {
              return <ModuleComponent moduleId="pharmacy-integration" componentName="PharmacyDashboard" />;
            }
            return <div className="p-6 text-muted-foreground">Module pharmacie non disponible</div>;
          default:
            return <div className="p-6 text-muted-foreground">Page non trouvée</div>;
        }
      
      case 'patient-interface':
        return canAccessModule('patient-management') ? 
          <ModuleComponent moduleId="patient-management" componentName="PatientApp" /> : 
          <div className="p-6 text-muted-foreground">Module gestion patients non disponible</div>;
      
      case 'prescription-tracker':
        return canAccessModule('patient-management') ? 
          <ModuleComponent moduleId="patient-management" componentName="PrescriptionTrackerPage" /> : 
          <div className="p-6 text-muted-foreground">Module gestion patients non disponible</div>;
      
      case 'patients':
        return canAccessModule('patient-management') ? 
          <ModuleComponent moduleId="patient-management" componentName="PatientManagement" /> : 
          <div className="p-6 text-muted-foreground">Module gestion patients non disponible</div>;

      case 'appointments':
      case 'schedule':
        return canAccessModule('appointment-scheduling') ? 
          <ModuleComponent moduleId="appointment-scheduling" componentName="AppointmentScheduling" /> : 
          <div className="p-6 text-muted-foreground">Module rendez-vous non disponible</div>;
      
      case 'doctor-agenda':
        return canAccessModule('appointment-scheduling') ? 
          <ModuleComponent moduleId="appointment-scheduling" componentName="DoctorAgenda" /> : 
          <div className="p-6 text-muted-foreground">Module agenda non disponible</div>;

      case 'consultations':
        return canAccessModule('medical-consultation') ? 
          <ModuleComponent moduleId="medical-consultation" componentName="MedicalConsultation" /> : 
          <div className="p-6 text-muted-foreground">Module consultation non disponible</div>;

      case 'ai-assistant':
        return canAccessModule('ai-assistant') ? 
          <ModuleComponent moduleId="ai-assistant" componentName="DocumentsModule" /> : 
          <div className="p-6 text-muted-foreground">Module assistant IA non disponible</div>;

      case 'billing':
        return canAccessModule('billing-invoicing') ? 
          <ModuleComponent moduleId="billing-invoicing" componentName="BillingModule" /> : 
          <div className="p-6 text-muted-foreground">Module facturation non disponible</div>;

      case 'inventory':
        return canAccessModule('inventory-management') ? 
          <ModuleComponent moduleId="inventory-management" componentName="InventoryModule" /> : 
          <div className="p-6 text-muted-foreground">Module stock non disponible</div>;

      case 'laboratory':
      case 'lab-schedule':
      case 'lab-results':
        return canAccessModule('laboratory-integration') ? 
          <ModuleComponent moduleId="laboratory-integration" componentName="LaboratoryDashboard" /> : 
          <div className="p-6 text-muted-foreground">Module laboratoire non disponible</div>;

      case 'pharmacy':
      case 'pharmacy-inventory':
      case 'pharmacy-reports':
        return canAccessModule('pharmacy-integration') ? 
          <ModuleComponent moduleId="pharmacy-integration" componentName="PharmacyDashboard" /> : 
          <div className="p-6 text-muted-foreground">Module pharmacie non disponible</div>;

      case 'transfers':
        return canAccessModule('transmission-referrals') ? 
          <ModuleComponent moduleId="transmission-referrals" componentName="SecureTransmissionModal" /> : 
          <div className="p-6 text-muted-foreground">Module transmission non disponible</div>;

      case 'module-manager':
        return userRole === 'admin' ? 
          <ModuleComponent moduleId="admin" componentName="ModuleManager" /> : 
          <div className="p-6 text-muted-foreground">Module gestion non disponible</div>;

      case 'business-analytics':
        return ['admin', 'doctor', 'agent'].includes(userRole || '') && canAccessModule('business-analytics') ?
          <ModuleComponent moduleId="business-analytics" componentName="RevenueDistribution" /> :
          <div className="p-6 text-muted-foreground">Module analytique non disponible</div>;

      case 'qr-settings':
        return <QRDisplaySettings />;

      case 'telemedicine':
        return (userRole === 'doctor' || userRole === 'admin') ? 
          <DoctorTelemedicine /> : 
          <div className="p-6 text-muted-foreground">Module télémédecine non disponible</div>;

      default:
        return (
          <div className="p-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-display font-bold text-foreground">
                {currentPage}
              </h2>
              <p className="text-muted-foreground font-mono">
                // En cours de développement
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Background effects - lighter */}
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
          <div className="w-10" />
        </div>
      )}

      {/* Overlay for mobile */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={() => setSidebarOpen(false)}
        />
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