import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface FollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  consultationId: string;
  patientId?: string;
  patientName: string;
}

const FollowUpModal: React.FC<FollowUpModalProps> = ({
  isOpen,
  onClose,
  consultationId,
  patientId,
  patientName
}) => {
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpTime, setFollowUpTime] = useState('');
  const [followUpType, setFollowUpType] = useState<'suivi' | 'controle' | 'bilan'>('suivi');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  // Générer les créneaux horaires disponibles
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 17; hour++) {
      for (let minute of [0, 30]) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  };

  const handleSave = () => {
    if (!followUpDate || !followUpTime || !reason.trim()) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // TODO: Intégrer avec la base de données
    console.log('Follow-up appointment data:', {
      consultationId,
      patientId,
      date: followUpDate,
      time: followUpTime,
      type: followUpType,
      reason: reason.trim(),
      notes: notes.trim()
    });

    toast.success('Rendez-vous de suivi programmé avec succès');
    handleClose();
  };

  const handleClose = () => {
    setFollowUpDate('');
    setFollowUpTime('');
    setFollowUpType('suivi');
    setReason('');
    setNotes('');
    onClose();
  };

  // Obtenir la date minimum (aujourd'hui)
  const today = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-orange-600" />
            <span>Programmation de suivi - {patientName}</span>
          </DialogTitle>
          <DialogDescription>
            Planifiez un rendez-vous de suivi pour ce patient
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Type de rendez-vous */}
          <div>
            <Label htmlFor="follow-up-type">Type de rendez-vous *</Label>
            <Select value={followUpType} onValueChange={(value: any) => setFollowUpType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir le type..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="suivi">Suivi de traitement</SelectItem>
                <SelectItem value="controle">Contrôle post-traitement</SelectItem>
                <SelectItem value="bilan">Bilan de santé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date et heure */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="follow-up-date">Date du rendez-vous *</Label>
              <Input
                id="follow-up-date"
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                min={today}
              />
            </div>
            
            <div>
              <Label htmlFor="follow-up-time">Heure *</Label>
              <Select value={followUpTime} onValueChange={setFollowUpTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir l'heure..." />
                </SelectTrigger>
                <SelectContent>
                  {generateTimeSlots().map((time) => (
                    <SelectItem key={time} value={time}>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        {time}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Motif */}
          <div>
            <Label htmlFor="reason">Motif du rendez-vous *</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Décrivez le motif du rendez-vous de suivi..."
              rows={3}
            />
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes complémentaires</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes ou instructions particulières..."
              rows={2}
            />
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={handleClose}>
              Annuler
            </Button>
            <Button 
              onClick={handleSave}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Programmer le rendez-vous
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FollowUpModal;