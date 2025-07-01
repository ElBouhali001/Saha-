
import { User } from '@/types/user';
import { ModuleId } from '@/types/modules';

// Extension du système de permissions existant pour inclure les modules
export type ModulePermission = 
  // Auth module
  | 'auth:login'
  | 'auth:manage_users' 
  | 'auth:view_profiles'
  // Patient management
  | 'patients:view'
  | 'patients:create'
  | 'patients:edit'
  | 'patients:delete'
  // Appointments
  | 'appointments:view'
  | 'appointments:create'
  | 'appointments:edit'
  | 'appointments:delete'
  // Medical consultation
  | 'consultations:view'
  | 'consultations:create'
  | 'prescriptions:create'
  // Billing
  | 'billing:view'
  | 'billing:create'
  | 'billing:manage'
  // Inventory
  | 'inventory:view'
  | 'inventory:manage'
  // Laboratory
  | 'lab:view'
  | 'lab:manage'
  | 'lab:results'
  // Pharmacy
  | 'pharmacy:view'
  | 'pharmacy:manage'
  // AI Assistant
  | 'ai:use'
  | 'ai:diagnostics'
  // Transmission
  | 'transmission:create'
  | 'transmission:view'
  | 'transmission:access';

// Permissions par rôle et module
export const moduleRolePermissions: Record<string, Record<ModuleId, ModulePermission[]>> = {
  admin: {
    'auth': ['auth:login', 'auth:manage_users', 'auth:view_profiles'],
    'patient-management': ['patients:view', 'patients:create', 'patients:edit', 'patients:delete'],
    'appointment-scheduling': ['appointments:view', 'appointments:create', 'appointments:edit', 'appointments:delete'],
    'medical-consultation': ['consultations:view', 'consultations:create', 'prescriptions:create'],
    'billing-invoicing': ['billing:view', 'billing:create', 'billing:manage'],
    'inventory-management': ['inventory:view', 'inventory:manage'],
    'laboratory-integration': ['lab:view', 'lab:manage', 'lab:results'],
    'pharmacy-integration': ['pharmacy:view', 'pharmacy:manage'],
    'ai-assistant': ['ai:use', 'ai:diagnostics'],
    'transmission-referrals': ['transmission:create', 'transmission:view', 'transmission:access']
  },
  doctor: {
    'auth': ['auth:login', 'auth:view_profiles'],
    'patient-management': ['patients:view', 'patients:edit'],
    'appointment-scheduling': ['appointments:view', 'appointments:create', 'appointments:edit'],
    'medical-consultation': ['consultations:view', 'consultations:create', 'prescriptions:create'],
    'billing-invoicing': ['billing:view'],
    'inventory-management': ['inventory:view'],
    'laboratory-integration': ['lab:view', 'lab:manage', 'lab:results'],
    'pharmacy-integration': ['pharmacy:view'],
    'ai-assistant': ['ai:use', 'ai:diagnostics'],
    'transmission-referrals': ['transmission:create', 'transmission:view']
  },
  agent: {
    'auth': ['auth:login', 'auth:view_profiles'],
    'patient-management': ['patients:view', 'patients:create', 'patients:edit'],
    'appointment-scheduling': ['appointments:view', 'appointments:create', 'appointments:edit', 'appointments:delete'],
    'medical-consultation': [],
    'billing-invoicing': ['billing:view', 'billing:create', 'billing:manage'],
    'inventory-management': ['inventory:view'],
    'laboratory-integration': [],
    'pharmacy-integration': [],
    'ai-assistant': [],
    'transmission-referrals': []
  },
  patient: {
    'auth': ['auth:login', 'auth:view_profiles'],
    'patient-management': ['patients:view'],
    'appointment-scheduling': ['appointments:view', 'appointments:create'],
    'medical-consultation': ['consultations:view'],
    'billing-invoicing': ['billing:view'],
    'inventory-management': [],
    'laboratory-integration': ['lab:view', 'lab:results'],
    'pharmacy-integration': ['pharmacy:view'],
    'ai-assistant': [],
    'transmission-referrals': []
  },
  lab_technician: {
    'auth': ['auth:login', 'auth:view_profiles'],
    'patient-management': ['patients:view'],
    'appointment-scheduling': ['appointments:view'],
    'medical-consultation': [],
    'billing-invoicing': [],
    'inventory-management': [],
    'laboratory-integration': ['lab:view', 'lab:manage', 'lab:results'],
    'pharmacy-integration': [],
    'ai-assistant': [],
    'transmission-referrals': []
  },
  pharmacist: {
    'auth': ['auth:login', 'auth:view_profiles'],
    'patient-management': ['patients:view'],
    'appointment-scheduling': [],
    'medical-consultation': [],
    'billing-invoicing': [],
    'inventory-management': ['inventory:view', 'inventory:manage'],
    'laboratory-integration': [],
    'pharmacy-integration': ['pharmacy:view', 'pharmacy:manage'],
    'ai-assistant': [],
    'transmission-referrals': []
  }
};

export const hasModulePermission = (
  user: User | null, 
  moduleId: ModuleId, 
  permission: ModulePermission
): boolean => {
  if (!user) return false;
  
  const rolePermissions = moduleRolePermissions[user.role];
  if (!rolePermissions) return false;
  
  const modulePermissions = rolePermissions[moduleId];
  if (!modulePermissions) return false;
  
  return modulePermissions.includes(permission);
};

export const getModulePermissionsForRole = (
  role: string, 
  moduleId: ModuleId
): ModulePermission[] => {
  const rolePermissions = moduleRolePermissions[role];
  if (!rolePermissions) return [];
  
  return rolePermissions[moduleId] || [];
};
