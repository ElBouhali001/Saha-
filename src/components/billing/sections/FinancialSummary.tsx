
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calculator, Send, CreditCard, User } from 'lucide-react';

interface FinancialSummaryProps {
  subtotal: number;
  tax: number;
  total: number;
  coverage: string;
  coverageRate?: number;
}

const FinancialSummary: React.FC<FinancialSummaryProps> = ({
  subtotal,
  tax,
  total,
  coverage,
  coverageRate = 70
}) => {
  const calculateAmounts = () => {
    const totalWithTax = subtotal + tax;
    
    switch (coverage) {
      case 'mutuelle':
        return {
          patientAmount: 0,
          insuranceAmount: totalWithTax,
          showSplit: false
        };
      case 'tiers-payant':
        const patientPortion = totalWithTax * ((100 - coverageRate) / 100);
        const insurancePortion = totalWithTax * (coverageRate / 100);
        return {
          patientAmount: Math.round(patientPortion),
          insuranceAmount: Math.round(insurancePortion),
          showSplit: true
        };
      default:
        return {
          patientAmount: totalWithTax,
          insuranceAmount: 0,
          showSplit: false
        };
    }
  };

  const { patientAmount, insuranceAmount, showSplit } = calculateAmounts();

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg">
          <Calculator className="w-5 h-5 mr-2 text-blue-600" />
          Résumé Financier
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Détail des montants */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Sous-total</span>
            <span className="font-medium">{subtotal.toLocaleString()} CFA</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">TVA (18%)</span>
            <span className="font-medium">{tax.toLocaleString()} CFA</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{total.toLocaleString()} CFA</span>
          </div>
        </div>

        <Separator />

        {/* Répartition selon le type de prise en charge */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700">Répartition des paiements</h4>
          
          {coverage === 'mutuelle' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-green-100 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Send className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-800">Mutuelle</span>
                </div>
                <Badge className="bg-green-600 text-white">
                  {insuranceAmount.toLocaleString()} CFA
                </Badge>
              </div>
              <p className="text-xs text-gray-600">
                Transmission automatique - Aucun paiement patient
              </p>
            </div>
          )}

          {coverage === 'tiers-payant' && showSplit && (
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-orange-100 rounded-lg">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-orange-600" />
                  <span className="font-medium text-orange-800">Patient ({100 - coverageRate}%)</span>
                </div>
                <Badge className="bg-orange-600 text-white">
                  {patientAmount.toLocaleString()} CFA
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-100 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Send className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-800">Mutuelle ({coverageRate}%)</span>
                </div>
                <Badge className="bg-blue-600 text-white">
                  {insuranceAmount.toLocaleString()} CFA
                </Badge>
              </div>
              <p className="text-xs text-gray-600">
                Paiement patient immédiat + transmission automatique du solde
              </p>
            </div>
          )}

          {coverage === 'autre' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-4 h-4 text-gray-600" />
                  <span className="font-medium text-gray-800">Patient (100%)</span>
                </div>
                <Badge className="bg-gray-600 text-white">
                  {patientAmount.toLocaleString()} CFA
                </Badge>
              </div>
              <p className="text-xs text-gray-600">
                Paiement intégral selon le mode choisi
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialSummary;
