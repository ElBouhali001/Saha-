
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface InvoiceDetails {
  paymentMethod: string;
  notes: string;
}

interface InvoiceDetailsSectionProps {
  invoiceDetails: InvoiceDetails;
  onUpdate: (field: keyof InvoiceDetails, value: string) => void;
}

const InvoiceDetailsSection: React.FC<InvoiceDetailsSectionProps> = ({
  invoiceDetails,
  onUpdate
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="payment-method">Mode de paiement</Label>
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
