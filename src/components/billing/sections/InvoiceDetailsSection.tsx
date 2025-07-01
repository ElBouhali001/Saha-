
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Send, CreditCard } from 'lucide-react';

interface InvoiceDetails {
  paymentMethod: string;
  notes: string;
}

interface InvoiceDetailsSectionProps {
  invoiceDetails: InvoiceDetails;
  onUpdate: (field: keyof InvoiceDetails, value: string) => void;
  coverage: string;
}

const InvoiceDetailsSection: React.FC<InvoiceDetailsSectionProps> = ({
  invoiceDetails,
  onUpdate,
  coverage
}) => {
  const shouldShowPaymentMethod = coverage === 'autre';
  const isPartialPayment = coverage === 'tiers-payant';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="payment-method">
          {isPartialPayment ? 'Mode de paiement (Part patient)' : 'Mode de paiement'}
        </Label>
        
        {coverage === 'mutuelle' ? (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <Badge className="bg-green-100 text-green-800 flex items-center space-x-1">
              <Send className="w-4 h-4" />
              <span>Transmission automatique à la mutuelle</span>
            </Badge>
            <p className="text-sm text-green-700 mt-2">
              Aucun paiement patient requis - Traitement automatique
            </p>
          </div>
        ) : shouldShowPaymentMethod || isPartialPayment ? (
          <div className="space-y-2">
            <Select 
              value={invoiceDetails.paymentMethod} 
              onValueChange={(value) => onUpdate('paymentMethod', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le mode de paiement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Espèces</SelectItem>
                <SelectItem value="mobile-money">Mobile Money</SelectItem>
                <SelectItem value="bank-transfer">Virement bancaire</SelectItem>
                <SelectItem value="check">Chèque</SelectItem>
              </SelectContent>
            </Select>
            
            {isPartialPayment && (
              <div className="p-2 bg-blue-50 border border-blue-200 rounded-md">
                <Badge className="bg-blue-100 text-blue-800 flex items-center space-x-1">
                  <CreditCard className="w-4 h-4" />
                  <span>Paiement partiel</span>
                </Badge>
                <p className="text-xs text-blue-700 mt-1">
                  Le solde sera transmis à la mutuelle
                </p>
              </div>
            )}
          </div>
        ) : null}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={invoiceDetails.notes}
          onChange={(e) => onUpdate('notes', e.target.value)}
          placeholder="Notes additionnelles..."
          className="h-20"
        />
      </div>
    </div>
  );
};

export default InvoiceDetailsSection;
