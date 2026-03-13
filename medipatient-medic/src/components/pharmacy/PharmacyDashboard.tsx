
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pill, User, Clock, CheckCircle, Package, AlertTriangle, Building2, Camera, Upload, FileText } from 'lucide-react';
import { usePharmacyPrescriptions, useUpdatePharmacyPrescription } from '@/hooks/usePharmacies';
import { useCurrentPharmacist } from '@/hooks/useCurrentPharmacist';
import { useToast } from '@/hooks/use-toast';
import OfficinaModule from './OfficinaModule';
import PrescriptionScanner from './PrescriptionScanner';

const PharmacyDashboard = () => {
  const { data: pharmacist, isLoading: isLoadingPharmacist } = useCurrentPharmacist();
  const pharmacyId = pharmacist?.pharmacy_id;
  
  const { data: prescriptions = [], isLoading } = usePharmacyPrescriptions(pharmacyId);
  const updatePrescription = useUpdatePharmacyPrescription();
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const { toast } = useToast();

  if (isLoadingPharmacist) {
    return <div className="p-6">Chargement...</div>;
  }

  if (!pharmacist || !pharmacyId) {
    return <div className="p-6">Aucune pharmacie associée à ce compte.</div>;
  }

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
        <p className="text-gray-600">Gestion complète des ordonnances, ventes et stock pharmaceutique</p>
        <div className="mt-4 flex gap-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700">Scanner d'ordonnances</Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700">Gestion stock</Badge>
          <Badge variant="outline" className="bg-purple-50 text-purple-700">Ventes & clients</Badge>
          <Badge variant="outline" className="bg-orange-50 text-orange-700">Optimisation</Badge>
        </div>
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

      <Tabs defaultValue="prescriptions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="prescriptions">Ordonnances</TabsTrigger>
          <TabsTrigger value="scanner" className="flex items-center gap-2">
            <Pill className="w-4 h-4" />
            Scanner
          </TabsTrigger>
          <TabsTrigger value="received">Reçues ({receivedPrescriptions.length})</TabsTrigger>
          <TabsTrigger value="preparing">En préparation ({preparingPrescriptions.length})</TabsTrigger>
          <TabsTrigger value="ready">Prêtes ({readyPrescriptions.length})</TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Historique
          </TabsTrigger>
          <TabsTrigger value="officina" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Officine
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scanner">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="w-5 h-5" />
                Scanner d'Ordonnances
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Pill className="w-16 h-16 text-primary/70 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Scanner d'ordonnances</h3>
                <p className="text-muted-foreground mb-4">
                  Scannez et analysez automatiquement les ordonnances pour identifier les médicaments
                </p>
                <Button 
                  className="mb-4"
                  onClick={() => setIsScannerOpen(true)}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Commencer le scan
                </Button>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <Card className="border-2 border-dashed hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => setIsScannerOpen(true)}>
                    <CardContent className="p-6">
                      <Camera className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                      <p className="text-sm font-medium">Scanner avec caméra</p>
                      <p className="text-xs text-muted-foreground mt-1">Utilisez la caméra de votre appareil</p>
                    </CardContent>
                  </Card>
                  <Card className="border-2 border-dashed hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => setIsScannerOpen(true)}>
                    <CardContent className="p-6">
                      <Upload className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <p className="text-sm font-medium">Importer un fichier</p>
                      <p className="text-xs text-muted-foreground mt-1">JPG, PNG, PDF supportés</p>
                    </CardContent>
                  </Card>
                  <Card className="border-2 border-dashed bg-muted/30">
                    <CardContent className="p-6">
                      <CheckCircle className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                      <p className="text-sm font-medium">Validation automatique</p>
                      <p className="text-xs text-muted-foreground mt-1">Reconnaissance OCR par IA</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Historique des Prescriptions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Historique des prescriptions</h3>
                <p className="text-muted-foreground mb-4">
                  Consultez l'historique complet des prescriptions traitées dans votre pharmacie
                </p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="border-dashed">
                    <CardContent className="p-4 text-center">
                      <Badge variant="secondary" className="mb-2">Cette semaine</Badge>
                      <p className="text-2xl font-bold">24</p>
                      <p className="text-sm text-muted-foreground">Prescriptions</p>
                    </CardContent>
                  </Card>
                  <Card className="border-dashed">
                    <CardContent className="p-4 text-center">
                      <Badge variant="outline" className="mb-2">Ce mois</Badge>
                      <p className="text-2xl font-bold">127</p>
                      <p className="text-sm text-muted-foreground">Prescriptions</p>
                    </CardContent>
                  </Card>
                  <Card className="border-dashed">
                    <CardContent className="p-4 text-center">
                      <Badge variant="success" className="mb-2">Traitées</Badge>
                      <p className="text-2xl font-bold">98%</p>
                      <p className="text-sm text-muted-foreground">Taux de traitement</p>
                    </CardContent>
                  </Card>
                  <Card className="border-dashed">
                    <CardContent className="p-4 text-center">
                      <Badge variant="secondary" className="mb-2">Moyenne</Badge>
                      <p className="text-2xl font-bold">12min</p>
                      <p className="text-sm text-muted-foreground">Temps de traitement</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prescriptions">
          <div className="grid gap-4">
            {[...receivedPrescriptions, ...preparingPrescriptions, ...readyPrescriptions, ...deliveredPrescriptions].map((prescription) => (
              <Card key={prescription.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Package className="w-5 h-5 text-blue-500" />
                        <h3 className="font-medium">Ordonnance #{prescription.id}</h3>
                        {getStatusBadge(prescription.status)}
                        {getAvailabilityBadge(prescription.availability_status)}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-3">
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
                        <h4 className="font-medium mb-2">Médicaments:</h4>
                        <div className="space-y-2">
                          {Array.isArray(prescription.prescription.medications) && prescription.prescription.medications.map((med: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                              <div>
                                <span className="font-medium">{med.name}</span>
                                <span className="text-sm text-muted-foreground ml-2">{med.dosage}</span>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {med.frequency} • {med.duration}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {receivedPrescriptions.length === 0 && preparingPrescriptions.length === 0 && 
             readyPrescriptions.length === 0 && deliveredPrescriptions.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Aucune ordonnance</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

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
                            {Array.isArray(prescription.prescription.medications) && prescription.prescription.medications.map((med: any, index: number) => (
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
                            {Array.isArray(prescription.prescription.medications) && prescription.prescription.medications.map((med: any, index: number) => (
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
                            {Array.isArray(prescription.prescription.medications) && prescription.prescription.medications.map((med: any, index: number) => (
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

        <TabsContent value="officina">
          <OfficinaModule />
        </TabsContent>
      </Tabs>

      {/* Scanner d'ordonnance modal */}
      <PrescriptionScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onPrescriptionProcessed={(medications) => {
          toast({
            title: "Succès",
            description: `${medications.length} médicament(s) identifié(s)`,
          });
          setIsScannerOpen(false);
        }}
        pharmacyId={pharmacyId}
      />
    </div>
  );
};

export default PharmacyDashboard;
