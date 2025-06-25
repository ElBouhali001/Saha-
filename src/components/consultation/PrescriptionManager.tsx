
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Prescription } from '@/types/patient';
import { Plus, Shield, Trash2 } from 'lucide-react';
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

    // Validation des champs obligatoires
    if (!newPrescription.medicationName.trim() || !newPrescription.dosage.trim()) {
      alert('Le nom du médicament et le dosage sont obligatoires');
      return;
    }
    
    const prescription: Prescription = {
      id: generateSecureToken(),
      medicationName: newPrescription.medicationName.trim(),
      dosage: newPrescription.dosage.trim(),
      frequency: newPrescription.frequency.trim() || 'Selon prescription',
      duration: newPrescription.duration.trim() || 'Durée à définir',
      instructions: newPrescription.instructions.trim() || 'Suivre les indications du médecin',
      prescribed_date: new Date().toISOString()
    };
    
    onPrescriptionsChange([...prescriptions, prescription]);
    
    // Reset du formulaire
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

  const handleRemovePrescription = (prescriptionId: string) => {
    if (!permissions.canCreateConsultation()) {
      alert('Accès refusé pour la suppression de prescription');
      return;
    }

    const updatedPrescriptions = prescriptions.filter(p => p.id !== prescriptionId);
    onPrescriptionsChange(updatedPrescriptions);
    
    console.log(`[AUDIT] Prescription supprimée - Patient: ${patientName} - ID: ${prescriptionId} - Doctor: ${user?.firstName} ${user?.lastName} - Time: ${new Date().toISOString()}`);
  };

  const isFormValid = newPrescription.medicationName.trim() && newPrescription.dosage.trim();

  return (
    <div className="border-t pt-4">
      <div className="flex justify-between items-center mb-3">
        <Label className="text-base font-medium">Prescriptions Sécurisées</Label>
        <Dialog open={isAddPrescriptionOpen} onOpenChange={setIsAddPrescriptionOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter Prescription
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Nouvelle Prescription Sécurisée</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="medicationName" className="text-sm font-medium">
                    Médicament *
                  </Label>
                  <Input
                    id="medicationName"
                    value={newPrescription.medicationName}
                    onChange={(e) => setNewPrescription({...newPrescription, medicationName: e.target.value})}
                    placeholder="Nom du médicament"
                    className="mt-1"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dosage" className="text-sm font-medium">
                      Dosage *
                    </Label>
                    <Input
                      id="dosage"
                      value={newPrescription.dosage}
                      onChange={(e) => setNewPrescription({...newPrescription, dosage: e.target.value})}
                      placeholder="Ex: 500mg"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="frequency" className="text-sm font-medium">
                      Fréquence
                    </Label>
                    <Input
                      id="frequency"
                      value={newPrescription.frequency}
                      onChange={(e) => setNewPrescription({...newPrescription, frequency: e.target.value})}
                      placeholder="Ex: 2x/jour"
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="duration" className="text-sm font-medium">
                    Durée
                  </Label>
                  <Input
                    id="duration"
                    value={newPrescription.duration}
                    onChange={(e) => setNewPrescription({...newPrescription, duration: e.target.value})}
                    placeholder="Ex: 7 jours"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="instructions" className="text-sm font-medium">
                    Instructions
                  </Label>
                  <Textarea
                    id="instructions"
                    value={newPrescription.instructions}
                    onChange={(e) => setNewPrescription({...newPrescription, instructions: e.target.value})}
                    placeholder="Instructions d'usage..."
                    className="mt-1 min-h-[80px]"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddPrescriptionOpen(false)}
                >
                  Annuler
                </Button>
                <Button 
                  type="button" 
                  onClick={handleAddPrescription} 
                  disabled={!isFormValid}
                  className="min-w-[140px]"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Ajouter
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {prescriptions.length === 0 ? (
        <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed">
          <Shield className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">Aucune prescription ajoutée</p>
          <p className="text-xs text-gray-400 mt-1">Cliquez sur "Ajouter Prescription" pour commencer</p>
        </div>
      ) : (
        <div className="space-y-3">
          {prescriptions.map((prescription, index) => (
            <div key={prescription.id} className="border rounded-lg p-4 bg-green-50 border-green-200 hover:bg-green-100 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-medium text-green-900 flex items-center mb-2">
                    <Shield className="w-4 h-4 mr-2 text-green-600" />
                    {prescription.medicationName}
                    <span className="ml-2 text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">
                      #{index + 1}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Dosage:</span>
                      <span className="ml-1 text-gray-600">{prescription.dosage}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Fréquence:</span>
                      <span className="ml-1 text-gray-600">{prescription.frequency}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Durée:</span>
                      <span className="ml-1 text-gray-600">{prescription.duration}</span>
                    </div>
                  </div>
                  
                  {prescription.instructions && (
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">Instructions:</span>
                      <p className="mt-1 text-gray-600 italic">{prescription.instructions}</p>
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500 mt-2">
                    Prescrit le {new Date(prescription.prescribed_date).toLocaleDateString('fr-FR')} à {new Date(prescription.prescribed_date).toLocaleTimeString('fr-FR')}
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemovePrescription(prescription.id)}
                  className="text-red-600 hover:text-red-800 hover:bg-red-50 ml-2"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PrescriptionManager;
