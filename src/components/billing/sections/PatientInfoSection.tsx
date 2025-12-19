
import React, { useState, useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, ChevronsUpDown, Shield, User, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMockPatientSearch, MOCK_INSURANCES, MockPatient } from '@/hooks/useMockInsuranceData';

interface PatientInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
  coverage: string;
  insuranceId?: string;
  patientId?: string;
}

interface PatientInfoSectionProps {
  patientInfo: PatientInfo;
  onUpdate: (field: keyof PatientInfo, value: string) => void;
  onCoverageChange: (coverage: string) => void;
  dueDate: string;
  onDueDateChange: (date: string) => void;
  onPatientSelect?: (patient: MockPatient | null) => void;
}

const PatientInfoSection: React.FC<PatientInfoSectionProps> = ({
  patientInfo,
  onUpdate,
  onCoverageChange,
  dueDate,
  onDueDateChange,
  onPatientSelect
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { patients, searchPatients, getPatientInsurance } = useMockPatientSearch();

  // Rechercher les patients selon la requête
  const filteredPatients = useMemo(() => {
    if (searchQuery.length < 2) return patients.slice(0, 5);
    return searchPatients(searchQuery);
  }, [searchQuery, patients, searchPatients]);

  // Patient sélectionné
  const selectedPatient = useMemo(() => {
    if (!patientInfo.patientId) return null;
    return patients.find(p => p.id === patientInfo.patientId) || null;
  }, [patientInfo.patientId, patients]);

  // Assurance du patient sélectionné
  const patientInsurance = useMemo(() => {
    if (!selectedPatient) return null;
    return getPatientInsurance(selectedPatient.id);
  }, [selectedPatient, getPatientInsurance]);

  const handlePatientSelect = (patient: MockPatient) => {
    const insurance = getPatientInsurance(patient.id);
    
    onUpdate('patientId', patient.id);
    onUpdate('name', `${patient.firstName} ${patient.lastName}`);
    onUpdate('phone', patient.phone);
    onUpdate('email', patient.email);
    
    // Auto-sélectionner la mutuelle si le patient en a une
    if (insurance) {
      onUpdate('insuranceId', insurance.insurance.id);
      onUpdate('coverage', 'mutuelle');
      onCoverageChange('mutuelle');
    } else {
      onUpdate('insuranceId', '');
      onUpdate('coverage', 'autre');
      onCoverageChange('autre');
    }
    
    onPatientSelect?.(patient);
    setOpen(false);
  };

  const handleCoverageChange = (value: string) => {
    onUpdate('coverage', value);
    onCoverageChange(value);
    
    // Réinitialiser l'assurance si on passe à "autre"
    if (value === 'autre') {
      onUpdate('insuranceId', '');
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Recherche et sélection de patient */}
        <div className="space-y-2">
          <Label>Patient *</Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between"
              >
                {selectedPatient ? (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedPatient.firstName} {selectedPatient.lastName}</span>
                    {patientInsurance && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        <Shield className="h-3 w-3 mr-1" />
                        {patientInsurance.insurance.name}
                      </Badge>
                    )}
                  </div>
                ) : (
                  <span className="text-muted-foreground">Rechercher un patient...</span>
                )}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput 
                  placeholder="Rechercher par nom ou téléphone..." 
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                />
                <CommandList>
                  <CommandEmpty>Aucun patient trouvé.</CommandEmpty>
                  <CommandGroup heading="Patients">
                    {filteredPatients.map((patient) => {
                      const insurance = getPatientInsurance(patient.id);
                      return (
                        <CommandItem
                          key={patient.id}
                          value={`${patient.firstName} ${patient.lastName}`}
                          onSelect={() => handlePatientSelect(patient)}
                          className="cursor-pointer"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedPatient?.id === patient.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {patient.firstName} {patient.lastName}
                              </span>
                              {insurance ? (
                                <Badge variant="outline" className="text-xs text-green-600 border-green-500">
                                  <Shield className="h-3 w-3 mr-1" />
                                  Assuré
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-500">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Sans mutuelle
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{patient.phone}</p>
                          </div>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Type de prise en charge */}
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

        {/* Téléphone */}
        <div className="space-y-2">
          <Label htmlFor="patient-phone">Téléphone</Label>
          <Input
            id="patient-phone"
            value={patientInfo.phone}
            onChange={(e) => onUpdate('phone', e.target.value)}
            placeholder="+225 XX XX XX XX XX"
            readOnly={!!selectedPatient}
            className={selectedPatient ? 'bg-muted' : ''}
          />
        </div>

        {/* Date d'échéance */}
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

      {/* Sélection d'assurance pour Tranche A et B */}
      {(patientInfo.coverage === 'mutuelle' || patientInfo.coverage === 'tiers-payant') && (
        <div className="space-y-2">
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
              {MOCK_INSURANCES.map((insurance) => (
                <SelectItem key={insurance.id} value={insurance.id}>
                  <div className="flex items-center justify-between gap-4">
                    <span>{insurance.name}</span>
                    <Badge variant="secondary">{insurance.coverageRate}%</Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Afficher les détails de la mutuelle du patient si sélectionné automatiquement */}
          {patientInsurance && selectedPatient && (
            <div className="mt-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-primary" />
                <span className="font-medium">Mutuelle détectée automatiquement</span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div>
                  <span className="font-medium">Formule:</span> {patientInsurance.plan?.name || 'Standard'}
                </div>
                <div>
                  <span className="font-medium">Couverture:</span> {patientInsurance.plan?.coverageRate || patientInsurance.insurance.coverageRate}%
                </div>
                <div>
                  <span className="font-medium">N° Police:</span> {patientInsurance.policyNumber}
                </div>
                <div>
                  <span className="font-medium">Plafond:</span> {(patientInsurance.plan?.annualLimit || patientInsurance.insurance.annualLimit).toLocaleString()} FCFA
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PatientInfoSection;
