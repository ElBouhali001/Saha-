
export type ModuleId = 
  | 'auth' 
  | 'patient-management' 
  | 'appointment-scheduling' 
  | 'medical-consultation' 
  | 'billing-invoicing' 
  | 'inventory-management' 
  | 'laboratory-integration' 
  | 'pharmacy-integration'
  | 'ai-assistant'
  | 'transmission-referrals'
  | 'admin'
  | 'business-analytics';

export interface ModuleConfig {
  id: ModuleId;
  name: string;
  description: string;
  version: string;
  isCore: boolean;
  isEnabled: boolean;
  dependencies: ModuleId[];
  permissions: string[];
  routes: string[];
  components: string[];
}

export interface ModuleSettings {
  modules: Record<ModuleId, ModuleConfig>;
  tenant_id?: string;
  last_updated: string;
}

export const CORE_MODULES: ModuleId[] = ['auth', 'patient-management'];

export const defaultEnabledModules: ModuleId[] = [
  'auth',
  'patient-management',
  'appointment-scheduling',
  'medical-consultation',
  'billing-invoicing',
  'admin',
  'business-analytics'
];

export const MODULE_DEFINITIONS: Record<ModuleId, Omit<ModuleConfig, 'isEnabled'>> = {
  'auth': {
    id: 'auth',
    name: 'Authentification & Gestion Utilisateurs',
    description: 'Système d\'authentification et gestion des profils utilisateurs',
    version: '1.0.0',
    isCore: true,
    dependencies: [],
    permissions: ['auth:login', 'auth:manage_users', 'auth:view_profiles'],
    routes: ['/auth', '/profile'],
    components: ['LoginForm', 'UserProfile', 'AuthProvider']
  },
  'patient-management': {
    id: 'patient-management',
    name: 'Gestion des Patients',
    description: 'Gestion des dossiers patients et informations médicales de base',
    version: '1.0.0',
    isCore: true,
    dependencies: ['auth'],
    permissions: ['patients:view', 'patients:create', 'patients:edit', 'patients:delete'],
    routes: ['/patients', '/patient-interface'],
    components: ['PatientManagement', 'PatientInterface', 'PatientApp']
  },
  'appointment-scheduling': {
    id: 'appointment-scheduling',
    name: 'Gestion des Rendez-vous',
    description: 'Planification et gestion des rendez-vous médicaux',
    version: '1.0.0',
    isCore: false,
    dependencies: ['auth', 'patient-management'],
    permissions: ['appointments:view', 'appointments:create', 'appointments:edit', 'appointments:delete'],
    routes: ['/appointments', '/schedule', '/doctor-agenda'],
    components: ['AppointmentScheduling', 'DoctorAgenda', 'AppointmentBooking']
  },
  'medical-consultation': {
    id: 'medical-consultation',
    name: 'Consultations Médicales',
    description: 'Gestion des consultations, prescriptions et dossiers médicaux',
    version: '1.0.0',
    isCore: false,
    dependencies: ['auth', 'patient-management'],
    permissions: ['consultations:view', 'consultations:create', 'prescriptions:create'],
    routes: ['/consultations'],
    components: ['MedicalConsultation', 'ConsultationForm', 'PrescriptionManager']
  },
  'billing-invoicing': {
    id: 'billing-invoicing',
    name: 'Facturation & Paiements',
    description: 'Gestion de la facturation, tarification et paiements',
    version: '1.0.0',
    isCore: false,
    dependencies: ['auth', 'patient-management'],
    permissions: ['billing:view', 'billing:create', 'billing:manage'],
    routes: ['/billing'],
    components: ['BillingModule', 'InvoiceCreation', 'PaymentTracking']
  },
  'inventory-management': {
    id: 'inventory-management',
    name: 'Gestion des Stocks',
    description: 'Suivi et gestion des stocks de médicaments et matériel médical',
    version: '1.0.0',
    isCore: false,
    dependencies: ['auth'],
    permissions: ['inventory:view', 'inventory:manage'],
    routes: ['/inventory'],
    components: ['InventoryModule', 'StockList', 'StockAlerts']
  },
  'laboratory-integration': {
    id: 'laboratory-integration',
    name: 'Intégration Laboratoires',
    description: 'Intégration avec les laboratoires d\'analyses médicales',
    version: '1.0.0',
    isCore: false,
    dependencies: ['auth', 'patient-management', 'medical-consultation'],
    permissions: ['lab:view', 'lab:manage', 'lab:results'],
    routes: ['/laboratory', '/lab-schedule', '/lab-results'],
    components: ['LaboratoryDashboard', 'LabRequirements']
  },
  'pharmacy-integration': {
    id: 'pharmacy-integration',
    name: 'Intégration Pharmacies',
    description: 'Intégration avec les pharmacies pour la gestion des ordonnances',
    version: '1.0.0',
    isCore: false,
    dependencies: ['auth', 'patient-management', 'medical-consultation'],
    permissions: ['pharmacy:view', 'pharmacy:manage'],
    routes: ['/pharmacy', '/pharmacy-inventory', '/pharmacy-reports'],
    components: ['PharmacyDashboard']
  },
  'ai-assistant': {
    id: 'ai-assistant',
    name: 'Assistant IA',
    description: 'Assistant intelligent pour aide au diagnostic et suggestions de traitement',
    version: '1.0.0',
    isCore: false,
    dependencies: ['auth', 'medical-consultation'],
    permissions: ['ai:use', 'ai:diagnostics'],
    routes: ['/ai-assistant'],
    components: ['DocumentsModule', 'AIModule', 'DiagnosticAssistant', 'TreatmentSuggestions', 'DocumentGenerator', 'AdvancedDocumentGenerator']
  },
  'transmission-referrals': {
    id: 'transmission-referrals',
    name: 'Transmissions & Références',
    description: 'Transmission sécurisée de dossiers médicaux entre professionnels',
    version: '1.0.0',
    isCore: false,
    dependencies: ['auth', 'patient-management', 'medical-consultation'],
    permissions: ['transmission:create', 'transmission:view', 'transmission:access'],
    routes: ['/transmission'],
    components: ['SecureTransmissionModal', 'AccessTransmissionForm']
  },
  'admin': {
    id: 'admin',
    name: 'Administration',
    description: 'Paramètres et configuration du système',
    version: '1.0.0',
    isCore: false,
    dependencies: ['auth'],
    permissions: ['admin:settings', 'admin:qr_manage'],
    routes: ['/qr-settings'],
    components: ['QRDisplaySettings', 'ModuleManager', 'TenantSettings', 'AdminDashboard']
  },
  'business-analytics': {
    id: 'business-analytics',
    name: 'Analytique & Affaires',
    description: 'Analyse du chiffre d\'affaires et performance des médecins',
    version: '1.0.0',
    isCore: false,
    dependencies: ['auth', 'billing-invoicing'],
    permissions: ['analytics:view', 'analytics:revenue', 'analytics:reports'],
    routes: ['/business-analytics'],
    components: ['RevenueDistribution', 'DoctorRoleManager']
  }
};
