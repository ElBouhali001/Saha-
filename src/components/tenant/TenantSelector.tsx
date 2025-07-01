
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, Crown } from 'lucide-react';
import { Tenant } from '@/types/tenant';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';

export const TenantSelector: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { tenant, setTenant } = useTenant();

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .order('name');

      if (error) {
        console.error('Erreur lors de la récupération des tenants:', error);
        return;
      }

      setTenants(data || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des tenants:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTenantChange = (tenantId: string) => {
    const selectedTenant = tenants.find(t => t.id === tenantId);
    if (selectedTenant) {
      setTenant(selectedTenant);
    }
  };

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'enterprise':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'professional':
        return <Building2 className="h-4 w-4 text-blue-500" />;
      default:
        return <Users className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'enterprise':
        return 'bg-yellow-100 text-yellow-800';
      case 'professional':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
        <span className="text-sm text-gray-600">Chargement...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      <div className="flex items-center space-x-2">
        <Building2 className="h-5 w-5 text-gray-500" />
        <Select value={tenant?.id} onValueChange={handleTenantChange}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Sélectionner une organisation" />
          </SelectTrigger>
          <SelectContent>
            {tenants.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                <div className="flex items-center space-x-2">
                  {getPlanIcon(t.subscription_plan)}
                  <span>{t.name}</span>
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${getPlanColor(t.subscription_plan)}`}
                  >
                    {t.subscription_plan}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {tenant && (
        <div className="flex items-center space-x-2">
          <Badge 
            variant={tenant.subscription_status === 'active' ? 'default' : 'destructive'}
            className="text-xs"
          >
            {tenant.subscription_status}
          </Badge>
          <span className="text-xs text-gray-500">
            {tenant.subscription_seats} sièges
          </span>
        </div>
      )}
    </div>
  );
};
