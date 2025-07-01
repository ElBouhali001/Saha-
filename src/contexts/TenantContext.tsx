
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Tenant, TenantRow, mapTenantFromDb } from '@/types/tenant';
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
      
      // Si pas de subdomain ou si c'est une URL Lovable, utiliser le premier tenant
      if (!currentSubdomain || isLovablePreviewUrl()) {
        console.log('Mode développement ou URL Lovable - utilisation du premier tenant disponible');
        
        const { data, error } = await supabase
          .from('tenants')
          .select('*')
          .order('created_at')
          .limit(1);
          
        if (error) {
          console.error('Erreur lors de la récupération du tenant:', error);
          toast({
            title: "Erreur",
            description: "Impossible de charger l'organisation",
            variant: "destructive",
          });
          return;
        }
        
        if (!data || data.length === 0) {
          console.error('Aucun tenant trouvé');
          toast({
            title: "Aucune organisation",
            description: "Aucune organisation n'est configurée",
            variant: "destructive",
          });
          return;
        }
        
        const mappedTenant = mapTenantFromDb(data[0] as TenantRow);
        setTenant(mappedTenant);
        await setCurrentTenant(mappedTenant.id);
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

      const mappedTenant = mapTenantFromDb(data as TenantRow);
      setTenant(mappedTenant);
      await setCurrentTenant(mappedTenant.id);
      
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

  const isLovablePreviewUrl = (): boolean => {
    const hostname = window.location.hostname;
    // Vérifier si c'est une URL de prévisualisation Lovable
    return hostname.includes('lovableproject.com') || 
           hostname.match(/^[a-f0-9-]+\.lovableproject\.com$/);
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
    setTenant: (newTenant: Tenant | null) => {
      setTenant(newTenant);
      if (newTenant) {
        setCurrentTenant(newTenant.id);
      }
    },
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
