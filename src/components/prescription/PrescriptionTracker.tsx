import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  Archive,
  RefreshCw,
  Scan,
  ShoppingBag,
  Bell,
  AlertTriangle,
  Calendar
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import BarcodeScanner from './BarcodeScanner';
import MedicationReminders from './MedicationReminders';

interface Prescription {
  id: string;
  prescription_date: string;
  status: string;
  is_renewable?: boolean;
  renewal_count?: number;
  max_renewals?: number;
  medications: any[];
  acquired_at?: string;
  treatment_start_date?: string;
  treatment_end_date?: string;
  archived_at?: string;
}

const PrescriptionTracker = ({ patientId }: { patientId: string }) => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [acquisitions, setAcquisitions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPrescriptions();
  }, [patientId]);

  const loadPrescriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('prescriptions')
        .select('*')
        .eq('patient_id', patientId)
        .order('prescription_date', { ascending: false });

      if (error) throw error;
      setPrescriptions((data as any) || []);
    } catch (error) {
      console.error('Error loading prescriptions:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les ordonnances",
        variant: "destructive",
      });
    }
  };

  const loadAcquisitions = async (prescriptionId: string) => {
    try {
      const { data, error } = await supabase
        .from('medication_acquisitions' as any)
        .select('*')
        .eq('prescription_id', prescriptionId)
        .order('scanned_at', { ascending: false });

      if (error) throw error;
      setAcquisitions((data as any) || []);
    } catch (error) {
      console.error('Error loading acquisitions:', error);
    }
  };

  const handleScanComplete = async (prescriptionId: string) => {
    // Reload acquisitions
    await loadAcquisitions(prescriptionId);
    
    // Check if all medications have been acquired
    const prescription = prescriptions.find(p => p.id === prescriptionId);
    if (!prescription) return;

    const totalMeds = prescription.medications?.length || 0;
    const acquiredMeds = acquisitions.filter(a => a.verified).length;

    if (acquiredMeds >= totalMeds) {
      // Update prescription status to acquired
      const { error } = await supabase
        .from('prescriptions')
        .update({ 
          status: 'acquired',
          acquired_at: new Date().toISOString()
        })
        .eq('id', prescriptionId);

      if (!error) {
        toast({
          title: "✅ Ordonnance acquise",
          description: "Tous les médicaments ont été scannés",
        });
        
        // Propose to start treatment
        setTimeout(() => {
          if (confirm('Souhaitez-vous démarrer le traitement maintenant ?')) {
            startTreatment(prescriptionId);
          }
        }, 1000);
      }
    }
  };

  const startTreatment = async (prescriptionId: string) => {
    setLoading(true);
    try {
      const prescription = prescriptions.find(p => p.id === prescriptionId);
      if (!prescription) return;

      // Update prescription to in_progress
      const { error: updateError } = await supabase
        .from('prescriptions')
        .update({ 
          status: 'in_progress',
          treatment_start_date: new Date().toISOString()
        })
        .eq('id', prescriptionId);

      if (updateError) throw updateError;

      // Create reminders for each medication
      const medications = prescription.medications || [];
      for (const med of medications) {
        await supabase.from('medication_reminders' as any).insert({
          prescription_id: prescriptionId,
          patient_id: patientId,
          medication_name: med.medicationName || med.name,
          dosage: med.dosage,
          frequency: med.frequency,
          start_date: new Date().toISOString().split('T')[0],
          active: true
        });
      }

      toast({
        title: "🎯 Traitement démarré",
        description: "Les rappels ont été activés",
      });

      await loadPrescriptions();
    } catch (error) {
      console.error('Error starting treatment:', error);
      toast({
        title: "Erreur",
        description: "Impossible de démarrer le traitement",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const endTreatment = async (prescriptionId: string) => {
    setLoading(true);
    try {
      const prescription = prescriptions.find(p => p.id === prescriptionId);
      if (!prescription) return;

      // Deactivate reminders
      await supabase
        .from('medication_reminders' as any)
        .update({ active: false })
        .eq('prescription_id', prescriptionId);

      // Update prescription status
      const { error } = await supabase
        .from('prescriptions')
        .update({ 
          status: 'completed',
          treatment_end_date: new Date().toISOString()
        })
        .eq('id', prescriptionId);

      if (error) throw error;

      // Show renewal or archive options
      if (prescription.is_renewable && prescription.renewal_count < prescription.max_renewals) {
        if (confirm('Souhaitez-vous renouveler cette ordonnance ?')) {
          await renewPrescription(prescriptionId);
        } else {
          await archivePrescription(prescriptionId);
        }
      } else {
        await archivePrescription(prescriptionId);
      }

      await loadPrescriptions();
    } catch (error) {
      console.error('Error ending treatment:', error);
      toast({
        title: "Erreur",
        description: "Impossible de terminer le traitement",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renewPrescription = async (prescriptionId: string) => {
    try {
      // Get current renewal count
      const { data: currentPrescription } = await supabase
        .from('prescriptions')
        .select('renewal_count')
        .eq('id', prescriptionId)
        .single() as any;

      const newRenewalCount = (currentPrescription?.renewal_count || 0) + 1;

      const { error } = await supabase
        .from('prescriptions')
        .update({ 
          status: 'prescribed',
          renewal_count: newRenewalCount,
          treatment_start_date: null,
          treatment_end_date: null
        } as any)
        .eq('id', prescriptionId);

      if (error) throw error;

      toast({
        title: "🔄 Ordonnance renouvelée",
        description: "Vous pouvez acquérir à nouveau les médicaments",
      });

      await loadPrescriptions();
    } catch (error) {
      console.error('Error renewing prescription:', error);
      toast({
        title: "Erreur",
        description: "Impossible de renouveler l'ordonnance",
        variant: "destructive",
      });
    }
  };

  const archivePrescription = async (prescriptionId: string) => {
    try {
      const { error } = await supabase
        .from('prescriptions')
        .update({ 
          status: 'archived',
          archived_at: new Date().toISOString()
        })
        .eq('id', prescriptionId);

      if (error) throw error;

      toast({
        title: "📦 Ordonnance archivée",
        description: "Le traitement est terminé",
      });

      await loadPrescriptions();
    } catch (error) {
      console.error('Error archiving prescription:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      prescribed: { variant: 'outline' as const, icon: FileText, label: 'Prescrite' },
      acquired: { variant: 'secondary' as const, icon: ShoppingBag, label: 'Acquise' },
      in_progress: { variant: 'default' as const, icon: Clock, label: 'En cours' },
      completed: { variant: 'secondary' as const, icon: CheckCircle, label: 'Terminée' },
      archived: { variant: 'outline' as const, icon: Archive, label: 'Archivée' }
    };

    const config = variants[status as keyof typeof variants] || variants.prescribed;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center space-x-1">
        <Icon className="w-3 h-3" />
        <span>{config.label}</span>
      </Badge>
    );
  };

  const getProgressPercentage = (prescription: Prescription) => {
    const totalMeds = prescription.medications?.length || 0;
    const acquiredMeds = acquisitions.filter(a => 
      a.prescription_id === prescription.id && a.verified
    ).length;
    
    return totalMeds > 0 ? (acquiredMeds / totalMeds) * 100 : 0;
  };

  const activePrescriptions = prescriptions.filter(p => 
    ['prescribed', 'acquired', 'in_progress'].includes(p.status)
  );

  const completedPrescriptions = prescriptions.filter(p => 
    ['completed', 'archived'].includes(p.status)
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-primary" />
            <span>Suivi des Ordonnances</span>
          </CardTitle>
          <CardDescription>
            Scannez vos médicaments et suivez votre traitement
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">
            Actives ({activePrescriptions.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Terminées ({completedPrescriptions.length})
          </TabsTrigger>
          <TabsTrigger value="reminders">
            Rappels
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activePrescriptions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Aucune ordonnance active</p>
              </CardContent>
            </Card>
          ) : (
            activePrescriptions.map((prescription) => (
              <Card key={prescription.id}>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        {getStatusBadge(prescription.status)}
                        {prescription.is_renewable && (
                          <Badge variant="outline">
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Renouvelable {prescription.renewal_count || 0}/{prescription.max_renewals || 0}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Date: {new Date(prescription.prescription_date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>

                  {/* Medications list */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Médicaments ({prescription.medications?.length || 0})</p>
                    {prescription.medications?.map((med: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-secondary rounded-lg text-sm">
                        <span>{med.medicationName || med.name}</span>
                        <span className="text-muted-foreground">{med.dosage}</span>
                      </div>
                    ))}
                  </div>

                  {/* Progress */}
                  {prescription.status === 'prescribed' && (
                    <div>
                      <div className="flex items-center justify-between mb-2 text-sm">
                        <span>Acquisition</span>
                        <span>{Math.round(getProgressPercentage(prescription))}%</span>
                      </div>
                      <Progress value={getProgressPercentage(prescription)} />
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-2">
                    {prescription.status === 'prescribed' && (
                      <Button
                        onClick={() => {
                          setSelectedPrescription(prescription);
                          loadAcquisitions(prescription.id);
                          setShowScanner(true);
                        }}
                        className="flex-1"
                      >
                        <Scan className="w-4 h-4 mr-2" />
                        Scanner les médicaments
                      </Button>
                    )}
                    
                    {prescription.status === 'acquired' && (
                      <Button
                        onClick={() => startTreatment(prescription.id)}
                        disabled={loading}
                        className="flex-1"
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        Démarrer le traitement
                      </Button>
                    )}

                    {prescription.status === 'in_progress' && (
                      <Button
                        onClick={() => endTreatment(prescription.id)}
                        disabled={loading}
                        variant="outline"
                        className="flex-1"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Terminer le traitement
                      </Button>
                    )}
                  </div>

                  {/* Treatment dates */}
                  {prescription.treatment_start_date && (
                    <Alert>
                      <Calendar className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        Début: {new Date(prescription.treatment_start_date).toLocaleDateString('fr-FR')}
                        {prescription.treatment_end_date && (
                          <> • Fin: {new Date(prescription.treatment_end_date).toLocaleDateString('fr-FR')}</>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedPrescriptions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Archive className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Aucune ordonnance terminée</p>
              </CardContent>
            </Card>
          ) : (
            completedPrescriptions.map((prescription) => (
              <Card key={prescription.id} className="opacity-75">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      {getStatusBadge(prescription.status)}
                      <p className="text-sm text-muted-foreground mt-2">
                        Date: {new Date(prescription.prescription_date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm">
                    {prescription.medications?.length || 0} médicament(s)
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="reminders">
          <MedicationReminders patientId={patientId} />
        </TabsContent>
      </Tabs>

      {/* Scanner Dialog */}
      <Dialog open={showScanner} onOpenChange={setShowScanner}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Scanner les médicaments</DialogTitle>
            <DialogDescription>
              Scannez le code-barres de chaque médicament de l'ordonnance
            </DialogDescription>
          </DialogHeader>
          {selectedPrescription && (
            <BarcodeScanner
              prescriptionId={selectedPrescription.id}
              patientId={patientId}
              medications={selectedPrescription.medications}
              onScanComplete={() => handleScanComplete(selectedPrescription.id)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PrescriptionTracker;
