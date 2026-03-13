import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Lock, Unlock } from 'lucide-react';

interface BlockSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTime: string;
  selectedDate: string;
  doctorId: string;
  isBlocked: boolean;
  onBlock: (doctorId: string, date: string, time: string, reason?: string) => void;
  onUnblock: (doctorId: string, date: string, time: string) => void;
}

const BlockSlotModal: React.FC<BlockSlotModalProps> = ({
  isOpen,
  onClose,
  selectedTime,
  selectedDate,
  doctorId,
  isBlocked,
  onBlock,
  onUnblock
}) => {
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    if (isBlocked) {
      onUnblock(doctorId, selectedDate, selectedTime);
    } else {
      onBlock(doctorId, selectedDate, selectedTime, reason);
    }
    setReason('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isBlocked ? (
              <>
                <Unlock className="w-5 h-5 text-green-600" />
                Débloquer le créneau
              </>
            ) : (
              <>
                <Lock className="w-5 h-5 text-orange-600" />
                Bloquer le créneau
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Date :</strong> {new Date(selectedDate).toLocaleDateString('fr-FR')}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Heure :</strong> {selectedTime}
            </p>
          </div>

          {isBlocked ? (
            <div className="text-center py-4">
              <p className="text-gray-600 mb-4">
                Êtes-vous sûr de vouloir débloquer ce créneau ?
              </p>
              <p className="text-sm text-gray-500">
                Une fois débloqué, ce créneau redeviendra disponible pour les réservations.
              </p>
            </div>
          ) : (
            <div>
              <Label htmlFor="reason">Raison du blocage (optionnel)</Label>
              <Textarea
                id="reason"
                placeholder="Ex: Congés, formation, indisponibilité..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-2"
              />
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              onClick={handleSubmit}
              className={`flex-1 ${
                isBlocked 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-orange-600 hover:bg-orange-700'
              }`}
            >
              {isBlocked ? (
                <>
                  <Unlock className="w-4 h-4 mr-2" />
                  Débloquer
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Bloquer
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BlockSlotModal;