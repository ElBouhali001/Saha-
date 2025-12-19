import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Receipt, Send, User, Upload, X, FileText } from 'lucide-react';
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
  kinesitherapie: 'Kinésithérapie',
  chirurgie: 'Chirurgie',
};

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
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Limite de 10MB
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('Fichier trop volumineux', {
          description: 'La taille maximum est de 10 Mo.'
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast.error('Pièce jointe requise', {
        description: 'Veuillez joindre le devis du praticien.'
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simuler l'envoi
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success('Devis envoyé à la mutuelle', {
      description: `Votre devis pour ${CARE_TYPES[careType as keyof typeof CARE_TYPES]} a été transmis.`
    });
    
    onClose();
    resetForm();
    setIsSubmitting(false);
  };

  const resetForm = () => {
    setCareType('consultation_specialisee');
    setDescription('');
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' o';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' Ko';
    return (bytes / (1024 * 1024)).toFixed(1) + ' Mo';
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-primary" />
            Envoyer un devis à la mutuelle
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

          {/* Pièce jointe */}
          <div className="space-y-2">
            <Label>Devis du praticien *</Label>
            
            {!file ? (
              <div 
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium">Cliquez pour joindre le devis</p>
                <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG (max. 10 Mo)</p>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
                <div className="p-2 bg-primary/10 rounded">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                </div>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon"
                  onClick={removeFile}
                  className="text-destructive hover:text-destructive shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Description optionnelle */}
          <div className="space-y-2">
            <Label htmlFor="description">Commentaire (optionnel)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Informations complémentaires..."
              rows={2}
            />
          </div>

          {/* Info */}
          <div className="p-3 bg-amber-50 text-amber-800 rounded-lg text-xs">
            <p className="font-medium mb-1">📋 Validation sous 72h</p>
            <p>Votre mutuelle vous enverra un accord de prise en charge précisant le montant couvert.</p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting || !file}>
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Envoi...' : 'Envoyer le devis'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PatientQuoteRequestModal;
