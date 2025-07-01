import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from './Sidebar';
import AdminDashboard from '../dashboard/AdminDashboard';
import DoctorDashboard from '../dashboard/DoctorDashboard';
import AgentDashboard from '../dashboard/AgentDashboard';
import PatientDashboard from '../dashboard/PatientDashboard';
import PatientApp from '../patient/PatientApp';
import PatientManagement from '../patients/PatientManagement';
import AppointmentScheduling from '../appointments/AppointmentScheduling';
import DoctorAgenda from '../agenda/DoctorAgenda';
import MedicalConsultation from '../consultation/MedicalConsultation';
import AIModule from '../ai/AIModule';
import BillingModule from '../billing/BillingModule';
import InventoryModule from '../inventory/InventoryModule';
import LaboratoryDashboard from '../laboratory/LaboratoryDashboard';
import PharmacyDashboard from '../pharmacy/PharmacyDashboard';

const MainLayout = () => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPageContent = () => {
    switch (currentPage) {
      case 'dashboard':
        switch (user?.role) {
          case 'admin':
            return <AdminDashboard />;
          case 'doctor':
            return <DoctorDashboard />;
          case 'agent':
            return <AgentDashboard />;
          case 'patient':
            return <PatientDashboard />;
          case 'lab_technician':
            return <LaboratoryDashboard />;
          case 'pharmacist':
            return <PharmacyDashboard />;
          default:
            return <div className="p-6">Page non trouvée</div>;
        }
      case 'patient-interface':
        return <PatientApp />;
      case 'patients':
        return <PatientManagement />;
      case 'appointments':
      case 'schedule':
        return <AppointmentScheduling />;
      case 'doctor-agenda':
        return <DoctorAgenda />;
      case 'consultations':
        return <MedicalConsultation />;
      case 'ai-assistant':
        return <AIModule />;
      case 'billing':
        return <BillingModule />;
      case 'inventory':
        return <InventoryModule />;
      case 'laboratory':
      case 'lab-schedule':
      case 'lab-results':
        return <LaboratoryDashboard />;
      case 'pharmacy':
      case 'pharmacy-inventory':
      case 'pharmacy-reports':
        return <PharmacyDashboard />;
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
