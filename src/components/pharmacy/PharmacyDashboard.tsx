
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pill, User, Clock, CheckCircle, Package, AlertTriangle } from 'lucide-react';
import { useMockPharmacyPrescriptions, useMockUpdatePharmacyPrescription } from '@/hooks/useMockData';

const PharmacyDashboard = () => {
  const { data: prescriptions = [], isLoading } = useMockPharmacyPrescriptions();
  const updatePrescription = useMockUpdatePharmacyPrescription();

  const receivedPrescriptions = prescriptions.filter(p => p.status === 'received');
  const preparingPrescriptions = prescriptions.filter(p => p.status === 'preparing');
  const readyPrescriptions = prescriptions.filter(p => p.status === 'ready');
  const deliveredPrescriptions = prescriptions.filter(p => p.status === 'delivered');

  const handleStatusUpdate = async (prescriptionId: string, newStatus: string, additionalData?: any) => {
    await updatePrescription.mutateAsync({
      id: prescriptionId,
      updates: {
        status: newStatus,
        ...additionalData
      }
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      received: { label: 'Reçue', variant: 'secondary' as const },
      preparing: { label: 'En préparation', variant: 'default' as const },
      ready: { label: 'Prête', variant: 'success' as const },
      delivered: { label: 'Livrée', variant: 'success' as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.received;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getAvailabilityBadge = (availability: string) => {
    switch (availability) {
      case 'available':
        return <Badge variant="success">Disponible</Badge>;
      case 'partial':
        return <Badge variant="secondary">Partiel</Badge>;
      case 'unavailable':
        return <Badge variant="destructive">Indisponible</Badge>;
      default:
        return <Badge variant="outline">À vérifier</Badge>;
    }
  };

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pharmacie - Tableau de Bord</h1>
        <p className="text-gray-600">Gestion des ordonnances et préparations</p>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{receivedPrescriptions.length}</p>
                <p className="text-sm text-gray-600">Reçues</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Pill className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{preparingPrescriptions.length}</p>
                <p className="text-sm text-gray-600">En préparation</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{readyPrescriptions.length}</p>
                <p className="text-sm text-gray-600">Prêtes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{deliveredPrescriptions.length}</p>
                <p className="text-sm text-gray-600">Livrées</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="received" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="received">Reçues ({receivedPrescriptions.length})</TabsTrigger>
          <TabsTrigger value="preparing">En préparation ({preparingPrescriptions.length})</TabsTrigger>
          <TabsTrigger value="ready">Prêtes ({readyPrescriptions.length})</TabsTrigger>
          <TabsTrigger value="delivered">Livrées ({deliveredPrescriptions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="received">
          <Card>
            <CardHeader>
              <CardTitle>Ordonnances reçues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {receivedPrescriptions.map((prescription) => (
                  <div key={prescription.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Package className="w-5 h-5 text-blue-500" />
                          <h3 className="font-medium">Ordonnance #{prescription.id}</h3>
                          {getStatusBadge(prescription.status)}
                          {getAvailabilityBadge(prescription.availability_status)}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4" />
                            <span>Patient: {prescription.prescription.patient.profile.first_name} {prescription.prescription.patient.profile.last_name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4" />
                            <span>Médecin: {prescription.prescription.doctor.profile.first_name} {prescription.prescription.doctor.profile.last_name}</span>
                          </div>
                        </div>

                        <div className="mt-3">
                          <h4 className="font-medium mb-2">Médicaments prescrits:</h4>
                          <div className="space-y-2">
                            {prescription.prescription.medications.map((med, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div>
                                  <span className="font-medium">{med.name}</span>
                                  <span className="text-sm text-gray-600 ml-2">{med.dosage}</span>
                                </div>
                                <div className="text-sm text-gray-600">
                                  {med.frequency} • {med.duration}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(prescription.id, 'preparing')}
                          disabled={updatePrescription.isPending}
                        >
                          <Pill className="w-4 h-4 mr-2" />
                          Commencer
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {receivedPrescriptions.length === 0 && (
                  <p className="text-center text-gray-500 py-8">Aucune ordonnance reçue</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preparing">
          <Card>
            <CardHeader>
              <CardTitle>Ordonnances en préparation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {preparingPrescriptions.map((prescription) => (
                  <div key={prescription.id} className="border rounded-lg p-4 border-l-4 border-l-orange-500">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Pill className="w-5 h-5 text-orange-500" />
                          <h3 className="font-medium">Ordonnance #{prescription.id}</h3>
                          {getStatusBadge(prescription.status)}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4" />
                            <span>Patient: {prescription.prescription.patient.profile.first_name} {prescription.prescription.patient.profile.last_name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span>En cours de préparation</span>
                          </div>
                        </div>

                        <div className="mt-3">
                          <h4 className="font-medium mb-2">Médicaments:</h4>
                          <div className="space-y-2">
                            {prescription.prescription.medications.map((med, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-orange-50 rounded">
                                <div>
                                  <span className="font-medium">{med.name}</span>
                                  <span className="text-sm text-gray-600 ml-2">{med.dosage}</span>
                                </div>
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(prescription.id, 'ready', {
                            ready_date: new Date().toISOString()
                          })}
                          disabled={updatePrescription.isPending}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Marquer prête
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {preparingPrescriptions.length === 0 && (
                  <p className="text-center text-gray-500 py-8">Aucune ordonnance en préparation</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ready">
          <Card>
            <CardHeader>
              <CardTitle>Ordonnances prêtes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {readyPrescriptions.map((prescription) => (
                  <div key={prescription.id} className="border rounded-lg p-4 border-l-4 border-l-green-500 bg-green-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <h3 className="font-medium">Ordonnance #{prescription.id}</h3>
                          {getStatusBadge(prescription.status)}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4" />
                            <span>Patient: {prescription.prescription.patient.profile.first_name} {prescription.prescription.patient.profile.last_name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span>Prête depuis: {prescription.ready_date ? new Date(prescription.ready_date).toLocaleDateString('fr-FR') : 'N/A'}</span>
                          </div>
                        </div>

                        <div className="mt-3">
                          <h4 className="font-medium mb-2">Médicaments prêts:</h4>
                          <div className="space-y-2">
                            {prescription.prescription.medications.map((med, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                                <div>
                                  <span className="font-medium">{med.name}</span>
                                  <span className="text-sm text-gray-600 ml-2">{med.dosage}</span>
                                </div>
                                <Badge variant="success">Prêt</Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(prescription.id, 'delivered', {
                            delivered_date: new Date().toISOString()
                          })}
                          disabled={updatePrescription.isPending}
                        >
                          <Package className="w-4 h-4 mr-2" />
                          Livrer
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {readyPrescriptions.length === 0 && (
                  <p className="text-center text-gray-500 py-8">Aucune ordonnance prête</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivered">
          <Card>
            <CardHeader>
              <CardTitle>Ordonnances livrées</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {deliveredPrescriptions.map((prescription) => (
                  <div key={prescription.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <CheckCircle className="w-5 h-5 text-purple-500" />
                          <h3 className="font-medium">Ordonnance #{prescription.id}</h3>
                          {getStatusBadge(prescription.status)}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4" />
                            <span>Patient: {prescription.prescription.patient.profile.first_name} {prescription.prescription.patient.profile.last_name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span>Livrée le: {prescription.delivered_date ? new Date(prescription.delivered_date).toLocaleDateString('fr-FR') : 'N/A'}</span>
                          </div>
                        </div>

                        <div className="mt-3">
                          <div className="flex items-center space-x-2 text-sm text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            <span>{prescription.prescription.medications.length} médicament(s) livré(s)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {deliveredPrescriptions.length === 0 && (
                  <p className="text-center text-gray-500 py-8">Aucune ordonnance livrée</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PharmacyDashboard;
