
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ConsultationTicket {
  type: string;
  basePrice: number;
}

interface ConsultationType {
  value: string;
  label: string;
  price: number;
}

interface ConsultationTypeSectionProps {
  consultationTicket: ConsultationTicket;
  consultationTypes: ConsultationType[];
  onUpdate: (newType: string) => void;
}

const ConsultationTypeSection: React.FC<ConsultationTypeSectionProps> = ({
  consultationTicket,
  consultationTypes,
  onUpdate
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="consultation-type">Type de consultation</Label>
      <Select value={consultationTicket.type} onValueChange={onUpdate}>
        <SelectTrigger>
          <SelectValue placeholder="Sélectionner le type de consultation" />
        </SelectTrigger>
        <SelectContent>
          {consultationTypes.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              {type.label} - {type.price.toLocaleString()} CFA
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ConsultationTypeSection;
