import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Send } from 'lucide-react';
import { useCreateAuthorizationRequest, CARE_TYPES } from '@/hooks/useInsuranceCoverage';

interface AuthorizationRequestModalProps {
  open: boolean;
  onClose: () => void;
  patientInsuranceId: string;
  doctorId: string;
  defaultCareType?: string;
  patientName: string;
}

const AuthorizationRequestModal: React.FC<AuthorizationRequestModalProps> = ({
  open,
  onClose,
  patientInsuranceId,
  doctorId,
  defaultCareType,
  patientName
}) => {
  const [careType, setCareType] = useState(defaultCareType || 'consultation_generale');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  
  const { mutate: createRequest, isPending } = useCreateAuthorizationRequest();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    createRequest({
      patient_insurance_id: patientInsuranceId,
      doctor_id: doctorId,
      care_type: careType,
      requested_amount: parseFloat(amount),
      care_description: description
    }, {
      onSuccess: () => {
        onClose();
        setAmount('');
        setDescription('');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            Demande d'autorisation de soins
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Patient</p>
            <p className="font-medium">{patientName}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="care-type">Type de soin</Label>
            <Select value={careType} onValueChange={setCareType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CARE_TYPES).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Montant demandé (FCFA)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Ex: 50000"
              required
              min="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description des soins</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez les soins nécessitant une autorisation..."
              required
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isPending}>
              <Send className="w-4 h-4 mr-2" />
              {isPending ? 'Envoi...' : 'Envoyer la demande'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AuthorizationRequestModal;
