
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, FlaskConical, User, FileText, CheckCircle } from 'lucide-react';
import { useLabTests, useUpdateLabTest } from '@/hooks/useLaboratories';

const LaboratoryDashboard = () => {
  const { data: labTests = [], isLoading } = useLabTests();
  const updateLabTest = useUpdateLabTest();

  const pendingTests = labTests.filter(test => test.status === 'prescribed');
  const scheduledTests = labTests.filter(test => test.status === 'scheduled');
  const completedTests = labTests.filter(test => test.status === 'completed');

  const handleStatusUpdate = async (testId: string, newStatus: string, additionalData?: any) => {
    await updateLabTest.mutateAsync({
      id: testId,
      updates: {
        status: newStatus,
        ...additionalData
      }
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      prescribed: { label: 'Prescrite', variant: 'secondary' as const },
      scheduled: { label: 'Programmée', variant: 'default' as const },
      completed: { label: 'Terminée', variant: 'success' as const },
      results_available: { label: 'Résultats disponibles', variant: 'success' as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.prescribed;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Laboratoire - Tableau de Bord</h1>
        <p className="text-gray-600">Gestion des analyses et examens</p>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FlaskConical className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{pendingTests.length}</p>
                <p className="text-sm text-gray-600">En attente</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{scheduledTests.length}</p>
                <p className="text-sm text-gray-600">Programmées</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{completedTests.length}</p>
                <p className="text-sm text-gray-600">Terminées</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{labTests.length}</p>
                <p className="text-sm text-gray-600">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">En attente ({pendingTests.length})</TabsTrigger>
          <TabsTrigger value="scheduled">Programmées ({scheduledTests.length})</TabsTrigger>
          <TabsTrigger value="completed">Terminées ({completedTests.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Analyses en attente de programmation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingTests.map((test) => (
                  <div key={test.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <FlaskConical className="w-5 h-5 text-blue-500" />
                          <h3 className="font-medium">{test.test_name}</h3>
                          {getStatusBadge(test.status)}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4" />
                            <span>Patient: {test.patient?.profile?.first_name} {test.patient?.profile?.last_name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4" />
                            <span>Médecin: Dr. {test.doctor?.profile?.first_name} {test.doctor?.profile?.last_name}</span>
                          </div>
                        </div>

                        <div className="mt-2">
                          <p className="text-sm"><strong>Type:</strong> {test.test_type}</p>
                          {test.preparation_instructions && test.preparation_instructions.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm font-medium">Instructions de préparation:</p>
                              <ul className="text-sm text-gray-600 list-disc list-inside">
                                {test.preparation_instructions.map((instruction, index) => (
                                  <li key={index}>{instruction}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(test.id, 'scheduled', {
                            appointment_date: new Date().toISOString().split('T')[0],
                            appointment_time: '09:00'
                          })}
                          disabled={updateLabTest.isPending}
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          Programmer
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {pendingTests.length === 0 && (
                  <p className="text-center text-gray-500 py-8">Aucune analyse en attente</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled">
          <Card>
            <CardHeader>
              <CardTitle>Analyses programmées</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scheduledTests.map((test) => (
                  <div key={test.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Calendar className="w-5 h-5 text-green-500" />
                          <h3 className="font-medium">{test.test_name}</h3>
                          {getStatusBadge(test.status)}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4" />
                            <span>Patient: {test.patient?.profile?.first_name} {test.patient?.profile?.last_name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span>RDV: {test.appointment_date} à {test.appointment_time}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(test.id, 'completed', {
                            results_date: new Date().toISOString()
                          })}
                          disabled={updateLabTest.isPending}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Marquer terminée
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {scheduledTests.length === 0 && (
                  <p className="text-center text-gray-500 py-8">Aucune analyse programmée</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>Analyses terminées</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {completedTests.map((test) => (
                  <div key={test.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <h3 className="font-medium">{test.test_name}</h3>
                          {getStatusBadge(test.status)}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4" />
                            <span>Patient: {test.patient?.profile?.first_name} {test.patient?.profile?.last_name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span>Terminée le: {test.results_date ? new Date(test.results_date).toLocaleDateString('fr-FR') : 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Voir résultats
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {completedTests.length === 0 && (
                  <p className="text-center text-gray-500 py-8">Aucune analyse terminée</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LaboratoryDashboard;
