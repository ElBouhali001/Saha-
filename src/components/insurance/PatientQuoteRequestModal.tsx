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
import { FileText, Send, Stethoscope, User, Calendar, Plus, Trash2, Receipt } from 'lucide-react';
import { useMockDoctors } from '@/hooks/useMockDoctors';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  kinesitherapie: 'Kinésithérapie',
  chirurgie: 'Chirurgie',
};

interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

interface PatientQuoteRequestModalProps {
  open: boolean;
  onClose: () => void;
  patientName: string;
  insuranceName: string;
}

const PatientQuoteRequestModal: React.FC<PatientQuoteRequestModalProps> = ({
  open,
  onClose,
  patientName,
  insuranceName
}) => {
  const [careType, setCareType] = useState('consultation_specialisee');
  const [doctorId, setDoctorId] = useState('');
  const [plannedDate, setPlannedDate] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [items, setItems] = useState<QuoteItem[]>([
    { id: '1', description: '', quantity: 1, unitPrice: 0 }
  ]);
  
  const { data: doctors } = useMockDoctors();

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), description: '', quantity: 1, unitPrice: 0 }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof QuoteItem, value: string | number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simuler l'envoi
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    toast.success('Devis envoyé à la mutuelle', {
      description: `Votre devis de ${totalAmount.toLocaleString()} FCFA a été transmis pour validation.`
    });
    
    onClose();
    resetForm();
    setIsSubmitting(false);
  };

  const resetForm = () => {
    setCareType('consultation_specialisee');
    setDoctorId('');
    setPlannedDate('');
    setDiagnosis('');
    setAdditionalNotes('');
    setItems([{ id: '1', description: '', quantity: 1, unitPrice: 0 }]);
  };

  const selectedDoctor = doctors?.find(d => d.id === doctorId);
  const isFormValid = doctorId && diagnosis && items.every(item => item.description && item.unitPrice > 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-primary" />
            Envoyer un devis à la mutuelle
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh] pr-4">
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

            {/* Diagnostic / Motif */}
            <div className="space-y-2">
              <Label htmlFor="diagnosis">Diagnostic / Motif médical *</Label>
              <Textarea
                id="diagnosis"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="Indiquez le diagnostic ou le motif médical justifiant les soins..."
                required
                rows={2}
              />
            </div>

            {/* Lignes du devis */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Détail des prestations *</Label>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="w-4 h-4 mr-1" />
                  Ajouter une ligne
                </Button>
              </div>
              
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={item.id} className="flex items-start gap-2 p-3 border rounded-lg bg-muted/30">
                    <div className="flex-1 space-y-2">
                      <Input
                        placeholder="Description de la prestation"
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        required
                      />
                      <div className="flex gap-2">
                        <div className="w-24">
                          <Input
                            type="number"
                            placeholder="Qté"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                            min="1"
                          />
                        </div>
                        <div className="flex-1">
                          <Input
                            type="number"
                            placeholder="Prix unitaire (FCFA)"
                            value={item.unitPrice || ''}
                            onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                            min="0"
                          />
                        </div>
                        <div className="w-32 flex items-center justify-end text-sm font-medium">
                          {(item.quantity * item.unitPrice).toLocaleString()} FCFA
                        </div>
                      </div>
                    </div>
                    {items.length > 1 && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon"
                        onClick={() => removeItem(item.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="flex justify-end p-3 bg-primary/10 rounded-lg">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Montant total du devis</p>
                  <p className="text-2xl font-bold text-primary">{totalAmount.toLocaleString()} FCFA</p>
                </div>
              </div>
            </div>

            {/* Notes additionnelles */}
            <div className="space-y-2">
              <Label htmlFor="notes">Observations complémentaires</Label>
              <Textarea
                id="notes"
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="Informations complémentaires utiles pour l'étude du devis..."
                rows={2}
              />
            </div>

            {/* Info */}
            <div className="p-3 bg-amber-50 text-amber-800 rounded-lg text-xs">
              <p className="font-medium mb-1">📋 Processus de validation</p>
              <p>Le devis sera étudié par votre mutuelle qui vous enverra un accord de prise en charge sous 72h ouvrées. L'accord précisera le montant pris en charge.</p>
            </div>
          </form>
        </ScrollArea>

        <DialogFooter className="mt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || !isFormValid}
          >
            <Send className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Envoi...' : 'Envoyer le devis'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PatientQuoteRequestModal;
