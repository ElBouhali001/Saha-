
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  consultationId?: string;
  patientName?: string;
  patientId?: string;
}

const ConsultationForm: React.FC<ConsultationFormProps> = ({ 
  consultation, 
  onConsultationChange,
  consultationId,
  patientName,
  patientId
}) => {
  const handleFieldChange = (field: keyof ConsultationData, value: string) => {
    onConsultationChange({
      ...consultation,
      [field]: value
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Consultation Médicale
          </CardTitle>
          {consultationId && patientName && (
            <Button 
              variant="outline" 
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
              onClick={() => console.log('Actions à implémenter')}
            >
              Actions consultation
            </Button>
          )}
        </div>
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
