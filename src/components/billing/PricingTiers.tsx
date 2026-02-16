
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';

export interface PricingTier {
  tier: 'A' | 'B' | 'C';
  coverage: string;
  multiplier: number;
  description: string;
  color: string;
}

export const PRICING_TIERS: PricingTier[] = [
  {
    tier: 'A',
    coverage: 'mutuelle',
    multiplier: 1.0,
    description: 'Mutuelle - Prix fort',
    color: 'bg-green-100 text-green-800'
  },
  {
    tier: 'B', 
    coverage: 'tiers-payant',
    multiplier: 0.8,
    description: 'Tiers payant - Prix intermédiaire',
    color: 'bg-blue-100 text-blue-800'
  },
  {
    tier: 'C',
    coverage: 'autre',
    multiplier: 0.6,
    description: 'Autre - Prix réduit',
    color: 'bg-orange-100 text-orange-800'
  }
];

export const getPricingTier = (coverage: string): PricingTier => {
  return PRICING_TIERS.find(tier => tier.coverage === coverage) || PRICING_TIERS[2];
};

export const calculateTieredPrice = (basePrice: number, coverage: string): number => {
  const tier = getPricingTier(coverage);
  return Math.round(basePrice * tier.multiplier);
};

interface PricingTiersDisplayProps {
  selectedCoverage: string;
  basePrice: number;
}

const PricingTiersDisplay: React.FC<PricingTiersDisplayProps> = ({ 
  selectedCoverage, 
  basePrice 
}) => {
  const selectedTier = getPricingTier(selectedCoverage);
  const finalPrice = calculateTieredPrice(basePrice, selectedCoverage);

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-sm font-medium">
          <Info className="w-4 h-4 mr-2 text-blue-600" />
          Tarification par tranches
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          {PRICING_TIERS.map((tier) => (
            <div 
              key={tier.tier}
              className={`p-2 rounded-lg text-center ${
                tier.coverage === selectedCoverage 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white border'
              }`}
            >
              <div className="font-semibold">Tranche {tier.tier}</div>
              <div className="text-xs">{tier.coverage}</div>
              <div className="text-xs">×{tier.multiplier}</div>
            </div>
          ))}
        </div>
        
        <div className="border-t pt-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Tranche appliquée:</span>
            <Badge className={selectedTier.color}>
              {selectedTier.tier} - {selectedTier.description}
            </Badge>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm">Prix de base:</span>
            <span>{basePrice.toLocaleString()} CFA</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Coefficient:</span>
            <span>×{selectedTier.multiplier}</span>
          </div>
          <div className="flex justify-between items-center font-bold text-blue-600 border-t pt-2 mt-2">
            <span>Prix final:</span>
            <span>{finalPrice.toLocaleString()} CFA</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PricingTiersDisplay;
