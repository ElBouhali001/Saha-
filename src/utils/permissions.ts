
import { User } from '@/types/user';

export type Permission = 
  | 'view_all_patients'
  | 'edit_patient_admin'
  | 'edit_patient_medical'
  | 'view_medical_records'
  | 'create_consultation'
  | 'create_prescription'
  | 'view_appointments'
  | 'manage_appointments'
  | 'view_billing'
  | 'manage_billing'
  | 'view_inventory'
  | 'manage_inventory'
  | 'admin_settings'
  | 'generate_reports';

export const rolePermissions: Record<string, Permission[]> = {
  admin: [
    'view_all_patients',
    'edit_patient_admin',
    'view_appointments',
    'manage_appointments',
    'view_billing',
    'manage_billing',
    'view_inventory',
    'manage_inventory',
    'admin_settings',
    'generate_reports'
  ],
  doctor: [
    'view_all_patients',
    'edit_patient_medical',
    'view_medical_records',
    'create_consultation',
    'create_prescription',
    'view_appointments',
    'manage_appointments'
  ],
  agent: [
    'view_all_patients',
    'edit_patient_admin',
    'view_appointments',
    'manage_appointments',
    'view_billing',
    'manage_billing'
  ],
  patient: []
};

export const hasPermission = (user: User | null, permission: Permission): boolean => {
  if (!user) return false;
  
  const userPermissions = rolePermissions[user.role] || [];
  return userPermissions.includes(permission);
};

export const requirePermission = (user: User | null, permission: Permission): boolean => {
  if (!hasPermission(user, permission)) {
    throw new Error(`Accès refusé. Permission requise: ${permission}`);
  }
  return true;
};

// Hook pour vérifier les permissions dans les composants
export const usePermissions = (user: User | null) => {
  return {
    hasPermission: (permission: Permission) => hasPermission(user, permission),
    requirePermission: (permission: Permission) => requirePermission(user, permission),
    canViewMedicalData: () => hasPermission(user, 'view_medical_records'),
    canCreateConsultation: () => hasPermission(user, 'create_consultation'),
    canManageBilling: () => hasPermission(user, 'manage_billing'),
    canAccessAdminSettings: () => hasPermission(user, 'admin_settings')
  };
};
