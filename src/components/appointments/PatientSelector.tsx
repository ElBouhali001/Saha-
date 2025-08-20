import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, User, Phone, MapPin } from 'lucide-react';
import { useDemoPatients } from '@/hooks/useDemoPatients';
import { useIntelligentSearch } from '@/hooks/useIntelligentSearch';
import { DemoPatient } from '@/hooks/useDemoPatients';

interface PatientSelectorProps {
  selectedPatient: DemoPatient | null;
  onPatientSelect: (patient: DemoPatient) => void;
  onPatientCreate: (patientData: {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
    address: string;
  }) => void;
}

const PatientSelector: React.FC<PatientSelectorProps> = ({
  selectedPatient,
  onPatientSelect,
  onPatientCreate
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPatientData, setNewPatientData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: ''
  });

  const { patients } = useDemoPatients();
  const searchResults = useIntelligentSearch(patients, searchTerm);

  const handleCreatePatient = () => {
    onPatientCreate(newPatientData);
    setNewPatientData({
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      address: ''
    });
    setIsCreateDialogOpen(false);
    setSearchTerm('');
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'Urgent';
      case 'medium': return 'Modéré';
      default: return 'Normal';
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="patient-search">Patient</Label>
        {selectedPatient ? (
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-blue-900">
                  {selectedPatient.firstName} {selectedPatient.lastName}
                </p>
                <p className="text-sm text-blue-700">{selectedPatient.phone}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPatientSelect(null as any)}
                className="text-blue-700 border-blue-300"
              >
                Changer
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="patient-search"
                placeholder="Rechercher un patient (nom, téléphone, adresse...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {searchTerm && (
              <div className="mt-2 max-h-60 overflow-y-auto space-y-2">
                {searchResults.length > 0 ? (
                  <>
                    <p className="text-sm text-gray-600 px-2">
                      {searchResults.length} patient(s) trouvé(s)
                    </p>
                    {searchResults.map(({ patient, matchedFields, matchedText }) => (
                      <Card
                        key={patient.id}
                        className="cursor-pointer hover:bg-blue-50 transition-colors border-l-4 border-l-blue-500"
                        onClick={() => onPatientSelect(patient)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium text-gray-900">
                                  {patient.firstName} {patient.lastName}
                                </h3>
                                {patient.urgencyLevel && (
                                  <Badge className={`text-xs ${getUrgencyColor(patient.urgencyLevel)}`}>
                                    {getUrgencyLabel(patient.urgencyLevel)}
                                  </Badge>
                                )}
                              </div>

                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Phone className="h-4 w-4" />
                                  <span>{patient.phone}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  <span className="truncate max-w-40">{patient.address}</span>
                                </div>
                              </div>

                              {matchedFields.length > 0 && (
                                <div className="space-y-1">
                                  <div className="flex flex-wrap gap-1">
                                    {matchedFields.map((field, index) => (
                                      <Badge key={index} variant="secondary" className="text-xs">
                                        {field}
                                      </Badge>
                                    ))}
                                  </div>
                                  {matchedText.length > 0 && (
                                    <div className="text-xs text-gray-500 bg-yellow-50 p-2 rounded">
                                      {matchedText.slice(0, 2).join(' • ')}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </>
                ) : (
                  <div className="text-center py-6 space-y-4">
                    <div className="text-gray-500">
                      <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Aucun patient trouvé pour "{searchTerm}"</p>
                    </div>
                    <Button
                      onClick={() => setIsCreateDialogOpen(true)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Créer ce patient
                    </Button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un nouveau patient</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Prénom *</Label>
                <Input
                  id="firstName"
                  value={newPatientData.firstName}
                  onChange={(e) => setNewPatientData({...newPatientData, firstName: e.target.value})}
                  placeholder="Prénom"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Nom *</Label>
                <Input
                  id="lastName"
                  value={newPatientData.lastName}
                  onChange={(e) => setNewPatientData({...newPatientData, lastName: e.target.value})}
                  placeholder="Nom de famille"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="phone">Téléphone *</Label>
              <Input
                id="phone"
                value={newPatientData.phone}
                onChange={(e) => setNewPatientData({...newPatientData, phone: e.target.value})}
                placeholder="+33 6 12 34 56 78"
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newPatientData.email}
                onChange={(e) => setNewPatientData({...newPatientData, email: e.target.value})}
                placeholder="email@exemple.com"
              />
            </div>
            
            <div>
              <Label htmlFor="address">Adresse *</Label>
              <Input
                id="address"
                value={newPatientData.address}
                onChange={(e) => setNewPatientData({...newPatientData, address: e.target.value})}
                placeholder="Adresse complète"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                onClick={handleCreatePatient}
                disabled={!newPatientData.firstName || !newPatientData.lastName || !newPatientData.phone || !newPatientData.address}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Créer et sélectionner
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientSelector;