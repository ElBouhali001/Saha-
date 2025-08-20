import React from 'react';
import { usePlan } from '@/contexts/PlanContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Lock, Zap } from 'lucide-react';

interface AIFeatureGuardProps {
  children: React.ReactNode;
  feature?: string;
  fallback?: React.ReactNode;
}

const AIFeatureGuard: React.FC<AIFeatureGuardProps> = ({ 
  children, 
  feature = "IA", 
  fallback 
}) => {
  const { isAIEnabled, currentPlan, canUpgrade } = usePlan();

  if (isAIEnabled) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <Brain className="w-8 h-8 text-gray-400" />
            <Lock className="w-4 h-4 text-gray-500 absolute -bottom-1 -right-1 bg-white rounded-full p-0.5" />
          </div>
        </div>
        <CardTitle className="text-lg">Fonctionnalité IA verrouillée</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-gray-600">
          Les fonctionnalités d'IA ({feature}) nécessitent un plan Professionnel ou Enterprise.
        </p>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-700 mb-2">
            <strong>Plan actuel :</strong> {currentPlan === 'freemium' ? 'Freemium' : currentPlan}
          </p>
          <p className="text-sm text-blue-600">
            Passez au plan Professionnel pour débloquer l'IA dans vos consultations.
          </p>
        </div>

        {canUpgrade && (
          <Button className="w-full" size="lg">
            <Zap className="w-4 h-4 mr-2" />
            Passer au plan Professionnel
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default AIFeatureGuard;