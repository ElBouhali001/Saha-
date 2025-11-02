
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
import { Menu, Loader2 } from 'lucide-react';

const MainLayout = () => {
  const { user } = useSupabaseAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { canAccessModule } = useModuleAccess();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Récupérer le rôle depuis la table profiles
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
          // Fallback to user_metadata
          setUserRole(user.user_metadata?.role || 'patient');
        } else {
          setUserRole(profile?.role || 'patient');
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Chargement du profil...</p>
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
            return <div className="p-6">Module laboratoire non disponible</div>;
          case 'pharmacist':
            if (canAccessModule('pharmacy-integration')) {
              return <ModuleComponent moduleId="pharmacy-integration" componentName="PharmacyDashboard" />;
            }
            return <div className="p-6">Module pharmacie non disponible</div>;
          default:
            return <div className="p-6">Page non trouvée</div>;
        }
      
      // Patient Management Module
      case 'patient-interface':
        return canAccessModule('patient-management') ? 
          <ModuleComponent moduleId="patient-management" componentName="PatientApp" /> : 
          <div className="p-6">Module gestion patients non disponible</div>;
      
      case 'prescription-tracker':
        return canAccessModule('patient-management') ? 
          <ModuleComponent moduleId="patient-management" componentName="PrescriptionTrackerPage" /> : 
          <div className="p-6">Module gestion patients non disponible</div>;
      
      case 'patients':
        return canAccessModule('patient-management') ? 
          <ModuleComponent moduleId="patient-management" componentName="PatientManagement" /> : 
          <div className="p-6">Module gestion patients non disponible</div>;

      // Appointment Scheduling Module
      case 'appointments':
      case 'schedule':
        return canAccessModule('appointment-scheduling') ? 
          <ModuleComponent moduleId="appointment-scheduling" componentName="AppointmentScheduling" /> : 
          <div className="p-6">Module rendez-vous non disponible</div>;
      
      case 'doctor-agenda':
        return canAccessModule('appointment-scheduling') ? 
          <ModuleComponent moduleId="appointment-scheduling" componentName="DoctorAgenda" /> : 
          <div className="p-6">Module agenda non disponible</div>;

      // Medical Consultation Module
      case 'consultations':
        return canAccessModule('medical-consultation') ? 
          <ModuleComponent moduleId="medical-consultation" componentName="MedicalConsultation" /> : 
          <div className="p-6">Module consultation non disponible</div>;

      // AI Assistant Module
      case 'ai-assistant':
        return canAccessModule('ai-assistant') ? 
          <ModuleComponent moduleId="ai-assistant" componentName="DocumentsModule" /> : 
          <div className="p-6">Module assistant IA non disponible</div>;

      // Billing Module
      case 'billing':
        return canAccessModule('billing-invoicing') ? 
          <ModuleComponent moduleId="billing-invoicing" componentName="BillingModule" /> : 
          <div className="p-6">Module facturation non disponible</div>;

      // Inventory Module
      case 'inventory':
        return canAccessModule('inventory-management') ? 
          <ModuleComponent moduleId="inventory-management" componentName="InventoryModule" /> : 
          <div className="p-6">Module stock non disponible</div>;

      // Laboratory Module
      case 'laboratory':
      case 'lab-schedule':
      case 'lab-results':
        return canAccessModule('laboratory-integration') ? 
          <ModuleComponent moduleId="laboratory-integration" componentName="LaboratoryDashboard" /> : 
          <div className="p-6">Module laboratoire non disponible</div>;

      // Pharmacy Module
      case 'pharmacy':
      case 'pharmacy-inventory':
      case 'pharmacy-reports':
        return canAccessModule('pharmacy-integration') ? 
          <ModuleComponent moduleId="pharmacy-integration" componentName="PharmacyDashboard" /> : 
          <div className="p-6">Module pharmacie non disponible</div>;

      // Transmission Module
      case 'transfers':
        return canAccessModule('transmission-referrals') ? 
          <ModuleComponent moduleId="transmission-referrals" componentName="SecureTransmissionModal" /> : 
          <div className="p-6">Module transmission non disponible</div>;

      // Module Manager (Admin only)
      case 'module-manager':
        return userRole === 'admin' ? 
          <ModuleComponent moduleId="admin" componentName="ModuleManager" /> : 
          <div className="p-6">Module gestion non disponible</div>;

      // QR Display Settings
      case 'qr-settings':
        return <QRDisplaySettings />;

      // Telemedicine Module
      case 'telemedicine':
        return (userRole === 'doctor' || userRole === 'admin') ? 
          <DoctorTelemedicine /> : 
          <div className="p-6">Module télémédecine non disponible</div>;

      default:
        return (
          <div className="p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Page: {currentPage}
              </h2>
              <p className="text-gray-600">
                Cette fonctionnalité sera implémentée prochainement.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Header */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="w-6 h-6" />
          </Button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">M+</span>
            </div>
            <h1 className="font-bold text-lg text-blue-900">MediPatient</h1>
          </div>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      )}

      {/* Overlay pour mobile */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
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
      <main className={`flex-1 overflow-auto ${isMobile ? 'pt-16' : ''}`}>
        {renderPageContent()}
      </main>
    </div>
  );
};

export default MainLayout;
