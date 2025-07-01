
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';

// Types pour les tables principales
type TableName = 'patients' | 'doctors' | 'appointments' | 'consultations' | 'prescriptions' | 'profiles';

export function useTenantData<T = any>(
  tableName: TableName,
  options?: {
    select?: string;
    filters?: Record<string, any>;
    orderBy?: { column: string; ascending?: boolean };
  }
): UseQueryResult<T[], Error> {
  const { currentTenant } = useTenant();

  return useQuery({
    queryKey: [currentTenant?.id, tableName, options],
    queryFn: async (): Promise<T[]> => {
      if (!currentTenant) {
        throw new Error('Tenant non disponible');
      }

      // Définir le tenant courant pour cette requête
      await supabase.rpc('set_current_tenant', { tenant_id: currentTenant.id });

      let query = supabase
        .from(tableName)
        .select(options?.select || '*');

      // Appliquer les filtres
      if (options?.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      // Appliquer l'ordre
      if (options?.orderBy) {
        query = query.order(options.orderBy.column, { 
          ascending: options.orderBy.ascending ?? true 
        });
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as T[];
    },
    enabled: !!currentTenant,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (remplace cacheTime)
  });
}

export function useTenantSingleData<T = any>(
  tableName: TableName, 
  id: string,
  options?: {
    select?: string;
  }
): UseQueryResult<T | null, Error> {
  const { currentTenant } = useTenant();

  return useQuery({
    queryKey: [currentTenant?.id, tableName, id, options],
    queryFn: async (): Promise<T | null> => {
      if (!currentTenant) {
        throw new Error('Tenant non disponible');
      }

      // Définir le tenant courant pour cette requête
      await supabase.rpc('set_current_tenant', { tenant_id: currentTenant.id });

      const { data, error } = await supabase
        .from(tableName)
        .select(options?.select || '*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as T | null;
    },
    enabled: !!currentTenant && !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
