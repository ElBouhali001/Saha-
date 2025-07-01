
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PatientInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
  coverage: string;
}

interface PatientInfoSectionProps {
  patientInfo: PatientInfo;
  onUpdate: (field: keyof PatientInfo, value: string) => void;
  onCoverageChange: (coverage: string) => void;
  dueDate: string;
  onDueDateChange: (date: string) => void;
}

const PatientInfoSection: React.FC<PatientInfoSectionProps> = ({
  patientInfo,
  onUpdate,
  onCoverageChange,
  dueDate,
  onDueDateChange
}) => {
  const handleCoverageChange = (value: string) => {
    onUpdate('coverage', value);
    onCoverageChange(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="patient-name">Nom du Patient *</Label>
        <Input
          id="patient-name"
          value={patientInfo.name}
          onChange={(e) => onUpdate('name', e.target.value)}
          placeholder="Rechercher un patient..."
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="coverage-type">Type de prise en charge *</Label>
        <Select value={patientInfo.coverage} onValueChange={handleCoverageChange}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner la prise en charge" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mutuelle">Mutuelle (Tranche A)</SelectItem>
            <SelectItem value="tiers-payant">Tiers payant (Tranche B)</SelectItem>
            <SelectItem value="autre">Autre (Tranche C)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="patient-phone">Téléphone</Label>
        <Input
          id="patient-phone"
          value={patientInfo.phone}
          onChange={(e) => onUpdate('phone', e.target.value)}
          placeholder="+225 XX XX XX XX XX"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="due-date">Date d'échéance</Label>
        <Input
          id="due-date"
          type="date"
          value={dueDate}
          onChange={(e) => onDueDateChange(e.target.value)}
        />
      </div>
    </div>
  );
};

export default PatientInfoSection;
