
import React, { useState } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import Sidebar from './Sidebar';
import ModuleComponent from '@/modules/ModuleLoader';
import AdminDashboard from '../dashboard/AdminDashboard';
import DoctorDashboard from '../dashboard/DoctorDashboard';
import AgentDashboard from '../dashboard/AgentDashboard';
import PatientDashboard from '../dashboard/PatientDashboard';
import { useModuleAccess } from '@/hooks/useModuleAccess';
import QRDisplaySettings from '@/components/settings/QRDisplaySettings';

const MainLayout = () => {
  const { user } = useSupabaseAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { canAccessModule } = useModuleAccess();

  const renderPageContent = () => {
    switch (currentPage) {
      case 'dashboard':
        switch (user?.user_metadata?.role || 'patient') {
          case 'admin':
            return <AdminDashboard />;
          case 'doctor':
            return <DoctorDashboard />;
          case 'agent':
            return <AgentDashboard />;
          case 'patient':
            return <PatientDashboard />;
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

      // QR Display Settings
      case 'qr-settings':
        return <QRDisplaySettings />;

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
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <main className="flex-1 overflow-auto">
        {renderPageContent()}
      </main>
    </div>
  );
};

export default MainLayout;
