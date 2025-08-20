import { useState, useEffect } from 'react';
import { SubscriptionPlan } from '@/types/plans';

const STORAGE_KEY = 'medipatient_test_plan';

export const usePlanTesting = () => {
  const [testPlan, setTestPlan] = useState<SubscriptionPlan | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored as SubscriptionPlan | null;
  });

  const setTestingPlan = (plan: SubscriptionPlan | null) => {
    setTestPlan(plan);
    if (plan) {
      localStorage.setItem(STORAGE_KEY, plan);
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