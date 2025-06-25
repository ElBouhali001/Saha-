
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { User, Shield } from 'lucide-react';

interface PatientInfoDisplayProps {
  patient: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    phone: string;
    medicalHistory: any[];
  };
}

const PatientInfoDisplay: React.FC<PatientInfoDisplayProps> = ({ patient }) => {
  return (
    <Card className="border-green-200">
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="w-5 h-5 mr-2" />
          Patient Authentifié
          <Shield className="w-4 h-4 ml-auto text-green-600" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <Label className="text-sm font-medium">Nom complet</Label>
          <p className="text-sm">{patient.firstName} {patient.lastName}</p>
        </div>
        <div>
          <Label className="text-sm font-medium">Date de naissance</Label>
          <p className="text-sm">{new Date(patient.dateOfBirth).toLocaleDateString('fr-FR')}</p>
        </div>
        <div>
          <Label className="text-sm font-medium">Téléphone</Label>
          <p className="text-sm">{patient.phone}</p>
        </div>
        <div>
          <Label className="text-sm font-medium">Antécédents</Label>
          <p className="text-sm text-gray-600">
            {patient.medicalHistory.length === 0 ? 'Aucun antécédent' : 
             `${patient.medicalHistory.length} consultation(s)`}
          </p>
        </div>
        <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
          <Shield className="w-3 h-3 inline mr-1" />
          Accès autorisé et tracé
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientInfoDisplay;
