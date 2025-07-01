
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface Tenant {
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

interface TenantSecurityConfig {
  id: string;
  tenant_id: string;
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
  auth_providers: string[];
}

interface TenantContextType {
  currentTenant: Tenant | null;
  tenantConfig: TenantSecurityConfig | null;
  isLoading: boolean;
  setCurrentTenant: (tenantId: string) => Promise<void>;
  auditLog: (action: string, resourceType?: string, resourceId?: string, details?: any) => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [currentTenant, setCurrentTenantState] = useState<Tenant | null>(null);
  const [tenantConfig, setTenantConfig] = useState<TenantSecurityConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      initializeTenant();
    }
  }, [user]);

  const initializeTenant = async () => {
    try {
      // Pour la démo, utiliser le tenant par défaut
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenants')
        .select('*')
        .eq('subdomain', 'cabinet-martin')
        .single();

      if (tenantError) throw tenantError;

      // Transformer les données pour correspondre à notre interface
      const tenant: Tenant = {
        id: tenantData.id,
        name: tenantData.name,
        subdomain: tenantData.subdomain,
        subscription_plan: tenantData.subscription_plan as 'basic' | 'professional' | 'enterprise',
        subscription_status: tenantData.subscription_status as 'active' | 'suspended' | 'cancelled',
        subscription_valid_until: tenantData.subscription_valid_until,
        subscription_seats: tenantData.subscription_seats,
        settings: typeof tenantData.settings === 'object' ? tenantData.settings as any : {
          timezone: 'Europe/Paris',
          language: 'fr',
          features: []
        },
        created_at: tenantData.created_at,
        updated_at: tenantData.updated_at
      };

      // Définir le tenant courant dans la session
      await supabase.rpc('set_current_tenant', { tenant_id: tenant.id });

      setCurrentTenantState(tenant);

      // Charger la configuration de sécurité
      const { data: config, error: configError } = await supabase
        .from('tenant_security_configs')
        .select('*')
        .eq('tenant_id', tenant.id)
        .single();

      if (configError) throw configError;
      setTenantConfig(config as TenantSecurityConfig);

    } catch (error) {
      console.error('Erreur lors de l\'initialisation du tenant:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setCurrentTenant = async (tenantId: string) => {
    setIsLoading(true);
    try {
      const { data: tenantData, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', tenantId)
        .single();

      if (error) throw error;

      // Transformer les données pour correspondre à notre interface
      const tenant: Tenant = {
        id: tenantData.id,
        name: tenantData.name,
        subdomain: tenantData.subdomain,
        subscription_plan: tenantData.subscription_plan as 'basic' | 'professional' | 'enterprise',
        subscription_status: tenantData.subscription_status as 'active' | 'suspended' | 'cancelled',
        subscription_valid_until: tenantData.subscription_valid_until,
        subscription_seats: tenantData.subscription_seats,
        settings: typeof tenantData.settings === 'object' ? tenantData.settings as any : {
          timezone: 'Europe/Paris',
          language: 'fr',
          features: []
        },
        created_at: tenantData.created_at,
        updated_at: tenantData.updated_at
      };

      // Définir le tenant courant dans la session
      await supabase.rpc('set_current_tenant', { tenant_id: tenantId });

      setCurrentTenantState(tenant);

      // Charger la configuration de sécurité
      const { data: config } = await supabase
        .from('tenant_security_configs')
        .select('*')
        .eq('tenant_id', tenantId)
        .single();

      setTenantConfig(config as TenantSecurityConfig);
    } catch (error) {
      console.error('Erreur lors du changement de tenant:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const auditLog = async (
    action: string,
    resourceType?: string,
    resourceId?: string,
    details?: any
  ) => {
    if (!currentTenant || !tenantConfig?.audit_enabled) return;

    try {
      await supabase.from('tenant_audit_logs').insert({
        tenant_id: currentTenant.id,
        user_id: user?.id,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        details,
        ip_address: '127.0.0.1', // À remplacer par la vraie IP
        user_agent: navigator.userAgent
      });
    } catch (error) {
      console.error('Erreur lors de l\'audit:', error);
    }
  };

  const value: TenantContextType = {
    currentTenant,
    tenantConfig,
    isLoading,
    setCurrentTenant,
    auditLog
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};
