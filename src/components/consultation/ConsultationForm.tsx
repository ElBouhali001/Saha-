
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileText } from 'lucide-react';

interface ConsultationData {
  symptoms: string;
  diagnosis: string;
  treatment: string;
  notes: string;
}

interface ConsultationFormProps {
  consultation: ConsultationData;
  onConsultationChange: (consultation: ConsultationData) => void;
}

const ConsultationForm: React.FC<ConsultationFormProps> = ({ consultation, onConsultationChange }) => {
  const handleFieldChange = (field: keyof ConsultationData, value: string) => {
    onConsultationChange({
      ...consultation,
      [field]: value
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          Consultation Médicale
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
  );
};

export default ConsultationForm;
