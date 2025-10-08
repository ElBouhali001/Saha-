
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, FileText, Pill, Video, Download, Clock, MapPin, User, Activity } from 'lucide-react';

interface PatientDashboardProps {
  onNavigate?: (page: string) => void;
}

const PatientDashboard = ({ onNavigate }: PatientDashboardProps = {}) => {
  const nextAppointment = {
    date: '2024-01-25',
    time: '14:30',
    doctor: 'Dr. Kouamé Adjoua',
    type: 'Consultation de suivi',
    location: 'Cabinet 2',
  };

  const recentPrescriptions = [
    { date: '2024-01-20', doctor: 'Dr. Kouamé', medications: 3, status: 'active' },
    { date: '2024-01-15', doctor: 'Dr. Traoré', medications: 2, status: 'completed' },
    { date: '2024-01-10', doctor: 'Dr. Kouamé', medications: 4, status: 'completed' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bonjour Jean</h1>
          <p className="text-gray-600">Votre espace patient personnel</p>
        </div>
        <div className="text-right text-sm text-gray-500">
          {new Date().toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Next Appointment Card */}
      <Card className="border-l-4 border-l-blue-500 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-blue-900">
            <Calendar className="w-5 h-5" />
            <span>Prochain Rendez-vous</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-lg font-semibold text-blue-900">
                  {new Date(nextAppointment.date).toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long' 
                  })} à {nextAppointment.time}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-blue-600" />
                <span className="text-blue-800">{nextAppointment.doctor}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span className="text-blue-800">{nextAppointment.location}</span>
              </div>
            </div>
            <div className="flex items-center justify-end">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Modifier RDV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions Rapides</CardTitle>
          <CardDescription>Accès direct à vos services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Button className="h-20 flex-col space-y-2 bg-green-600 hover:bg-green-700 text-white">
              <Calendar className="w-6 h-6" />
              <span>Prendre RDV</span>
            </Button>
            <Button className="h-20 flex-col space-y-2" variant="outline">
              <Video className="w-6 h-6" />
              <span>Téléconsultation</span>
            </Button>
            <Button className="h-20 flex-col space-y-2" variant="outline">
              <Pill className="w-6 h-6" />
              <span>Mes Ordonnances</span>
            </Button>
            <Button className="h-20 flex-col space-y-2" variant="outline">
              <FileText className="w-6 h-6" />
              <span>Mon Dossier</span>
            </Button>
            <Button 
              className="h-20 flex-col space-y-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700"
              onClick={() => onNavigate?.('prescription-tracker')}
            >
              <Activity className="w-6 h-6" />
              <span>Suivi Traitement</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Medical History and Prescriptions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Pill className="w-5 h-5 text-green-500" />
              <span>Ordonnances Récentes</span>
            </CardTitle>
            <CardDescription>Vos dernières prescriptions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentPrescriptions.map((prescription, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {new Date(prescription.date).toLocaleDateString('fr-FR')}
                  </p>
                  <p className="text-sm text-gray-600">{prescription.doctor}</p>
                  <p className="text-xs text-gray-500">{prescription.medications} médicaments</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    prescription.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {prescription.status === 'active' ? 'Actif' : 'Terminé'}
                  </span>
                  <Button size="sm" variant="outline">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-500" />
              <span>Historique Médical</span>
            </CardTitle>
            <CardDescription>Résumé de vos consultations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-gray-900">Consultation du 20/01/2024</p>
                <span className="text-xs text-gray-500">Dr. Kouamé</span>
              </div>
              <p className="text-sm text-gray-600">Suivi hypertension artérielle</p>
              <p className="text-xs text-green-600 mt-1">Tension : 130/80 mmHg - Stable</p>
            </div>
            
            <div className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-gray-900">Consultation du 15/01/2024</p>
                <span className="text-xs text-gray-500">Dr. Traoré</span>
              </div>
              <p className="text-sm text-gray-600">Consultation cardiologie</p>
              <p className="text-xs text-blue-600 mt-1">ECG normal - RAS</p>
            </div>
            
            <div className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-gray-900">Analyse du 10/01/2024</p>
                <span className="text-xs text-gray-500">Laboratoire</span>
              </div>
              <p className="text-sm text-gray-600">Bilan sanguin complet</p>
              <p className="text-xs text-green-600 mt-1">Résultats dans les normes</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Health Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Résumé Santé</CardTitle>
          <CardDescription>Informations importantes sur votre état de santé</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
              <h3 className="font-semibold text-red-800 mb-2">Allergies</h3>
              <p className="text-sm text-red-600">Pénicilline, Aspirine</p>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h3 className="font-semibold text-yellow-800 mb-2">Traitements en cours</h3>
              <p className="text-sm text-yellow-600">Lisinopril 10mg, Metformine 500mg</p>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2">Groupe sanguin</h3>
              <p className="text-sm text-blue-600">O+ (Rhésus positif)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientDashboard;
