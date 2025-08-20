export type SubscriptionPlan = 'freemium' | 'pro' | 'enterprise';

export interface PlanFeatures {
  id: SubscriptionPlan;
  name: string;
  description: string;
  price: string;
  modules: string[];
  features: string[];
  aiFeatures: boolean;
  maxUsers?: number;
}

export const PLAN_DEFINITIONS: Record<SubscriptionPlan, PlanFeatures> = {
  'freemium': {
    id: 'freemium',
    name: 'Freemium',
    description: 'Plan gratuit pour débuter',
    price: 'Gratuit',
    modules: [
      'auth',
      'patient-management',
      'appointment-scheduling',
      'medical-consultation'
    ],
    features: [
      'Gestion des patients illimitée',
      'Planning et rendez-vous',
      'Consultations médicales de base',
      'Interface patient',
      '5 utilisateurs maximum'
    ],
    aiFeatures: false,
    maxUsers: 5
  },
  'pro': {
    id: 'pro',
    name: 'Professionnel',
    description: 'Pour les cabinets médicaux',
    price: '89€/mois',
    modules: [
      'auth',
      'patient-management',
      'appointment-scheduling',
      'medical-consultation',
      'billing-invoicing'
    ],
    features: [
      'Toutes les fonctionnalités Freemium',
      'IA pour la consultation médicale',
      'Facturation et paiements',
      'Gestion des agents',
      'Utilisateurs illimités'
    ],
    aiFeatures: true,
    maxUsers: undefined
  },
  'enterprise': {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Solution complète pour hôpitaux',
    price: '249€/mois',
    modules: [
      'auth',
      'patient-management',
      'appointment-scheduling',
      'medical-consultation',
      'billing-invoicing',
      'inventory-management',
      'ai-assistant',
      'laboratory-integration',
      'pharmacy-integration',
      'transmission-referrals',
      'admin'
    ],
    features: [
      'Toutes les fonctionnalités Pro',
      'Gestion complète des stocks',
      'Assistant IA avancé',
      'Intégrations laboratoires/pharmacies',
      'Transmissions sécurisées',
      'Administration avancée',
      'Support prioritaire'
    ],
    aiFeatures: true,
    maxUsers: undefined
  }
};

export const getModulesForPlan = (plan: SubscriptionPlan): string[] => {
  return PLAN_DEFINITIONS[plan]?.modules || [];
};

export const isPlanFeatureEnabled = (plan: SubscriptionPlan, feature: string): boolean => {
  const planDef = PLAN_DEFINITIONS[plan];
  return planDef?.features.includes(feature) || false;
};

export const isModuleAvailableInPlan = (plan: SubscriptionPlan, moduleId: string): boolean => {
  return getModulesForPlan(plan).includes(moduleId);
};

export const getAIAvailability = (plan: SubscriptionPlan): boolean => {
  return PLAN_DEFINITIONS[plan]?.aiFeatures || false;
};