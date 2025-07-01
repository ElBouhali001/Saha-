
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { globalPatientService } from '@/services/GlobalPatientService';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from 'sonner';

interface AccessRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  globalPatientId: string;
  patientName: string;
}

export function AccessRequestModal({
  open,
  onOpenChange,
  globalPatientId,
  patientName
}: AccessRequestModalProps) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentTenant } = useTenant();

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error('Veuillez préciser la raison de votre demande');
      return;
    }

    if (!currentTenant) {
      toast.error('Erreur: Tenant non identifié');
      return;
    }

    setIsSubmitting(true);
    try {
      await globalPatientService.requestAccess(
        globalPatientId,
        currentTenant.id,
        reason
      );

      toast.success('Demande d\'accès envoyée avec succès');
      onOpenChange(false);
      setReason('');
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la demande:', error);
      toast.error('Erreur lors de l\'envoi de la demande');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Demande d'accès au dossier patient</DialogTitle>
          <DialogDescription>
            Vous demandez l'accès au dossier médical de <strong>{patientName}</strong>.
            Cette demande sera transmise aux organisations détentrices du dossier.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Motif de la demande *</Label>
            <Textarea
              id="reason"
              placeholder="Expliquez pourquoi vous avez besoin d'accéder à ce dossier (ex: consultation de suivi, urgence médicale, etc.)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
            />
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Information:</strong> Le patient sera notifié de cette demande 
              et devra donner son consentement explicite pour le partage de ses données médicales.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting || !reason.trim()}
          >
            {isSubmitting ? 'Envoi en cours...' : 'Envoyer la demande'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
