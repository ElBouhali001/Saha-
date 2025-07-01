
import { useModules } from '@/contexts/ModuleContext';
import { useAuth } from '@/contexts/AuthContext';
import { ModuleId } from '@/types/modules';

export const useModuleAccess = () => {
  const { isModuleEnabled, hasModulePermission } = useModules();
  const { user } = useAuth();

  const canAccessModule = (moduleId: ModuleId): boolean => {
    return isModuleEnabled(moduleId);
  };

  const canAccessRoute = (route: string): boolean => {
    if (!user) return false;
    
    // Vérifier si la route fait partie d'un module activé
    const { modules } = useModules();
    return Object.values(modules).some(module => 
      module.isEnabled && module.routes.includes(route)
    );
  };

  const requireModule = (moduleId: ModuleId): boolean => {
    if (!canAccessModule(moduleId)) {
      throw new Error(`Module ${moduleId} non disponible ou désactivé`);
    }
    return true;
  };

  const getModulePermissions = (moduleId: ModuleId): string[] => {
    if (!isModuleEnabled(moduleId)) return [];
    
    const { modules } = useModules();
    return modules[moduleId]?.permissions || [];
  };

  return {
    canAccessModule,
    canAccessRoute,
    requireModule,
    hasModulePermission,
    getModulePermissions,
    isModuleEnabled
  };
};
