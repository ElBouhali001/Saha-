
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Minus } from 'lucide-react';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  basePrice: number;
  finalPrice: number;
  total: number;
}

interface InvoiceItemsSectionProps {
  invoiceItems: InvoiceItem[];
  onAddItem: () => void;
  onRemoveItem: (id: string) => void;
  onUpdateItem: (id: string, field: keyof InvoiceItem, value: string | number) => void;
}

const InvoiceItemsSection: React.FC<InvoiceItemsSectionProps> = ({
  invoiceItems,
  onAddItem,
  onRemoveItem,
  onUpdateItem
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Éléments de facturation</h3>
        <Button type="button" onClick={onAddItem} variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-1" />
          Ajouter
        </Button>
      </div>

      <div className="space-y-3">
        {invoiceItems.map((item) => (
          <div key={item.id} className="grid grid-cols-12 gap-3 items-end">
            <div className="col-span-4">
              <Label className="text-xs">Description</Label>
              <Input
                value={item.description}
                onChange={(e) => onUpdateItem(item.id, 'description', e.target.value)}
                placeholder="Consultation, médicament..."
                className="h-9"
              />
            </div>
            <div className="col-span-1">
              <Label className="text-xs">Qté</Label>
              <Input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => onUpdateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                className="h-9"
              />
            </div>
            <div className="col-span-2">
              <Label className="text-xs">Prix de base</Label>
              <Input
                type="number"
                min="0"
                value={item.basePrice}
                onChange={(e) => onUpdateItem(item.id, 'basePrice', parseFloat(e.target.value) || 0)}
                className="h-9"
              />
            </div>
            <div className="col-span-2">
              <Label className="text-xs">Prix appliqué</Label>
              <Input
                value={item.finalPrice.toLocaleString() + ' CFA'}
                readOnly
                className="h-9 bg-blue-50 text-blue-800 font-medium"
              />
            </div>
            <div className="col-span-2">
              <Label className="text-xs">Total</Label>
              <Input
                value={item.total.toLocaleString() + ' CFA'}
                readOnly
                className="h-9 bg-gray-50"
              />
            </div>
            <div className="col-span-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onRemoveItem(item.id)}
                disabled={invoiceItems.length === 1}
                className="h-9 w-9 p-0"
              >
                <Minus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InvoiceItemsSection;
