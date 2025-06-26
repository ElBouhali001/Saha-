import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, FileText, Pill, Video, Download, Clock, Phone, MessageSquare, User, Activity, Users } from 'lucide-react';
import TeleconsultationModule from './TeleconsultationModule';
import PrescriptionHistory from './PrescriptionHistory';
import MedicalRecordsView from './MedicalRecordsView';
import AppointmentBooking from './AppointmentBooking';
import PatientGuardianship from './PatientGuardianship';

const PatientInterface = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const upcomingAppointments = [
    {
      id: '1',
      date: '2024-01-25',
      time: '14:30',
      doctor: 'Dr. Kouamé Adjoua',
      type: 'Consultation de suivi',
      status: 'confirmed'
    },
    {
      id: '2',
      date: '2024-01-28',
      time: '10:00',
      doctor: 'Dr. Traoré Mamadou',
      type: 'Téléconsultation',
      status: 'pending'
    }
  ];

  const recentPrescriptions = [
    {
      id: '1',
      date: '2024-01-20',
      doctor: 'Dr. Kouamé Adjoua',
      medications: ['Paracétamol 500mg', 'Amoxicilline 250mg'],
      status: 'active' as const
    },
    {
      id: '2',
      date: '2024-01-15',
      doctor: 'Dr. Traoré Mamadou',
      medications: ['Ibuprofène 400mg'],
      status: 'completed' as const
    }
  ];

  const healthSummary = {
    lastConsultation: {
      date: '2024-01-20',
      doctor: 'Dr. Kouamé Adjoua',
      diagnosis: 'Hypertension artérielle',
      nextAppointment: '2024-01-25'
    },
    vitals: {
      bloodPressure: '140/90',
      weight: '75kg',
      temperature: '36.5°C',
      heartRate: '78 bpm'
    },
    alerts: [
      'Prise de médicament: Lisinopril à 8h00',
      'Prochain RDV dans 3 jours'
    ]
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mon Espace Patient</h1>
        <p className="text-gray-600">Gérez vos consultations, ordonnances et rendez-vous</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 lg:w-fit">
          <TabsTrigger value="dashboard" className="flex items-center space-x-2">
            <Activity className="w-4 h-4" />
            <span>Tableau de bord</span>
          </TabsTrigger>
          <TabsTrigger value="guardianship" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Tutelle</span>
          </TabsTrigger>
          <TabsTrigger value="appointments" className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Rendez-vous</span>
          </TabsTrigger>
          <TabsTrigger value="teleconsultation" className="flex items-center space-x-2">
            <Video className="w-4 h-4" />
            <span>Téléconsultation</span>
          </TabsTrigger>
          <TabsTrigger value="prescriptions" className="flex items-center space-x-2">
            <Pill className="w-4 h-4" />
            <span>Mes Ordonnances</span>
          </TabsTrigger>
          <TabsTrigger value="medical-records" className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Mon Dossier</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Résumé de santé */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-blue-500" />
                  <span>Mon État de Santé</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900">Dernière Consultation</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      {new Date(healthSummary.lastConsultation.date).toLocaleDateString('fr-FR')}
                    </p>
                    <p className="text-sm text-blue-600">{healthSummary.lastConsultation.doctor}</p>
                    <p className="text-xs text-blue-500 mt-2">{healthSummary.lastConsultation.diagnosis}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-900">Constantes Vitales</h4>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                      <div className="text-green-700">Tension: {healthSummary.vitals.bloodPressure}</div>
                      <div className="text-green-700">Poids: {healthSummary.vitals.weight}</div>
                      <div className="text-green-700">T°: {healthSummary.vitals.temperature}</div>
                      <div className="text-green-700">Pouls: {healthSummary.vitals.heartRate}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-orange-600">Alertes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {healthSummary.alerts.map((alert, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                      <p className="text-sm text-gray-700">{alert}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Prochains rendez-vous */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                <span>Prochains Rendez-vous</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingAppointments.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Aucun rendez-vous programmé</p>
              ) : (
                <div className="space-y-3">
                  {upcomingAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            {appointment.type === 'Téléconsultation' ? (
                              <Video className="w-4 h-4 text-green-500" />
                            ) : (
                              <Clock className="w-4 h-4 text-blue-500" />
                            )}
                            <span className="font-medium">{appointment.doctor}</span>
                          </div>
                          <Badge variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}>
                            {appointment.status === 'confirmed' ? 'Confirmé' : 'En attente'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{appointment.type}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(appointment.date).toLocaleDateString('fr-FR')} à {appointment.time}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        {appointment.type === 'Téléconsultation' && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-green-600"
                            onClick={() => setActiveTab('teleconsultation')}
                          >
                            <Video className="w-4 h-4 mr-2" />
                            Rejoindre
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          Modifier
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ordonnances récentes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Pill className="w-5 h-5 text-green-500" />
                <span>Ordonnances Récentes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentPrescriptions.map((prescription) => (
                  <div key={prescription.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <span className="font-medium">{prescription.doctor}</span>
                        <Badge variant={prescription.status === 'active' ? 'default' : 'secondary'}>
                          {prescription.status === 'active' ? 'Actif' : 'Terminé'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {prescription.medications.join(', ')}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(prescription.date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      PDF
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions rapides */}
          <Card>
            <CardHeader>
              <CardTitle>Actions Rapides</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Button 
                  className="h-20 flex-col space-y-2" 
                  variant="outline"
                  onClick={() => setActiveTab('appointments')}
                >
                  <Calendar className="w-6 h-6" />
                  <span>Prendre RDV</span>
                </Button>
                <Button 
                  className="h-20 flex-col space-y-2" 
                  variant="outline"
                  onClick={() => setActiveTab('teleconsultation')}
                >
                  <Video className="w-6 h-6" />
                  <span>Téléconsultation</span>
                </Button>
                <Button 
                  className="h-20 flex-col space-y-2" 
                  variant="outline"
                  onClick={() => setActiveTab('prescriptions')}
                >
                  <Pill className="w-6 h-6" />
                  <span>Mes Ordonnances</span>
                </Button>
                <Button 
                  className="h-20 flex-col space-y-2" 
                  variant="outline"
                  onClick={() => setActiveTab('medical-records')}
                >
                  <FileText className="w-6 h-6" />
                  <span>Mon Dossier</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guardianship">
          <PatientGuardianship />
        </TabsContent>

        <TabsContent value="appointments">
          <AppointmentBooking />
        </TabsContent>

        <TabsContent value="teleconsultation">
          <TeleconsultationModule />
        </TabsContent>

        <TabsContent value="prescriptions">
          <PrescriptionHistory prescriptions={recentPrescriptions} />
        </TabsContent>

        <TabsContent value="medical-records">
          <MedicalRecordsView />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatientInterface;
