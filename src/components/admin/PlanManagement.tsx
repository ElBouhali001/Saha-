import React from 'react';
import { usePlan } from '@/contexts/PlanContext';
import { useTenant } from '@/contexts/TenantContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PlanBadge from '@/components/shared/PlanBadge';
import { PLAN_DEFINITIONS, SubscriptionPlan } from '@/types/plans';
import { Crown, Zap, Gift, Check, X, ArrowUp } from 'lucide-react';

const PlanManagement: React.FC = () => {
  const { currentPlan, planFeatures, canUpgrade } = usePlan();
  const { currentTenant } = useTenant();

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
        <p className="text-gray-600">
          Gérez votre abonnement et découvrez les fonctionnalités disponibles selon votre plan.
        </p>
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
            {canUpgrade && (
              <Button className="flex items-center gap-2">
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
                
                {planId !== currentPlan && (
                  <Button 
                    className="w-full" 
                    variant={planId === 'enterprise' ? 'default' : 'outline'}
                  >
                    {planId === 'freemium' ? 'Rétrograder' : 'Mettre à niveau'}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

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
                <p className="text-lg font-semibold">{currentTenant.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Nombre d'utilisateurs</p>
                <p className="text-lg font-semibold">
                  {currentTenant.subscription_seats}
                  {planFeatures.maxUsers && ` / ${planFeatures.maxUsers}`}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Statut</p>
                <Badge 
                  variant={currentTenant.subscription_status === 'active' ? 'default' : 'destructive'}
                >
                  {currentTenant.subscription_status === 'active' ? 'Actif' : 'Inactif'}
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