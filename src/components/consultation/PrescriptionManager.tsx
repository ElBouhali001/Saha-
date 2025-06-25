
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Prescription } from '@/types/patient';
import { Plus, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/utils/permissions';
import { generateSecureToken } from '@/utils/security';

interface PrescriptionManagerProps {
  prescriptions: Prescription[];
  onPrescriptionsChange: (prescriptions: Prescription[]) => void;
  patientName: string;
}

const PrescriptionManager: React.FC<PrescriptionManagerProps> = ({ 
  prescriptions, 
  onPrescriptionsChange, 
  patientName 
}) => {
  const { user } = useAuth();
  const permissions = usePermissions(user);
  const [isAddPrescriptionOpen, setIsAddPrescriptionOpen] = useState(false);
  const [newPrescription, setNewPrescription] = useState({
    medicationName: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: ''
  });

  const handleAddPrescription = () => {
    if (!permissions.canCreateConsultation()) {
      alert('Accès refusé pour la prescription');
      return;
    }
    
    const prescription: Prescription = {
      id: generateSecureToken(),
      ...newPrescription,
      prescribed_date: new Date().toISOString()
    };
    
    onPrescriptionsChange([...prescriptions, prescription]);
    setNewPrescription({
      medicationName: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: ''
    });
    setIsAddPrescriptionOpen(false);
    
    // Audit log
    console.log(`[AUDIT] Prescription ajoutée - Patient: ${patientName} - Medication: ${prescription.medicationName} - Doctor: ${user?.firstName} ${user?.lastName} - Time: ${new Date().toISOString()}`);
  };

  return (
    <div className="border-t pt-4">
      <div className="flex justify-between items-center mb-3">
        <Label className="text-base font-medium">Prescriptions Sécurisées</Label>
        <Dialog open={isAddPrescriptionOpen} onOpenChange={setIsAddPrescriptionOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouvelle Prescription Sécurisée</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Médicament</Label>
                <Input
                  value={newPrescription.medicationName}
                  onChange={(e) => setNewPrescription({...newPrescription, medicationName: e.target.value})}
                  placeholder="Nom du médicament"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Dosage</Label>
                  <Input
                    value={newPrescription.dosage}
                    onChange={(e) => setNewPrescription({...newPrescription, dosage: e.target.value})}
                    placeholder="Ex: 500mg"
                  />
                </div>
                <div>
                  <Label>Fréquence</Label>
                  <Input
                    value={newPrescription.frequency}
                    onChange={(e) => setNewPrescription({...newPrescription, frequency: e.target.value})}
                    placeholder="Ex: 2x/jour"
                  />
                </div>
              </div>
              <div>
                <Label>Durée</Label>
                <Input
                  value={newPrescription.duration}
                  onChange={(e) => setNewPrescription({...newPrescription, duration: e.target.value})}
                  placeholder="Ex: 7 jours"
                />
              </div>
              <div>
                <Label>Instructions</Label>
                <Textarea
                  value={newPrescription.instructions}
                  onChange={(e) => setNewPrescription({...newPrescription, instructions: e.target.value})}
                  placeholder="Instructions d'usage..."
                />
              </div>
              <Button onClick={handleAddPrescription} className="w-full">
                <Shield className="w-4 h-4 mr-2" />
                Ajouter Prescription
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {prescriptions.length === 0 ? (
        <p className="text-sm text-gray-500">Aucune prescription ajoutée</p>
      ) : (
        <div className="space-y-2">
          {prescriptions.map((prescription) => (
            <div key={prescription.id} className="border rounded p-3 text-sm bg-green-50">
              <div className="font-medium flex items-center">
                {prescription.medicationName}
                <Shield className="w-3 h-3 ml-2 text-green-600" />
              </div>
              <div className="text-gray-600">
                {prescription.dosage} - {prescription.frequency} - {prescription.duration}
              </div>
              <div className="text-gray-500 text-xs mt-1">
                {prescription.instructions}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PrescriptionManager;
