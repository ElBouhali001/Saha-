
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileText } from 'lucide-react';
import ConsultationActions from './ConsultationActions';
import SpecialtyConsultationSections from './SpecialtyConsultationSections';

interface ConsultationData {
  symptoms: string;
  diagnosis: string;
  treatment: string;
  notes: string;
}

interface ConsultationFormProps {
  consultation: ConsultationData;
  onConsultationChange: (consultation: ConsultationData) => void;
  consultationId?: string;
  patientName?: string;
  patientId?: string;
  doctorSpecialty?: string;
  specialtyData?: any;
  onSpecialtyDataChange?: (data: any) => void;
}

const ConsultationForm: React.FC<ConsultationFormProps> = ({ 
  consultation, 
  onConsultationChange,
  consultationId,
  patientName,
  patientId,
  doctorSpecialty,
  specialtyData = {},
  onSpecialtyDataChange = () => {}
}) => {
  const handleFieldChange = (field: keyof ConsultationData, value: string) => {
    onConsultationChange({
      ...consultation,
      [field]: value
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Consultation Médicale
            {doctorSpecialty && doctorSpecialty !== 'Médecine Générale' && (
              <span className="ml-2 text-sm text-muted-foreground">- {doctorSpecialty}</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="symptoms">Symptômes</Label>
            <Textarea
              id="symptoms"
              placeholder="Décrire les symptômes du patient..."
              value={consultation.symptoms}
              onChange={(e) => handleFieldChange('symptoms', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="diagnosis">Diagnostic</Label>
            <Textarea
              id="diagnosis"
              placeholder="Diagnostic établi..."
              value={consultation.diagnosis}
              onChange={(e) => handleFieldChange('diagnosis', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="treatment">Traitement</Label>
            <Textarea
              id="treatment"
              placeholder="Plan de traitement..."
              value={consultation.treatment}
              onChange={(e) => handleFieldChange('treatment', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="notes">Notes additionnelles</Label>
            <Textarea
              id="notes"
              placeholder="Notes complémentaires..."
              value={consultation.notes}
              onChange={(e) => handleFieldChange('notes', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Section spécialisée selon la spécialité du médecin */}
      {doctorSpecialty && doctorSpecialty !== 'Médecine Générale' && (
        <SpecialtyConsultationSections
          specialty={doctorSpecialty}
          specialtyData={specialtyData}
          onSpecialtyDataChange={onSpecialtyDataChange}
          onSymptomsUpdate={(symptoms) => handleFieldChange('symptoms', symptoms)}
          onDiagnosisUpdate={(diagnosis) => handleFieldChange('diagnosis', diagnosis)}
        />
      )}

      {consultationId && patientName && patientId && (
        <ConsultationActions
          consultationId={consultationId}
          patientName={patientName}
          patientId={patientId}
          consultation={consultation}
        />
      )}
    </div>
  );
};

export default ConsultationForm;
