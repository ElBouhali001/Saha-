
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInsuranceCompanies } from '@/hooks/useInsurances';

interface PatientInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
  coverage: string;
  insuranceId?: string;
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
  const { data: insurances = [], isLoading: insurancesLoading } = useInsuranceCompanies();
  
  const handleCoverageChange = (value: string) => {
    onUpdate('coverage', value);
    onCoverageChange(value);
    // Réinitialiser l'assurance sélectionnée quand on change de type de prise en charge
    if (value !== 'mutuelle' && value !== 'tiers-payant') {
      onUpdate('insuranceId', '');
    }
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
      
      {/* Sélection d'assurance pour Tranche A et B */}
      {(patientInfo.coverage === 'mutuelle' || patientInfo.coverage === 'tiers-payant') && (
        <div className="space-y-2 col-span-1 md:col-span-2">
          <Label htmlFor="insurance-select">
            {patientInfo.coverage === 'mutuelle' ? 'Mutuelle/Assurance *' : 'Assurance Tiers Payant *'}
          </Label>
          <Select 
            value={patientInfo.insuranceId || ''} 
            onValueChange={(value) => onUpdate('insuranceId', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une assurance..." />
            </SelectTrigger>
            <SelectContent>
              {insurancesLoading ? (
                <SelectItem value="loading" disabled>Chargement...</SelectItem>
              ) : (
                insurances.map((insurance) => (
                  <SelectItem key={insurance.id} value={insurance.id}>
                    {insurance.name} - {insurance.coverage_rate}% de couverture
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

export default PatientInfoSection;
