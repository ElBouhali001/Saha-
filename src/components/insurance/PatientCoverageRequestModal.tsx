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
import { FileCheck, Send, Stethoscope, User, Calendar } from 'lucide-react';
import { useMockDoctors } from '@/hooks/useMockDoctors';
import { toast } from 'sonner';

const CARE_TYPES = {
  consultation_generale: 'Consultation générale',
  consultation_specialisee: 'Consultation spécialisée',
  actes_medicaux: 'Actes médicaux',
  pharmacie: 'Pharmacie',
  hospitalisation: 'Hospitalisation',
  examens_labo: 'Examens laboratoire',
  imagerie: 'Imagerie médicale',
  soins_dentaires: 'Soins dentaires',
  optique: 'Optique',
};

interface PatientCoverageRequestModalProps {
  open: boolean;
  onClose: () => void;
  patientName: string;
  insuranceName: string;
}

const PatientCoverageRequestModal: React.FC<PatientCoverageRequestModalProps> = ({
  open,
  onClose,
  patientName,
  insuranceName
}) => {
  const [careType, setCareType] = useState('consultation_generale');
  const [doctorId, setDoctorId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [plannedDate, setPlannedDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { data: doctors } = useMockDoctors();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simuler l'envoi
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success('Demande de prise en charge envoyée', {
      description: 'Votre mutuelle va étudier votre demande sous 48h.'
    });
    
    onClose();
    setCareType('consultation_generale');
    setDoctorId('');
    setAmount('');
    setDescription('');
    setPlannedDate('');
    setIsSubmitting(false);
  };

  const selectedDoctor = doctors?.find(d => d.id === doctorId);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-primary" />
            Demande de prise en charge
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Info patient et mutuelle */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <User className="w-3 h-3" /> Patient
              </p>
              <p className="font-medium text-sm">{patientName}</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <p className="text-xs text-muted-foreground">Mutuelle</p>
              <p className="font-medium text-sm text-primary">{insuranceName}</p>
            </div>
          </div>

          {/* Type de soin */}
          <div className="space-y-2">
            <Label htmlFor="care-type">Type de soin *</Label>
            <Select value={careType} onValueChange={setCareType}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le type de soin" />
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

          {/* Praticien */}
          <div className="space-y-2">
            <Label htmlFor="doctor" className="flex items-center gap-1">
              <Stethoscope className="w-4 h-4" />
              Praticien *
            </Label>
            <Select value={doctorId} onValueChange={setDoctorId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un praticien" />
              </SelectTrigger>
              <SelectContent>
                {doctors?.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id}>
                    <div className="flex items-center gap-2">
                      <span>Dr. {doctor.profile.first_name} {doctor.profile.last_name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({doctor.doctor_specialties[0]?.specialty.name})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedDoctor && (
              <p className="text-xs text-muted-foreground">
                Spécialité: {selectedDoctor.doctor_specialties[0]?.specialty.name} • 
                Honoraires: {selectedDoctor.consultation_fee.toLocaleString()} FCFA
              </p>
            )}
          </div>

          {/* Date prévue */}
          <div className="space-y-2">
            <Label htmlFor="planned-date" className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Date prévue des soins
            </Label>
            <Input
              id="planned-date"
              type="date"
              value={plannedDate}
              onChange={(e) => setPlannedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Montant estimé */}
          <div className="space-y-2">
            <Label htmlFor="amount">Montant estimé (FCFA) *</Label>
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

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Motif et précisions *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez le motif des soins, les symptômes, le diagnostic si connu..."
              required
              rows={3}
            />
          </div>

          {/* Info */}
          <div className="p-3 bg-blue-50 text-blue-800 rounded-lg text-xs">
            <p className="font-medium mb-1">📋 Délai de traitement</p>
            <p>Votre demande sera étudiée sous 48h ouvrées. Vous recevrez une notification avec la décision de votre mutuelle.</p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting || !doctorId || !amount || !description}>
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Envoi...' : 'Envoyer la demande'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PatientCoverageRequestModal;
