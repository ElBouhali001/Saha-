
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, User, Calendar, Shield, Heart, Activity, Thermometer, Weight } from 'lucide-react';

const MedicalRecordsView = () => {
  const [selectedRecord, setSelectedRecord] = useState(null);

  const medicalHistory = [
    {
      id: '1',
      date: '2024-01-20',
      doctor: 'Dr. Kouamé Adjoua',
      type: 'Consultation de suivi',
      diagnosis: 'Hypertension artérielle',
      symptoms: 'Maux de tête, fatigue',
      treatment: 'Lisinopril 10mg, repos',
      vitals: {
        tension: '140/90',
        pouls: '78',
        temperature: '36.5°C',
        poids: '75kg'
      }
    },
    {
      id: '2',
      date: '2024-01-15',
      doctor: 'Dr. Traoré Mamadou',
      type: 'Consultation cardiologie',
      diagnosis: 'Contrôle cardiaque',
      symptoms: 'Palpitations occasionnelles',
      treatment: 'ECG normal, surveillance',
      vitals: {
        tension: '135/85',
        pouls: '72',
        temperature: '36.8°C',
        poids: '74kg'
      }
    },
    {
      id: '3',
      date: '2024-01-10',
      doctor: 'Dr. Diallo Fatima',
      type: 'Bilan de santé',
      diagnosis: 'Bilan général satisfaisant',
      symptoms: 'Aucun symptôme particulier',
      treatment: 'Maintenir hygiène de vie',
      vitals: {
        tension: '130/80',
        pouls: '70',
        temperature: '36.6°C',
        poids: '74kg'
      }
    }
  ];

  const healthSummary = {
    allergies: ['Pénicilline', 'Aspirine'],
    chronicConditions: ['Hypertension artérielle'],
    currentMedications: ['Lisinopril 10mg'],
    bloodType: 'O+',
    emergencyContact: {
      name: 'Marie Kouakou',
      phone: '07 01 02 03 04',
      relationship: 'Épouse'
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-500" />
            <span>Mon Dossier Médical</span>
            <Shield className="w-4 h-4 text-green-500 ml-auto" />
          </CardTitle>
        </CardHeader>
      </Card>

      <Tabs defaultValue="history" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="history">Historique</TabsTrigger>
          <TabsTrigger value="summary">Résumé Santé</TabsTrigger>
          <TabsTrigger value="vitals">Constantes</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Historique des Consultations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {medicalHistory.map((record) => (
                  <Card key={record.id} className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="flex items-center space-x-2">
                              <User className="w-4 h-4 text-blue-500" />
                              <span className="font-medium">{record.doctor}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-600">
                                {new Date(record.date).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                            <Badge variant="outline">{record.type}</Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium text-gray-900 mb-1">Diagnostic</h4>
                              <p className="text-sm text-gray-700">{record.diagnosis}</p>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 mb-1">Symptômes</h4>
                              <p className="text-sm text-gray-700">{record.symptoms}</p>
                            </div>
                            <div className="md:col-span-2">
                              <h4 className="font-medium text-gray-900 mb-1">Traitement</h4>
                              <p className="text-sm text-gray-700">{record.treatment}</p>
                            </div>
                          </div>

                          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <h4 className="font-medium text-gray-900 mb-2">Constantes vitales</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div className="flex items-center space-x-2">
                                <Activity className="w-4 h-4 text-red-500" />
                                <span>Tension: {record.vitals.tension}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Heart className="w-4 h-4 text-pink-500" />
                                <span>Pouls: {record.vitals.pouls}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Thermometer className="w-4 h-4 text-blue-500" />
                                <span>T°: {record.vitals.temperature}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Weight className="w-4 h-4 text-green-500" />
                                <span>Poids: {record.vitals.poids}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-red-600">Allergies</CardTitle>
              </CardHeader>
              <CardContent>
                {healthSummary.allergies.length === 0 ? (
                  <p className="text-gray-500">Aucune allergie connue</p>
                ) : (
                  <div className="space-y-2">
                    {healthSummary.allergies.map((allergy, index) => (
                      <Badge key={index} variant="destructive" className="mr-2">
                        {allergy}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-orange-600">Conditions Chroniques</CardTitle>
              </CardHeader>
              <CardContent>
                {healthSummary.chronicConditions.length === 0 ? (
                  <p className="text-gray-500">Aucune condition chronique</p>
                ) : (
                  <div className="space-y-2">
                    {healthSummary.chronicConditions.map((condition, index) => (
                      <Badge key={index} variant="secondary" className="mr-2">
                        {condition}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-blue-600">Traitements Actuels</CardTitle>
              </CardHeader>
              <CardContent>
                {healthSummary.currentMedications.length === 0 ? (
                  <p className="text-gray-500">Aucun traitement en cours</p>
                ) : (
                  <div className="space-y-2">
                    {healthSummary.currentMedications.map((medication, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        <span className="text-sm">{medication}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-green-600">Informations Générales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="font-medium">Groupe sanguin:</span>
                  <Badge variant="outline" className="ml-2">{healthSummary.bloodType}</Badge>
                </div>
                <div>
                  <span className="font-medium">Contact d'urgence:</span>
                  <div className="text-sm text-gray-600 mt-1">
                    <p>{healthSummary.emergencyContact.name}</p>
                    <p>{healthSummary.emergencyContact.phone}</p>
                    <p className="text-xs">({healthSummary.emergencyContact.relationship})</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vitals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Évolution des Constantes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Graphique simplifié des constantes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-3 flex items-center space-x-2">
                      <Activity className="w-4 h-4 text-red-500" />
                      <span>Tension Artérielle</span>
                    </h3>
                    <div className="space-y-2">
                      {medicalHistory.map((record) => (
                        <div key={record.id} className="flex justify-between text-sm">
                          <span>{new Date(record.date).toLocaleDateString('fr-FR')}</span>
                          <span className="font-medium">{record.vitals.tension}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-3 flex items-center space-x-2">
                      <Weight className="w-4 h-4 text-green-500" />
                      <span>Poids</span>
                    </h3>
                    <div className="space-y-2">
                      {medicalHistory.map((record) => (
                        <div key={record.id} className="flex justify-between text-sm">
                          <span>{new Date(record.date).toLocaleDateString('fr-FR')}</span>
                          <span className="font-medium">{record.vitals.poids}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MedicalRecordsView;
