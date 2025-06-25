
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Patient } from '@/types/patient';
import { Search, Plus, User, Phone, Calendar, MapPin } from 'lucide-react';

const PatientManagement = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newPatient, setNewPatient] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    phone: '',
    address: '',
    email: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    }
  });

  const filteredPatients = patients.filter(patient =>
    `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm)
  );

  const handleAddPatient = () => {
    const patient: Patient = {
      id: Date.now().toString(),
      ...newPatient,
      medicalHistory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setPatients([...patients, patient]);
    setNewPatient({
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      phone: '',
      address: '',
      email: '',
      emergencyContact: { name: '', phone: '', relationship: '' }
    });
    setIsAddDialogOpen(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Patients</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau Patient
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Ajouter un Patient</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input
                    id="firstName"
                    value={newPatient.firstName}
                    onChange={(e) => setNewPatient({...newPatient, firstName: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Nom</Label>
                  <Input
                    id="lastName"
                    value={newPatient.lastName}
                    onChange={(e) => setNewPatient({...newPatient, lastName: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="dateOfBirth">Date de naissance</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={newPatient.dateOfBirth}
                  onChange={(e) => setNewPatient({...newPatient, dateOfBirth: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  value={newPatient.phone}
                  onChange={(e) => setNewPatient({...newPatient, phone: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="address">Adresse</Label>
                <Textarea
                  id="address"
                  value={newPatient.address}
                  onChange={(e) => setNewPatient({...newPatient, address: e.target.value})}
                />
              </div>
              <Button onClick={handleAddPatient} className="w-full">
                Ajouter Patient
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Rechercher par nom ou téléphone..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPatients.map((patient) => (
          <Card key={patient.id} className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedPatient(patient)}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5 text-blue-600" />
                <span>{patient.firstName} {patient.lastName}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="w-4 h-4 mr-2" />
                {patient.phone}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                {new Date(patient.dateOfBirth).toLocaleDateString('fr-FR')}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-2" />
                {patient.address}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPatients.length === 0 && (
        <div className="text-center py-12">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun patient trouvé</h3>
          <p className="text-gray-600">Commencez par ajouter votre premier patient.</p>
        </div>
      )}
    </div>
  );
};

export default PatientManagement;
