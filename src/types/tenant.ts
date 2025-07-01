
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
