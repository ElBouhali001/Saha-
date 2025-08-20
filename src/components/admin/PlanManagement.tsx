import React, { useState } from 'react';
import { usePlan } from '@/contexts/PlanContext';
import { useTenant } from '@/contexts/TenantContext';
import { usePlanTesting } from '@/hooks/usePlanTesting';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PlanBadge from '@/components/shared/PlanBadge';
import { PLAN_DEFINITIONS, SubscriptionPlan } from '@/types/plans';
import { Crown, Zap, Gift, Check, X, ArrowUp, Settings, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

const PlanManagement: React.FC = () => {
  const { currentPlan, planFeatures, canUpgrade } = usePlan();
  const { currentTenant } = useTenant();
  const { testPlan, setTestingPlan, clearTestingPlan, isTestingMode } = usePlanTesting();
  const [selectedPlan, setSelectedPlan] = useState(currentPlan);

  const handlePlanChange = (newPlan: SubscriptionPlan) => {
    setSelectedPlan(newPlan);
    setTestingPlan(newPlan);
    toast.success(`Plan ${PLAN_DEFINITIONS[newPlan].name} activé pour test!`, {
      description: 'Les fonctionnalités sont maintenant disponibles selon ce plan.'
    });
  };

  const handleResetToOriginal = () => {
    clearTestingPlan();
    setSelectedPlan(currentPlan);
    toast.info('Plan restauré à la configuration originale');
  };

  const simulateUpgrade = (targetPlan: SubscriptionPlan) => {
    toast.success(`Simulation d'upgrade vers le plan ${PLAN_DEFINITIONS[targetPlan].name}`);
  };

  const getPlanIcon = (plan: SubscriptionPlan) => {
    switch (plan) {
      case 'freemium':
        return <Gift className="w-6 h-6 text-gray-500" />;
      case 'pro':
        return <Zap className="w-6 h-6 text-blue-500" />;
      case 'enterprise':
        return <Crown className="w-6 h-6 text-purple-500" />;
    }
  };

  const getPlanCardColor = (plan: SubscriptionPlan) => {
    if (plan === currentPlan) {
      switch (plan) {
        case 'freemium':
          return 'border-gray-300 bg-gray-50';
        case 'pro':
          return 'border-blue-300 bg-blue-50';
        case 'enterprise':
          return 'border-purple-300 bg-purple-50';
      }
    }
    return 'border-gray-200 bg-white hover:border-gray-300';
  };

  const isFeatureIncluded = (plan: SubscriptionPlan, feature: string): boolean => {
    return PLAN_DEFINITIONS[plan].features.some(f => 
      f.toLowerCase().includes(feature.toLowerCase())
    );
  };

  const allFeatures = [
    'Gestion des patients',
    'Planning et rendez-vous',
    'Consultations médicales',
    'IA pour la consultation',
    'Facturation',
    'Gestion des stocks',
    'Assistant IA avancé',
    'Intégrations laboratoires',
    'Intégrations pharmacies',
    'Transmissions sécurisées'
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Plans</h1>
        <div className="flex items-center justify-between">
          <p className="text-gray-600">
            Gérez votre abonnement et découvrez les fonctionnalités disponibles selon votre plan.
          </p>
          {isTestingMode && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                Mode Test Actif
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetToOriginal}
                className="flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Restaurer plan original
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Plan actuel */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Plan Actuel</h2>
        <div className="flex items-center justify-between p-6 bg-white rounded-lg border">
          <div className="flex items-center gap-4">
            {getPlanIcon(currentPlan)}
            <div>
              <h3 className="text-lg font-semibold">{planFeatures.name}</h3>
              <p className="text-gray-600">{planFeatures.description}</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{planFeatures.price}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Plan actif
            </Badge>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => toast.info('Fonctionnalité de test - Plans configurables')}
            >
              <Settings className="w-4 h-4" />
              Configurer
            </Button>
            {canUpgrade && (
              <Button 
                className="flex items-center gap-2"
                onClick={() => simulateUpgrade('enterprise')}
              >
                <ArrowUp className="w-4 h-4" />
                Mettre à niveau
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Comparaison des plans */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Comparaison des Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(PLAN_DEFINITIONS).map(([planId, plan]) => (
            <Card 
              key={planId} 
              className={`relative ${getPlanCardColor(planId as SubscriptionPlan)}`}
            >
              {planId === currentPlan && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-green-500 text-white">Plan actuel</Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  {getPlanIcon(planId as SubscriptionPlan)}
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <p className="text-gray-600 text-sm">{plan.description}</p>
                <div className="text-3xl font-bold text-gray-900 mt-4">
                  {plan.price}
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3 mb-6">
                  {allFeatures.map((feature) => {
                    const included = isFeatureIncluded(planId as SubscriptionPlan, feature);
                    return (
                      <div key={feature} className="flex items-center gap-3">
                        {included ? (
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-gray-300 flex-shrink-0" />
                        )}
                        <span className={`text-sm ${included ? 'text-gray-900' : 'text-gray-400'}`}>
                          {feature}
                        </span>
                      </div>
                    );
                  })}
                </div>
                
                <Button 
                  className="w-full" 
                  variant={planId === currentPlan ? 'secondary' : (planId === 'enterprise' ? 'default' : 'outline')}
                  onClick={() => handlePlanChange(planId as SubscriptionPlan)}
                >
                  {planId === currentPlan && !isTestingMode ? 'Plan actuel' : 
                   (planId === 'freemium' ? 'Activer Freemium' : 
                    planId === 'pro' ? 'Activer Pro' : 'Activer Enterprise')}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Informations de test */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Mode Test - Fonctionnalités
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Plan sélectionné</h4>
              <p className="text-blue-700">{PLAN_DEFINITIONS[selectedPlan].name}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">Modules disponibles</h4>
              <p className="text-green-700">{PLAN_DEFINITIONS[selectedPlan].modules.length} modules</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-2">IA activée</h4>
              <p className="text-purple-700">{PLAN_DEFINITIONS[selectedPlan].aiFeatures ? 'Oui' : 'Non'}</p>
            </div>
          </div>
          <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-yellow-800 text-sm">
              <strong>Note :</strong> Ceci est un environnement de test. Les changements de plan simulent les fonctionnalités disponibles.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Informations du tenant */}
      {currentTenant && (
        <Card>
          <CardHeader>
            <CardTitle>Informations de l'abonnement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Organisation</p>
                <p className="text-lg font-semibold">{currentTenant.name || 'MediPatient Demo'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Nombre d'utilisateurs</p>
                <p className="text-lg font-semibold">
                  {currentTenant.subscription_seats || 1}
                  {planFeatures.maxUsers && ` / ${planFeatures.maxUsers}`}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Statut</p>
                <Badge 
                  variant={currentTenant.subscription_status === 'active' ? 'default' : 'secondary'}
                >
                  {currentTenant.subscription_status === 'active' ? 'Actif' : 'Demo'}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Valide jusqu'à</p>
                <p className="text-lg font-semibold">
                  {currentTenant.subscription_valid_until 
                    ? new Date(currentTenant.subscription_valid_until).toLocaleDateString('fr-FR')
                    : 'Illimité'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PlanManagement;