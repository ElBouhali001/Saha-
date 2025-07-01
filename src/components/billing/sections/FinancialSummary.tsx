
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface FinancialSummaryProps {
  subtotal: number;
  tax: number;
  total: number;
}

const FinancialSummary: React.FC<FinancialSummaryProps> = ({
  subtotal,
  tax,
  total
}) => {
  return (
    <Card className="bg-gray-50">
      <CardContent className="pt-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Sous-total:</span>
            <span>{subtotal.toLocaleString()} CFA</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>TVA (18%):</span>  
            <span>{tax.toLocaleString()} CFA</span>
          </div>
          <div className="border-t pt-2">
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>{total.toLocaleString()} CFA</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialSummary;
