
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Tenant } from '@/types/tenant';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface TenantContextType {
  tenant: Tenant | null;
  setTenant: (tenant: Tenant | null) => void;
  isLoading: boolean;
  resolveTenant: (subdomain?: string) => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

interface TenantProviderProps {
  children: ReactNode;
}

export const TenantProvider: React.FC<TenantProviderProps> = ({ children }) => {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const resolveTenant = async (subdomain?: string) => {
    try {
      setIsLoading(true);
      
      // Extraire le subdomain depuis l'URL si pas fourni
      const currentSubdomain = subdomain || extractSubdomain();
      
      if (!currentSubdomain) {
        // Mode développement - utiliser le premier tenant
        const { data, error } = await supabase
          .from('tenants')
          .select('*')
          .limit(1)
          .single();
          
        if (error) {
          console.error('Erreur lors de la récupération du tenant:', error);
          toast({
            title: "Erreur",
            description: "Impossible de charger l'organisation",
            variant: "destructive",
          });
          return;
        }
        
        setTenant(data);
        await setCurrentTenant(data.id);
        return;
      }

      // Rechercher le tenant par subdomain
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('subdomain', currentSubdomain)
        .single();

      if (error) {
        console.error('Tenant non trouvé:', error);
        toast({
          title: "Organisation non trouvée",
          description: `Le sous-domaine "${currentSubdomain}" n'existe pas`,
          variant: "destructive",
        });
        return;
      }

      setTenant(data);
      await setCurrentTenant(data.id);
      
    } catch (error) {
      console.error('Erreur lors de la résolution du tenant:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors du chargement de l'organisation",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const extractSubdomain = (): string | null => {
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    
    // localhost ou IP - pas de subdomain
    if (hostname === 'localhost' || hostname.match(/^\d+\.\d+\.\d+\.\d+$/)) {
      return null;
    }
    
    // Extraire le subdomain (premier segment)
    if (parts.length > 2) {
      return parts[0];
    }
    
    return null;
  };

  const setCurrentTenant = async (tenantId: string) => {
    try {
      // Appeler la fonction PostgreSQL pour définir le tenant courant
      const { error } = await supabase.rpc('set_current_tenant', {
        tenant_id: tenantId
      });
      
      if (error) {
        console.error('Erreur lors de la définition du tenant courant:', error);
      }
    } catch (error) {
      console.error('Erreur lors de la définition du tenant courant:', error);
    }
  };

  useEffect(() => {
    resolveTenant();
  }, []);

  const value = {
    tenant,
    setTenant,
    isLoading,
    resolveTenant,
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = (): TenantContextType => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};
