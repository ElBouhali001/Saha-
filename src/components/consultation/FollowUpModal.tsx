import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  consultationId: string;
  patientName: string;
  patientId: string;
}

const FollowUpModal: React.FC<FollowUpModalProps> = ({
  isOpen,
  onClose,
  consultationId,
  patientName,
  patientId
}) => {
  const { toast } = useToast();
  const [followUpData, setFollowUpData] = useState({
    type: '',
    frequency: '',
    duration: '',
    nextAppointment: '',
    instructions: '',
    priority: 'normal'
  });

  const followUpTypes = [
    { value: 'control', label: 'Contrôle médical' },
    { value: 'monitoring', label: 'Surveillance thérapeutique' },
    { value: 'results', label: 'Résultats d\'examens' },
    { value: 'evolution', label: 'Évolution pathologique' },
    { value: 'chronic', label: 'Suivi maladie chronique' }
  ];

  const frequencies = [
    { value: '1-week', label: 'Dans 1 semaine' },
    { value: '2-weeks', label: 'Dans 2 semaines' },
    { value: '1-month', label: 'Dans 1 mois' },
    { value: '3-months', label: 'Dans 3 mois' },
    { value: '6-months', label: 'Dans 6 mois' },
    { value: 'annual', label: 'Suivi annuel' }
  ];

  const handleSaveFollowUp = () => {
    if (!followUpData.type || !followUpData.frequency) {
      toast({
        title: "Erreur",
        description: "Veuillez renseigner le type et la fréquence du suivi",
        variant: "destructive"
      });
      return;
    }

    // Ici vous pouvez sauvegarder le suivi
    console.log('Suivi programmé:', {
      consultationId,
      patientId,
      followUpData
    });

    toast({
      title: "Suivi programmé",
      description: `Rendez-vous de suivi planifié pour ${patientName}`,
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Programmer un suivi médical - {patientName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Type de suivi *</Label>
              <Select value={followUpData.type} onValueChange={(value) => setFollowUpData({...followUpData, type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le type" />
                </SelectTrigger>
                <SelectContent>
                  {followUpTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Fréquence *</Label>
              <Select value={followUpData.frequency} onValueChange={(value) => setFollowUpData({...followUpData, frequency: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Fréquence du suivi" />
                </SelectTrigger>
                <SelectContent>
                  {frequencies.map((freq) => (
                    <SelectItem key={freq.value} value={freq.value}>
                      {freq.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Priorité</Label>
              <Select value={followUpData.priority} onValueChange={(value) => setFollowUpData({...followUpData, priority: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Faible</SelectItem>
                  <SelectItem value="normal">Normale</SelectItem>
                  <SelectItem value="high">Élevée</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Prochain RDV (optionnel)</Label>
              <Input
                type="date"
                value={followUpData.nextAppointment}
                onChange={(e) => setFollowUpData({...followUpData, nextAppointment: e.target.value})}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div>
            <Label>Instructions pour le suivi</Label>
            <Textarea
              value={followUpData.instructions}
              onChange={(e) => setFollowUpData({...followUpData, instructions: e.target.value})}
              placeholder="Précisez les éléments à surveiller, examens à prévoir, recommandations..."
              rows={4}
            />
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center text-blue-700 mb-2">
              <Clock className="w-4 h-4 mr-2" />
              <span className="font-medium">Rappel automatique</span>
            </div>
            <p className="text-sm text-blue-600">
              Le patient recevra un rappel automatique avant son prochain rendez-vous selon la fréquence définie.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSaveFollowUp}>
            Programmer le suivi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FollowUpModal;