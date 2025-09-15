import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface PrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  consultationId: string;
  patientId?: string;
  patientName: string;
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

const PrescriptionModal: React.FC<PrescriptionModalProps> = ({
  isOpen,
  onClose,
  consultationId,
  patientId,
  patientName
}) => {
  const [medications, setMedications] = useState<Medication[]>([
    { 
      id: '1', 
      name: '', 
      dosage: '', 
      frequency: '', 
      duration: '', 
      instructions: '' 
    }
  ]);
  const [generalInstructions, setGeneralInstructions] = useState('');

  const addMedication = () => {
    const newMedication: Medication = {
      id: Date.now().toString(),
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: ''
    };
    setMedications([...medications, newMedication]);
  };

  const removeMedication = (id: string) => {
    if (medications.length > 1) {
      setMedications(medications.filter(med => med.id !== id));
    }
  };

  const updateMedication = (id: string, field: keyof Medication, value: string) => {
    setMedications(medications.map(med => 
      med.id === id ? { ...med, [field]: value } : med
    ));
  };

  const handleSave = () => {
    const validMedications = medications.filter(med => 
      med.name.trim() && med.dosage.trim() && med.frequency.trim()
    );

    if (validMedications.length === 0) {
      toast.error('Veuillez ajouter au moins un médicament valide');
      return;
    }

    // TODO: Intégrer avec la base de données
    console.log('Prescription data:', {
      consultationId,
      patientId,
      medications: validMedications,
      generalInstructions
    });

    toast.success('Ordonnance créée avec succès');
    handleClose();
  };

  const handleClose = () => {
    setMedications([{ 
      id: '1', 
      name: '', 
      dosage: '', 
      frequency: '', 
      duration: '', 
      instructions: '' 
    }]);
    setGeneralInstructions('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-green-600" />
            <span>Rédaction d'ordonnance - {patientName}</span>
          </DialogTitle>
          <DialogDescription>
            Créez une ordonnance médicale pour ce patient
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Liste des médicaments */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Médicaments prescrits</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addMedication}
                className="text-blue-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un médicament
              </Button>
            </div>

            {medications.map((medication, index) => (
              <div key={medication.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Médicament {index + 1}</h4>
                  {medications.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMedication(medication.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor={`name-${medication.id}`}>Nom du médicament *</Label>
                    <Input
                      id={`name-${medication.id}`}
                      value={medication.name}
                      onChange={(e) => updateMedication(medication.id, 'name', e.target.value)}
                      placeholder="Ex: Paracétamol"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`dosage-${medication.id}`}>Dosage *</Label>
                    <Input
                      id={`dosage-${medication.id}`}
                      value={medication.dosage}
                      onChange={(e) => updateMedication(medication.id, 'dosage', e.target.value)}
                      placeholder="Ex: 500mg"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`frequency-${medication.id}`}>Fréquence *</Label>
                    <Input
                      id={`frequency-${medication.id}`}
                      value={medication.frequency}
                      onChange={(e) => updateMedication(medication.id, 'frequency', e.target.value)}
                      placeholder="Ex: 3 fois par jour"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`duration-${medication.id}`}>Durée</Label>
                    <Input
                      id={`duration-${medication.id}`}
                      value={medication.duration}
                      onChange={(e) => updateMedication(medication.id, 'duration', e.target.value)}
                      placeholder="Ex: 7 jours"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor={`instructions-${medication.id}`}>Instructions particulières</Label>
                  <Textarea
                    id={`instructions-${medication.id}`}
                    value={medication.instructions}
                    onChange={(e) => updateMedication(medication.id, 'instructions', e.target.value)}
                    placeholder="Ex: À prendre après les repas"
                    rows={2}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Instructions générales */}
          <div>
            <Label htmlFor="general-instructions">Instructions générales</Label>
            <Textarea
              id="general-instructions"
              value={generalInstructions}
              onChange={(e) => setGeneralInstructions(e.target.value)}
              placeholder="Instructions générales pour le patient..."
              rows={3}
            />
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={handleClose}>
              Annuler
            </Button>
            <Button 
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700"
            >
              Créer l'ordonnance
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrescriptionModal;