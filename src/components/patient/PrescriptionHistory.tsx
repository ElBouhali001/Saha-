
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Pill, Download, Search, Calendar, User, Shield } from 'lucide-react';

interface Prescription {
  id: string;
  date: string;
  doctor: string;
  medications: string[];
  status: 'active' | 'completed';
}

interface PrescriptionHistoryProps {
  prescriptions: Prescription[];
}

const PrescriptionHistory: React.FC<PrescriptionHistoryProps> = ({ prescriptions }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPrescriptions = prescriptions.filter(prescription =>
    prescription.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription.medications.some(med => med.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const downloadPrescription = (prescriptionId: string) => {
    // Simulation du téléchargement
    console.log(`Téléchargement de l'ordonnance ${prescriptionId}`);
    // Ici, vous intégreriez la génération de PDF
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Pill className="w-5 h-5 text-green-500" />
            <span>Historique des Ordonnances</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Barre de recherche */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher par médecin ou médicament..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              Filtrer par date
            </Button>
          </div>

          {/* Liste des ordonnances */}
          {filteredPrescriptions.length === 0 ? (
            <div className="text-center py-8">
              <Pill className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Aucune ordonnance trouvée</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPrescriptions.map((prescription) => (
                <Card key={prescription.id} className="border-l-4 border-l-green-500">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <Shield className="w-5 h-5 text-green-600" />
                          <div>
                            <h3 className="font-medium text-green-900">Ordonnance Sécurisée</h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <User className="w-4 h-4" />
                                <span>{prescription.doctor}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(prescription.date).toLocaleDateString('fr-FR')}</span>
                              </div>
                              <Badge variant={prescription.status === 'active' ? 'default' : 'secondary'}>
                                {prescription.status === 'active' ? 'Actif' : 'Terminé'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h4 className="font-medium text-green-800 mb-2">Médicaments prescrits:</h4>
                          <ul className="space-y-1">
                            {prescription.medications.map((medication, index) => (
                              <li key={index} className="text-sm text-green-700 flex items-center">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                {medication}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      <div className="ml-4 flex flex-col space-y-2">
                        <Button
                          onClick={() => downloadPrescription(prescription.id)}
                          variant="outline"
                          size="sm"
                          className="text-green-600 border-green-200 hover:bg-green-50"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          PDF
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                        >
                          Détails
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PrescriptionHistory;
