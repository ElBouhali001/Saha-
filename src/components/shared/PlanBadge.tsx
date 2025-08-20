import React from 'react';
import { usePlan } from '@/contexts/PlanContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Zap, Gift, ArrowUp } from 'lucide-react';

interface PlanBadgeProps {
  showUpgrade?: boolean;
  compact?: boolean;
}

const PlanBadge: React.FC<PlanBadgeProps> = ({ showUpgrade = false, compact = true }) => {
  const { currentPlan, planFeatures, canUpgrade } = usePlan();

  const getPlanIcon = () => {
    switch (currentPlan) {
      case 'freemium':
        return <Gift className="w-4 h-4" />;
      case 'pro':
        return <Zap className="w-4 h-4" />;
      case 'enterprise':
        return <Crown className="w-4 h-4" />;
      default:
        return <Gift className="w-4 h-4" />;
    }
  };

  const getPlanColor = () => {
    switch (currentPlan) {
      case 'freemium':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'pro':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'enterprise':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline" className={`${getPlanColor()} flex items-center gap-1`}>
          {getPlanIcon()}
          {planFeatures.name}
        </Badge>
        {showUpgrade && canUpgrade && (
          <Button size="sm" variant="outline" className="text-xs">
            <ArrowUp className="w-3 h-3 mr-1" />
            Upgrade
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {getPlanIcon()}
          Plan {planFeatures.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-2xl font-bold text-gray-900">
          {planFeatures.price}
        </div>
        
        <div className="space-y-2">
          {planFeatures.features.slice(0, 3).map((feature, index) => (
            <div key={index} className="flex items-center text-sm text-gray-600">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
              {feature}
            </div>
          ))}
        </div>

        {showUpgrade && canUpgrade && (
          <Button className="w-full mt-4" size="sm">
            <ArrowUp className="w-4 h-4 mr-2" />
            Passer au plan supérieur
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default PlanBadge;