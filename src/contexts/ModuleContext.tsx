
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ModuleConfig, ModuleId, ModuleSettings, MODULE_DEFINITIONS, CORE_MODULES } from '@/types/modules';
import { useAuth } from './AuthContext';

interface ModuleContextType {
  modules: Record<ModuleId, ModuleConfig>;
  isModuleEnabled: (moduleId: ModuleId) => boolean;
  hasModulePermission: (permission: string) => boolean;
  getEnabledModules: () => ModuleConfig[];
  getAvailableRoutes: () => string[];
  updateModuleStatus: (moduleId: ModuleId, enabled: boolean) => Promise<void>;
}

const ModuleContext = createContext<ModuleContextType | undefined>(undefined);

export const useModules = () => {
  const context = useContext(ModuleContext);
  if (!context) {
    throw new Error('useModules must be used within a ModuleProvider');
  }
  return context;
};

export const ModuleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [modules, setModules] = useState<Record<ModuleId, ModuleConfig>>({} as Record<ModuleId, ModuleConfig>);

  // Initialiser les modules par défaut
  useEffect(() => {
    const initializeModules = () => {
      const defaultModules: Record<ModuleId, ModuleConfig> = {} as Record<ModuleId, ModuleConfig>;
      
      Object.entries(MODULE_DEFINITIONS).forEach(([id, config]) => {
        const moduleId = id as ModuleId;
        defaultModules[moduleId] = {
          ...config,
          // Les modules core sont toujours activés, les autres selon la configuration
          isEnabled: CORE_MODULES.includes(moduleId) || getStoredModuleStatus(moduleId)
        };
      });

      setModules(defaultModules);
    };

    initializeModules();
  }, [user]);

  const getStoredModuleStatus = (moduleId: ModuleId): boolean => {
    try {
      const stored = localStorage.getItem(`module_${moduleId}_enabled`);
      return stored ? JSON.parse(stored) : false;
    } catch {
      return false;
    }
  };

  const setStoredModuleStatus = (moduleId: ModuleId, enabled: boolean) => {
    localStorage.setItem(`module_${moduleId}_enabled`, JSON.stringify(enabled));
  };

  const isModuleEnabled = (moduleId: ModuleId): boolean => {
    return modules[moduleId]?.isEnabled || false;
  };

  const hasModulePermission = (permission: string): boolean => {
    if (!user) return false;
    
    // Vérifier si l'utilisateur a la permission dans un module activé
    return Object.values(modules).some(module => 
      module.isEnabled && module.permissions.includes(permission)
    );
  };

  const getEnabledModules = (): ModuleConfig[] => {
    return Object.values(modules).filter(module => module.isEnabled);
  };

  const getAvailableRoutes = (): string[] => {
    const routes: string[] = [];
    Object.values(modules).forEach(module => {
      if (module.isEnabled) {
        routes.push(...module.routes);
      }
    });
    return routes;
  };

  const updateModuleStatus = async (moduleId: ModuleId, enabled: boolean): Promise<void> => {
    // Ne pas permettre de désactiver les modules core
    if (CORE_MODULES.includes(moduleId) && !enabled) {
      throw new Error(`Le module ${moduleId} est obligatoire et ne peut pas être désactivé`);
    }

    // Vérifier les dépendances avant d'activer
    if (enabled) {
      const module = modules[moduleId];
      const missingDependencies = module.dependencies.filter(dep => !isModuleEnabled(dep));
      if (missingDependencies.length > 0) {
        throw new Error(`Dépendances manquantes: ${missingDependencies.join(', ')}`);
      }
    }

    // Vérifier si d'autres modules dépendent de celui-ci avant de le désactiver
    if (!enabled) {
      const dependentModules = Object.values(modules).filter(mod => 
        mod.isEnabled && mod.dependencies.includes(moduleId)
      );
      if (dependentModules.length > 0) {
        throw new Error(`Ce module est requis par: ${dependentModules.map(m => m.name).join(', ')}`);
      }
    }

    setModules(prev => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId],
        isEnabled: enabled
      }
    }));

    setStoredModuleStatus(moduleId, enabled);
  };

  const value: ModuleContextType = {
    modules,
    isModuleEnabled,
    hasModulePermission,
    getEnabledModules,
    getAvailableRoutes,
    updateModuleStatus
  };

  return (
    <ModuleContext.Provider value={value}>
      {children}
    </ModuleContext.Provider>
  );
};
