import React from 'react';
import { usePlan } from '@/contexts/PlanContext';
import { SubscriptionPlan } from '@/types/plans';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Zap, Crown } from 'lucide-react';

interface PlanGuardProps {
  children: React.ReactNode;
  requiredPlan: SubscriptionPlan;
  feature?: string;
  fallback?: React.ReactNode;
}

const PlanGuard: React.FC<PlanGuardProps> = ({ 
  children, 
  requiredPlan, 
  feature, 
  fallback 
}) => {
  const { currentPlan, canUpgrade, planFeatures } = usePlan();

  const planHierarchy: Record<SubscriptionPlan, number> = {
    freemium: 1,
    pro: 2,
    enterprise: 3
  };

  const hasAccess = planHierarchy[currentPlan] >= planHierarchy[requiredPlan];

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  const getUpgradeIcon = () => {
    switch (requiredPlan) {
      case 'pro':
        return <Zap className="w-6 h-6 text-blue-500" />;
      case 'enterprise':
        return <Crown className="w-6 h-6 text-purple-500" />;
      default:
        return <Lock className="w-6 h-6 text-gray-500" />;
    }
  };

  const getUpgradeMessage = () => {
    const planName = requiredPlan === 'pro' ? 'Professionnel' : 'Enterprise';
    return feature 
      ? `Cette fonctionnalité (${feature}) nécessite le plan ${planName}.`
      : `Cette section nécessite le plan ${planName}.`;
  };

  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            {getUpgradeIcon()}
          </div>
          <CardTitle className="text-xl">
            Plan {requiredPlan === 'pro' ? 'Professionnel' : 'Enterprise'} requis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            {getUpgradeMessage()}
          </p>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700 mb-2">
              <strong>Plan actuel :</strong> {planFeatures.name}
            </p>
            <p className="text-sm text-gray-600">
              Passez au plan {requiredPlan === 'pro' ? 'Professionnel' : 'Enterprise'} pour débloquer cette fonctionnalité.
            </p>
          </div>

          {canUpgrade && (
            <Button className="w-full" size="lg">
              Passer au plan {requiredPlan === 'pro' ? 'Professionnel' : 'Enterprise'}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PlanGuard;