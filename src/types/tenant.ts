
export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  subscription_plan: 'basic' | 'professional' | 'enterprise';
  subscription_status: 'active' | 'suspended' | 'cancelled';
  subscription_valid_until?: string;
  subscription_seats: number;
  settings: {
    timezone: string;
    language: string;
    features: string[];
  };
  created_at: string;
  updated_at: string;
}

// Type for database row that matches Supabase generated types
export interface TenantRow {
  id: string;
  name: string;
  subdomain: string;
  subscription_plan: string;
  subscription_status: string;
  subscription_valid_until: string | null;
  subscription_seats: number;
  settings: any;
  created_at: string;
  updated_at: string;
}

// Helper function to convert database row to Tenant
export function mapTenantFromDb(row: TenantRow): Tenant {
  return {
    id: row.id,
    name: row.name,
    subdomain: row.subdomain,
    subscription_plan: row.subscription_plan as 'basic' | 'professional' | 'enterprise',
    subscription_status: row.subscription_status as 'active' | 'suspended' | 'cancelled',
    subscription_valid_until: row.subscription_valid_until || undefined,
    subscription_seats: row.subscription_seats,
    settings: typeof row.settings === 'object' ? row.settings : {
      timezone: 'Europe/Paris',
      language: 'fr',
      features: []
    },
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export interface GlobalPatient {
  id: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  social_security_number_hash: string;
  unique_hash: string;
  created_at: string;
  created_by_tenant_id: string;
}

export interface PatientTenantAccess {
  id: string;
  global_patient_id: string;
  tenant_id: string;
  local_patient_id?: string;
  access_level: 'full' | 'readonly' | 'emergency';
  consent_status: 'granted' | 'pending' | 'refused';
  consent_date?: string;
  created_at: string;
}

export interface PatientAccessRequest {
  id: string;
  global_patient_id: string;
  requesting_tenant_id: string;
  owning_tenant_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  request_reason?: string;
  response_message?: string;
  requested_at: string;
  responded_at?: string;
  expires_at: string;
}

export interface TenantSecurityConfig {
  id: string;
  tenant_id: string;
  auth_providers: string[];
  mfa_required: boolean;
  mfa_types: string[];
  session_timeout: number;
  password_min_length: number;
  password_require_uppercase: boolean;
  password_require_numbers: boolean;
  password_require_special_chars: boolean;
  ip_whitelist?: string[];
  allowed_domains?: string[];
  max_failed_attempts: number;
  lockout_duration: number;
  audit_enabled: boolean;
  audit_retention_days: number;
  encrypted_fields: string[];
  created_at: string;
  updated_at: string;
}
