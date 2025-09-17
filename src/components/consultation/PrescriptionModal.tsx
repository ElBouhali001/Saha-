import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pill, Plus, Minus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface PrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  consultationId: string;
  patientName: string;
  patientId: string;
  consultation: {
    symptoms: string;
    diagnosis: string;
    treatment: string;
    notes: string;
  };
}

const PrescriptionModal: React.FC<PrescriptionModalProps> = ({
  isOpen,
  onClose,
  consultationId,
  patientName,
  patientId,
  consultation
}) => {
  const { toast } = useToast();
  const [medications, setMedications] = useState<Medication[]>([{
    name: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: ''
  }]);

  const addMedication = () => {
    setMedications([...medications, {
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: ''
    }]);
  };

  const removeMedication = (index: number) => {
    if (medications.length > 1) {
      setMedications(medications.filter((_, i) => i !== index));
    }
  };

  const updateMedication = (index: number, field: keyof Medication, value: string) => {
    const updated = medications.map((med, i) => 
      i === index ? { ...med, [field]: value } : med
    );
    setMedications(updated);
  };

  const handleSavePrescription = () => {
    const validMedications = medications.filter(med => med.name && med.dosage);
    
    if (validMedications.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez ajouter au moins un médicament avec nom et dosage",
        variant: "destructive"
      });
      return;
    }

    // Ici vous pouvez sauvegarder la prescription
    console.log('Prescription sauvegardée:', {
      consultationId,
      patientId,
      medications: validMedications,
      diagnosis: consultation.diagnosis
    });

    toast({
      title: "Ordonnance créée",
      description: `Ordonnance générée avec ${validMedications.length} médicament(s) pour ${patientName}`,
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Pill className="w-5 h-5 mr-2" />
            Rédaction d'ordonnance - {patientName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="font-medium mb-2">Diagnostic</h4>
            <p className="text-sm text-gray-700">{consultation.diagnosis || 'Aucun diagnostic renseigné'}</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Médicaments prescrits</h4>
              <Button onClick={addMedication} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Ajouter
              </Button>
            </div>

            {medications.map((medication, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-medium">Médicament {index + 1}</h5>
                  {medications.length > 1 && (
                    <Button 
                      onClick={() => removeMedication(index)} 
                      variant="ghost" 
                      size="sm"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Nom du médicament *</Label>
                    <Input
                      value={medication.name}
                      onChange={(e) => updateMedication(index, 'name', e.target.value)}
                      placeholder="Ex: Paracétamol"
                    />
                  </div>
                  <div>
                    <Label>Dosage *</Label>
                    <Input
                      value={medication.dosage}
                      onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                      placeholder="Ex: 500mg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Fréquence</Label>
                    <Select value={medication.frequency} onValueChange={(value) => updateMedication(index, 'frequency', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Fréquence de prise" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1x/jour">1 fois par jour</SelectItem>
                        <SelectItem value="2x/jour">2 fois par jour</SelectItem>
                        <SelectItem value="3x/jour">3 fois par jour</SelectItem>
                        <SelectItem value="4x/jour">4 fois par jour</SelectItem>
                        <SelectItem value="si-besoin">Si besoin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Durée</Label>
                    <Select value={medication.duration} onValueChange={(value) => updateMedication(index, 'duration', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Durée du traitement" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3-jours">3 jours</SelectItem>
                        <SelectItem value="7-jours">7 jours</SelectItem>
                        <SelectItem value="14-jours">14 jours</SelectItem>
                        <SelectItem value="1-mois">1 mois</SelectItem>
                        <SelectItem value="3-mois">3 mois</SelectItem>
                        <SelectItem value="continu">Traitement continu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Instructions particulières</Label>
                  <Textarea
                    value={medication.instructions}
                    onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                    placeholder="Ex: À prendre avant les repas, avec un grand verre d'eau..."
                    rows={2}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSavePrescription}>
            Créer l'ordonnance
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PrescriptionModal;