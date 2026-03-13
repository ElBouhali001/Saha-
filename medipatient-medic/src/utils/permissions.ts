
import { User } from '@supabase/supabase-js';

export type Permission = 
  | 'view_all_patients'
  | 'edit_patient_admin'
  | 'edit_patient_medical'
  | 'view_medical_records'
  | 'view_patient_basic_info'
  | 'create_consultation'
  | 'create_prescription'
  | 'view_appointments'
  | 'manage_appointments'
  | 'view_billing'
  | 'manage_billing'
  | 'view_inventory'
  | 'manage_inventory'
  | 'admin_settings'
  | 'generate_reports'
  | 'manage_lab_tests'
  | 'manage_pharmacy_prescriptions'
  | 'manage_primary_doctor_requests'
  | 'view_insurance_claims';

export const rolePermissions: Record<string, Permission[]> = {
  admin: [
    'view_all_patients',
    'edit_patient_admin',
    'view_medical_records',
    'view_patient_basic_info',
    'view_appointments',
    'manage_appointments',
    'view_billing',
    'manage_billing',
    'view_inventory',
    'manage_inventory',
    'admin_settings',
    'generate_reports',
    'manage_lab_tests',
    'manage_pharmacy_prescriptions',
    'manage_primary_doctor_requests',
    'view_insurance_claims'
  ],
  doctor: [
    'view_all_patients',
    'edit_patient_medical',
    'view_medical_records',
    'view_patient_basic_info',
    'create_consultation',
    'create_prescription',
    'view_appointments',
    'manage_appointments',
    'manage_lab_tests',
    'manage_pharmacy_prescriptions',
    'manage_primary_doctor_requests'
  ],
  agent: [
    'view_all_patients',
    'edit_patient_admin',
    'view_patient_basic_info', // ACCÈS LIMITÉ - pas de dossier médical
    'view_appointments',
    'manage_appointments',
    'view_billing',
    'manage_billing'
  ],
  lab_technician: [
    'view_patient_basic_info',
    'manage_lab_tests',
    'view_appointments'
  ],
  pharmacist: [
    'view_patient_basic_info',
    'manage_pharmacy_prescriptions',
    'view_inventory',
    'manage_inventory'
  ],
  insurance_agent: [
    'view_patient_basic_info',
    'view_insurance_claims',
    'view_billing'
  ],
  patient: []
};

// Données accessibles par rôle
export const dataAccess: Record<string, string[]> = {
  agent: [
    'nom', 'prenom', 'telephone', 'email', 'date_naissance', 'adresse',
    'statut_mutuelle', 'historique_rdv', 'historique_paiements'
  ],
  lab_technician: [
    'nom', 'prenom', 'telephone', 'email', 'date_naissance',
    'analyses_prescrites', 'resultats_analyses'
  ],
  pharmacist: [
    'nom', 'prenom', 'telephone', 'email',
    'ordonnances', 'allergies_medicamenteuses'
  ],
  insurance_agent: [
    'nom', 'prenom', 'date_naissance', 'numero_assurance',
    'factures', 'remboursements'
  ]
};

// Données INTERDITES par rôle
export const restrictedData: Record<string, string[]> = {
  agent: [
    'dossier_medical', 'diagnostics', 'consultations',
    'ordonnances', 'prescriptions', 'resultats_analyses',
    'antecedents_medicaux', 'allergies'
  ],
  lab_technician: [
    'dossier_medical', 'diagnostics', 'consultations',
    'ordonnances', 'antecedents_medicaux'
  ],
  pharmacist: [
    'dossier_medical', 'diagnostics', 'consultations',
    'antecedents_medicaux', 'resultats_analyses'
  ],
  insurance_agent: [
    'dossier_medical', 'diagnostics', 'consultations',
    'ordonnances', 'prescriptions', 'resultats_analyses',
    'antecedents_medicaux', 'allergies'
  ]
};

export const hasPermission = (user: User | null, permission: Permission): boolean => {
  if (!user) return false;
  
  const userRole = user.user_metadata?.role;
  if (!userRole) return false;
  
  const userPermissions = rolePermissions[userRole] || [];
  return userPermissions.includes(permission);
};

export const requirePermission = (user: User | null, permission: Permission): boolean => {
  if (!hasPermission(user, permission)) {
    throw new Error(`Accès refusé. Permission requise: ${permission}`);
  }
  return true;
};

export const canAccessPatientData = (user: User | null, dataField: string): boolean => {
  if (!user) return false;
  
  const userRole = user.user_metadata?.role;
  if (!userRole) return false;
  
  // Médecins et admins ont accès à tout
  if (['doctor', 'admin'].includes(userRole)) return true;
  
  // Vérifier si le champ est dans les données autorisées
  const allowedData = dataAccess[userRole] || [];
  const forbiddenData = restrictedData[userRole] || [];
  
  return allowedData.includes(dataField) && !forbiddenData.includes(dataField);
};

export const getRestrictedMessage = (userRole: string): string => {
  const messages: Record<string, string> = {
    agent: "Accès réservé au personnel médical - Dossier médical confidentiel",
    lab_technician: "Accès limité aux analyses prescrites uniquement",
    pharmacist: "Accès limité aux ordonnances et allergies médicamenteuses",
    insurance_agent: "Accès limité aux données de facturation et remboursement"
  };
  
  return messages[userRole] || "Accès non autorisé";
};

// Hook pour vérifier les permissions dans les composants
export const usePermissions = (user: User | null) => {
  return {
    hasPermission: (permission: Permission) => hasPermission(user, permission),
    requirePermission: (permission: Permission) => requirePermission(user, permission),
    canAccessPatientData: (dataField: string) => canAccessPatientData(user, dataField),
    getRestrictedMessage: () => getRestrictedMessage(user?.user_metadata?.role || ''),
    canViewMedicalData: () => hasPermission(user, 'view_medical_records'),
    canCreateConsultation: () => hasPermission(user, 'create_consultation'),
    canManageBilling: () => hasPermission(user, 'manage_billing'),
    canAccessAdminSettings: () => hasPermission(user, 'admin_settings'),
    canManageLabTests: () => hasPermission(user, 'manage_lab_tests'),
    canManagePharmacy: () => hasPermission(user, 'manage_pharmacy_prescriptions'),
    canManagePrimaryDoctor: () => hasPermission(user, 'manage_primary_doctor_requests')
  };
};
