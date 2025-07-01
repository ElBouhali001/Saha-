
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';

type TableName = 'patients' | 'doctors' | 'appointments' | 'consultations' | 'prescriptions' | 'profiles';

export function useTenantData<T>(
  tableName: TableName,
  queryKey: string,
  options?: {
    select?: string;
    filters?: Record<string, any>;
    orderBy?: { column: string; ascending?: boolean };
  }
): UseQueryResult<T[]> {
  const { tenant } = useTenant();

  return useQuery({
    queryKey: [tenant?.id, tableName, queryKey, options],
    queryFn: async () => {
      if (!tenant) {
        throw new Error('Tenant non défini');
      }

      // Définir le tenant courant pour la session
      await supabase.rpc('set_current_tenant', {
        tenant_id: tenant.id
      });

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
      
      if (error) {
        throw error;
      }

      return data as T[];
    },
    enabled: !!tenant,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (updated from cacheTime)
  });
}

export function useTenantPatients() {
  return useTenantData('patients', 'patients', {
    select: `
      *,
      profile:profiles(*)
    `,
    orderBy: { column: 'created_at', ascending: false }
  });
}

export function useTenantDoctors() {
  return useTenantData('doctors', 'doctors', {
    select: `
      *,
      profile:profiles(*),
      doctor_specialties(
        id,
        is_primary,
        specialty:specialties(*)
      )
    `,
    orderBy: { column: 'created_at', ascending: false }
  });
}

export function useTenantAppointments() {
  return useTenantData('appointments', 'appointments', {
    select: `
      *,
      patient:patients(*),
      doctor:doctors(
        *, 
        profile:profiles(*),
        doctor_specialties(
          id,
          is_primary,
          specialty:specialties(*)
        )
      )
    `,
    orderBy: { column: 'appointment_date', ascending: true }
  });
}
