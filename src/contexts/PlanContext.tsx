import React, { createContext, useContext, useMemo } from 'react';
import { useTenant } from './TenantContext';
import { SubscriptionPlan, PLAN_DEFINITIONS, getModulesForPlan, isModuleAvailableInPlan, getAIAvailability } from '@/types/plans';
import { ModuleId } from '@/types/modules';
import { usePlanTesting } from '@/hooks/usePlanTesting';

interface PlanContextType {
  currentPlan: SubscriptionPlan;
  planFeatures: typeof PLAN_DEFINITIONS[SubscriptionPlan];
  availableModules: string[];
  isModuleEnabled: (moduleId: ModuleId) => boolean;
  isAIEnabled: boolean;
  canUpgrade: boolean;
  planLimitations: {
    maxUsers?: number;
    hasAI: boolean;
    hasBilling: boolean;
    hasInventory: boolean;
    hasAdvancedFeatures: boolean;
  };
}

const PlanContext = createContext<PlanContextType | undefined>(undefined);

export const usePlan = () => {
  const context = useContext(PlanContext);
  if (!context) {
    throw new Error('usePlan must be used within a PlanProvider');
  }
  return context;
};

export const PlanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentTenant } = useTenant();
  const { testPlan, isTestingMode } = usePlanTesting();

  const currentPlan: SubscriptionPlan = useMemo(() => {
    // Si on est en mode test, utiliser le plan de test
    if (isTestingMode && testPlan) {
      return testPlan;
    }

    if (!currentTenant) return 'freemium';
    
    // Mapper les anciens plans vers les nouveaux
    switch (currentTenant.subscription_plan) {
      case 'basic':
        return 'freemium';
      case 'professional':
        return 'pro';
      case 'enterprise':
        return 'enterprise';
      default:
        return 'freemium';
    }
  }, [currentTenant, testPlan, isTestingMode]);

  const planFeatures = PLAN_DEFINITIONS[currentPlan];
  const availableModules = getModulesForPlan(currentPlan);
  const isAIEnabled = getAIAvailability(currentPlan);

  const isModuleEnabled = (moduleId: ModuleId): boolean => {
    return isModuleAvailableInPlan(currentPlan, moduleId);
  };

  const canUpgrade = currentPlan !== 'enterprise';

  const planLimitations = {
    maxUsers: planFeatures.maxUsers,
    hasAI: isAIEnabled,
    hasBilling: availableModules.includes('billing-invoicing'),
    hasInventory: availableModules.includes('inventory-management'),
    hasAdvancedFeatures: currentPlan === 'enterprise'
  };

  const value: PlanContextType = {
    currentPlan,
    planFeatures,
    availableModules,
    isModuleEnabled,
    isAIEnabled,
    canUpgrade,
    planLimitations
  };

  return (
    <PlanContext.Provider value={value}>
      {children}
    </PlanContext.Provider>
  );
};