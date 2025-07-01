
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Info, Send } from 'lucide-react';

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

  const getCoverageInfo = (coverage: string) => {
    switch (coverage) {
      case 'mutuelle':
        return {
          icon: <Send className="w-4 h-4" />,
          text: 'Transmission automatique à la mutuelle',
          color: 'bg-green-100 text-green-800'
        };
      case 'tiers-payant':
        return {
          icon: <Send className="w-4 h-4" />,
          text: 'Paiement partiel patient + transmission mutuelle',
          color: 'bg-blue-100 text-blue-800'
        };
      default:
        return {
          icon: <Info className="w-4 h-4" />,
          text: 'Paiement direct patient',
          color: 'bg-orange-100 text-orange-800'
        };
    }
  };

  const coverageInfo = getCoverageInfo(patientInfo.coverage);

  return (
    <div className="space-y-4">
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

      {/* Information sur le mode de traitement */}
      <div className="p-4 bg-gray-50 rounded-lg border">
        <div className="flex items-center space-x-2 mb-2">
          <Info className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-gray-700">Mode de traitement</span>
        </div>
        <Badge className={`${coverageInfo.color} flex items-center space-x-1`}>
          {coverageInfo.icon}
          <span>{coverageInfo.text}</span>
        </Badge>
        
        {patientInfo.coverage === 'mutuelle' && (
          <p className="text-sm text-gray-600 mt-2">
            La facture sera automatiquement transmise à la mutuelle pour règlement intégral.
          </p>
        )}
        
        {patientInfo.coverage === 'tiers-payant' && (
          <p className="text-sm text-gray-600 mt-2">
            Le patient règle sa part, le reste est transmis automatiquement à la mutuelle.
          </p>
        )}
        
        {patientInfo.coverage === 'autre' && (
          <p className="text-sm text-gray-600 mt-2">
            Le patient règle l'intégralité de la facture selon le mode de paiement choisi.
          </p>
        )}
      </div>
    </div>
  );
};

export default PatientInfoSection;
