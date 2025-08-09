
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Users, FileText, Clock, Bell, ChevronRight } from 'lucide-react';
import PatientClaimQRCode from '@/components/patient/PatientClaimQRCode';
import { supabase } from '@/integrations/supabase/client';
import { IS_DEMO } from '@/config/app';

const DoctorDashboard = () => {
  const todayAppointments = [
    { time: '09:00', patient: 'Mme Diabaté Aïcha', type: 'Consultation', status: 'confirmed' },
    { time: '10:30', patient: 'M. Koné Ibrahim', type: 'Suivi', status: 'waiting' },
    { time: '14:00', patient: 'Mme Touré Fatou', type: 'Urgence', status: 'urgent' },
    { time: '15:30', patient: 'M. Soro Moussa', type: 'Consultation', status: 'confirmed' },
  ];
  const fallbackDemoPatients = [
    { name: 'Marie Dubois', token: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d' },
    { name: 'Pierre Martin', token: '7c9e6679-7425-40de-944b-e07fc1f90ae7' },
    { name: 'Sophie Rousseau', token: '123e4567-e89b-12d3-a456-426614174000' },
  ];
  const [qrPatients, setQrPatients] = useState<{ name: string; token: string }[]>(IS_DEMO ? fallbackDemoPatients : []);
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  useEffect(() => {
    const loadRealTokens = async () => {
      if (IS_DEMO) return;
      const { data: patients, error } = await supabase
        .from('patients')
        .select('id')
        .limit(3);
      if (error || !patients) return;

      const items: { name: string; token: string }[] = [];
      for (const [idx, p] of patients.entries()) {
        const { data: tok, error: rpcError } = await (supabase as any).rpc('create_patient_claim_token', { p_patient_id: p.id });
        if (!rpcError && tok && tok.token) {
          items.push({ name: `Patient #${idx + 1}`, token: tok.token });
        }
      }
      if (items.length) setQrPatients(items);
    };
    loadRealTokens();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'waiting': return 'bg-yellow-100 text-yellow-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmé';
      case 'waiting': return 'En attente';
      case 'urgent': return 'Urgent';
      default: return 'Inconnu';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bonjour Dr. Kouamé</h1>
          <p className="text-gray-600">Voici votre planning du jour</p>
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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">RDV Aujourd'hui</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">4</div>
            <p className="text-xs text-gray-600">3 confirmés, 1 urgent</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Patients Suivis</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">127</div>
            <p className="text-xs text-gray-600">Patients actifs</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultations</CardTitle>
            <FileText className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">8</div>
            <p className="text-xs text-gray-600">Cette semaine</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temps Moyen</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700">25min</div>
            <p className="text-xs text-gray-600">Par consultation</p>
          </CardContent>
        </Card>
      </div>

      {/* QR d'activation patients (démo) */}
      <Card>
        <CardHeader>
          <CardTitle>QR d'activation patients (démo)</CardTitle>
          <CardDescription>Partagez le QR d'activation aux patients nouvellement créés</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {qrPatients.map((p) => (
              <PatientClaimQRCode
                key={p.token}
                patientName={p.name}
                claimUrl={`${baseUrl}/claim?token=${p.token}`}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Today's Schedule and Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Planning du Jour</CardTitle>
              <CardDescription>Vos rendez-vous d'aujourd'hui</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              Voir tout
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {todayAppointments.map((appointment, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                    {appointment.time}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{appointment.patient}</p>
                    <p className="text-sm text-gray-600">{appointment.type}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                  {getStatusLabel(appointment.status)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-blue-500" />
              <span>Notifications</span>
            </CardTitle>
            <CardDescription>Alertes et rappels importants</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-800">Nouveau résultat d'analyse</p>
                <p className="text-xs text-blue-600">Patient Diabaté A. - Bilan sanguin disponible</p>
                <p className="text-xs text-blue-500 mt-1">Il y a 30 minutes</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-orange-800">Rappel suivi patient</p>
                <p className="text-xs text-orange-600">M. Koné I. - Contrôle dans 3 jours</p>
                <p className="text-xs text-orange-500 mt-1">Programmé automatiquement</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800">Transmission reçue</p>
                <p className="text-xs text-green-600">Dr. Camara - Avis spécialisé disponible</p>
                <p className="text-xs text-green-500 mt-1">Il y a 2 heures</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions Rapides</CardTitle>
          <CardDescription>Accès direct aux fonctionnalités les plus utilisées</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-16 flex-col space-y-2" variant="outline">
              <FileText className="w-6 h-6" />
              <span>Nouvelle Consultation</span>
            </Button>
            <Button className="h-16 flex-col space-y-2" variant="outline">
              <Users className="w-6 h-6" />
              <span>Rechercher Patient</span>
            </Button>
            <Button className="h-16 flex-col space-y-2" variant="outline">
              <Calendar className="w-6 h-6" />
              <span>Modifier Planning</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorDashboard;
