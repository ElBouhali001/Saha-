
import React, { lazy, Suspense } from 'react';
import { ModuleId } from '@/types/modules';
import { useModuleAccess } from '@/hooks/useModuleAccess';
import { Loader2 } from 'lucide-react';

// Lazy loading des modules
const moduleComponents = {
  'auth': {
    LoginForm: lazy(() => import('./auth').then(m => ({ default: m.LoginForm }))),
    AuthComponent: lazy(() => import('./auth').then(m => ({ default: m.AuthComponent }))),
    ProtectedRoute: lazy(() => import('./auth').then(m => ({ default: m.ProtectedRoute }))),
  },
  'patient-management': {
    PatientManagement: lazy(() => import('./patient-management').then(m => ({ default: m.PatientManagement }))),
    PatientApp: lazy(() => import('./patient-management').then(m => ({ default: m.PatientApp }))),
    PatientInterface: lazy(() => import('./patient-management').then(m => ({ default: m.PatientInterface }))),
  },
  'appointment-scheduling': {
    AppointmentScheduling: lazy(() => import('./appointment-scheduling').then(m => ({ default: m.AppointmentScheduling }))),
    DoctorAgenda: lazy(() => import('./appointment-scheduling').then(m => ({ default: m.DoctorAgenda }))),
    AppointmentBooking: lazy(() => import('./appointment-scheduling').then(m => ({ default: m.AppointmentBooking }))),
  },
  'medical-consultation': {
    MedicalConsultation: lazy(() => import('./medical-consultation').then(m => ({ default: m.MedicalConsultation }))),
    ConsultationForm: lazy(() => import('./medical-consultation').then(m => ({ default: m.ConsultationForm }))),
    PrescriptionManager: lazy(() => import('./medical-consultation').then(m => ({ default: m.PrescriptionManager }))),
  },
  'billing-invoicing': {
    BillingModule: lazy(() => import('./billing-invoicing').then(m => ({ default: m.BillingModule }))),
    InvoiceCreation: lazy(() => import('./billing-invoicing').then(m => ({ default: m.InvoiceCreation }))),
    PaymentTracking: lazy(() => import('./billing-invoicing').then(m => ({ default: m.PaymentTracking }))),
  },
  'inventory-management': {
    InventoryModule: lazy(() => import('./inventory-management').then(m => ({ default: m.InventoryModule }))),
    StockList: lazy(() => import('./inventory-management').then(m => ({ default: m.StockList }))),
    StockAlerts: lazy(() => import('./inventory-management').then(m => ({ default: m.StockAlerts }))),
  },
  'laboratory-integration': {
    LaboratoryDashboard: lazy(() => import('./laboratory-integration').then(m => ({ default: m.LaboratoryDashboard }))),
    LabRequirements: lazy(() => import('./laboratory-integration').then(m => ({ default: m.LabRequirements }))),
  },
  'pharmacy-integration': {
    PharmacyDashboard: lazy(() => import('./pharmacy-integration').then(m => ({ default: m.PharmacyDashboard }))),
  },
  'ai-assistant': {
    AIModule: lazy(() => import('./ai-assistant').then(m => ({ default: m.AIModule }))),
    DiagnosticAssistant: lazy(() => import('./ai-assistant').then(m => ({ default: m.DiagnosticAssistant }))),
    TreatmentSuggestions: lazy(() => import('./ai-assistant').then(m => ({ default: m.TreatmentSuggestions }))),
  },
  'transmission-referrals': {
    SecureTransmissionModal: lazy(() => import('./transmission-referrals').then(m => ({ default: m.SecureTransmissionModal }))),
    AccessTransmissionForm: lazy(() => import('./transmission-referrals').then(m => ({ default: m.AccessTransmissionForm }))),
    TransmissionAccess: lazy(() => import('./transmission-referrals').then(m => ({ default: m.TransmissionAccess }))),
  },
};

interface ModuleComponentProps {
  moduleId: ModuleId;
  componentName: string;
  [key: string]: any;
}

const ModuleComponent: React.FC<ModuleComponentProps> = ({ 
  moduleId, 
  componentName, 
  ...props 
}) => {
  const { canAccessModule } = useModuleAccess();

  if (!canAccessModule(moduleId)) {
    return null;
  }

  const Component = moduleComponents[moduleId]?.[componentName];
  
  if (!Component) {
    console.warn(`Component ${componentName} not found in module ${moduleId}`);
    return null;
  }

  return (
    <Suspense 
      fallback={
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="ml-2">Chargement du module...</span>
        </div>
      }
    >
      <Component {...props} />
    </Suspense>
  );
};

export default ModuleComponent;
