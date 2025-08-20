import { useState } from 'react';
import { SubscriptionPlan } from '@/types/plans';

const STORAGE_KEY = 'medipatient_test_plan';

export const usePlanTesting = () => {
  const [testPlan, setTestPlan] = useState<SubscriptionPlan | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn('Erreur lors de la lecture du plan de test:', error);
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  });

  const setTestingPlan = (plan: SubscriptionPlan | null) => {
    setTestPlan(plan);
    if (plan) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const clearTestingPlan = () => {
    setTestingPlan(null);
  };

  const isTestingMode = testPlan !== null;

  return {
    testPlan,
    setTestingPlan,
    clearTestingPlan,
    isTestingMode
  };
};