import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, User, Phone, Calendar, MapPin, FileText, Clock } from 'lucide-react';
import { useDemoPatients, DemoPatient } from '@/hooks/useDemoPatients';

interface PatientListProps {
  onPatientSelect: (patient: DemoPatient) => void;
}

const PatientList: React.FC<PatientListProps> = ({ onPatientSelect }) => {
  const { patients, searchPatients } = useDemoPatients();
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredPatients = searchPatients(searchTerm);

  const getUrgencyColor = (level?: string) => {
    switch (level) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getUrgencyLabel = (level?: string) => {
    switch (level) {
      case 'high': return 'Priorité haute';
      case 'medium': return 'Priorité moyenne';
      case 'low': return 'Priorité basse';
      default: return 'Non défini';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Liste des Patients</h1>
        <div className="text-sm text-gray-500">
          {filteredPatients.length} patient{filteredPatients.length > 1 ? 's' : ''}
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Rechercher par nom, téléphone ou email..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredPatients.map((patient) => (
          <Card key={patient.id} className="hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => onPatientSelect(patient)}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-blue-600" />
                  <span>{patient.firstName} {patient.lastName}</span>
                </CardTitle>
                <Badge variant={getUrgencyColor(patient.urgencyLevel)}>
                  {getUrgencyLabel(patient.urgencyLevel)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  {patient.phone}
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  {new Date(patient.dateOfBirth).toLocaleDateString('fr-FR')}
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  {patient.address}
                </div>
                <div className="flex items-center text-gray-600">
                  <FileText className="w-4 h-4 mr-2" />
                  {patient.consultations} consultations
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  Dernière visite: {new Date(patient.lastVisit).toLocaleDateString('fr-FR')}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPatientSelect(patient);
                  }}
                >
                  Voir la fiche
                </Button>
              </div>
              
              {patient.primaryDoctor && (
                <div className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  Médecin traitant: {patient.primaryDoctor}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPatients.length === 0 && (
        <div className="text-center py-12">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun patient trouvé</h3>
          <p className="text-gray-600">
            {searchTerm 
              ? "Essayez de modifier votre recherche" 
              : "La liste des patients est vide"}
          </p>
        </div>
      )}
    </div>
  );
};

export default PatientList;