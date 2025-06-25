
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Users, DollarSign, Clock, Plus, Search, ChevronRight } from 'lucide-react';

const AgentDashboard = () => {
  const todayAppointments = [
    { time: '08:30', patient: 'Mme Diabaté Aïcha', doctor: 'Dr. Kouamé', status: 'waiting' },
    { time: '09:15', patient: 'M. Koné Ibrahim', doctor: 'Dr. Kouamé', status: 'in-progress' },
    { time: '10:00', patient: 'Mme Bamba Mariam', doctor: 'Dr. Traoré', status: 'confirmed' },
    { time: '11:30', patient: 'M. Ouattara Ali', doctor: 'Dr. Kouamé', status: 'confirmed' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'waiting': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmé';
      case 'waiting': return 'En attente';
      case 'in-progress': return 'En cours';
      default: return 'Inconnu';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bonjour Marie</h1>
          <p className="text-gray-600">Gestion de l'accueil et des rendez-vous</p>
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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">RDV Aujourd'hui</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">12</div>
            <p className="text-xs text-gray-600">8 confirmés, 4 en attente</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Patients Reçus</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">8</div>
            <p className="text-xs text-gray-600">Depuis ce matin</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Encaissements</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">85,000</div>
            <p className="text-xs text-gray-600">CFA aujourd'hui</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temps d'Attente</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700">15min</div>
            <p className="text-xs text-gray-600">Temps moyen</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions Rapides</CardTitle>
          <CardDescription>Accès direct aux tâches courantes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button className="h-20 flex-col space-y-2 bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-6 h-6" />
              <span>Nouveau RDV</span>
            </Button>
            <Button className="h-20 flex-col space-y-2" variant="outline">
              <Search className="w-6 h-6" />
              <span>Rechercher Patient</span>
            </Button>
            <Button className="h-20 flex-col space-y-2" variant="outline">
              <DollarSign className="w-6 h-6" />
              <span>Facturation</span>
            </Button>
            <Button className="h-20 flex-col space-y-2" variant="outline">
              <Users className="w-6 h-6" />
              <span>Nouveau Patient</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Today's Appointments and Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>RDV du Jour</CardTitle>
              <CardDescription>Planning des consultations</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              Planning complet
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
                    <p className="text-sm text-gray-600">{appointment.doctor}</p>
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
            <CardTitle>Activité Récente</CardTitle>
            <CardDescription>Dernières actions effectuées</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Paiement encaissé</p>
                <p className="text-xs text-gray-500">M. Koné Ibrahim - 25,000 CFA</p>
                <p className="text-xs text-gray-400">Il y a 5 minutes</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">RDV confirmé</p>
                <p className="text-xs text-gray-500">Mme Diabaté - Demain 14h</p>
                <p className="text-xs text-gray-400">Il y a 15 minutes</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Nouveau patient</p>
                <p className="text-xs text-gray-500">Mme Ouédraogo Salima enregistrée</p>
                <p className="text-xs text-gray-400">Il y a 32 minutes</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <Clock className="w-4 h-4 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Arrivée patient</p>
                <p className="text-xs text-gray-500">M. Soro Moussa - Salle d'attente</p>
                <p className="text-xs text-gray-400">Il y a 8 minutes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AgentDashboard;
