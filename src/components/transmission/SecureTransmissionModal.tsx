
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Send, QrCode, Copy, Check } from 'lucide-react';
import { useCreateTransmission } from '@/hooks/useTransmissions';
import { useDoctors } from '@/hooks/useDoctors';
import { TransmissionCreate } from '@/types/transmission';
import { toast } from 'sonner';

interface SecureTransmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  consultationId: string;
  patientName: string;
  specialistMode?: boolean;
}

const transmissibleElements = [
  { id: 'identity', label: 'Identité du patient' },
  { id: 'medical_history', label: 'Antécédents médicaux' },
  { id: 'consultation_summary', label: 'Résumé de consultation' },
  { id: 'test_results', label: 'Résultats d\'examens' },
  { id: 'diagnosis', label: 'Diagnostic' },
  { id: 'prescriptions', label: 'Prescriptions' }
];

const SecureTransmissionModal: React.FC<SecureTransmissionModalProps> = ({
  isOpen,
  onClose,
  consultationId,
  patientName,
  specialistMode = false
}) => {
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [recipientType, setRecipientType] = useState<'specialist' | 'laboratory' | 'doctor'>(
    specialistMode ? 'specialist' : 'specialist'
  );
  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const [reason, setReason] = useState('');
  const [validityHours, setValidityHours] = useState(48);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { data: doctors } = useDoctors();
  const createTransmission = useCreateTransmission();

  // Filtrer les médecins selon le mode
  const availableDoctors = specialistMode 
    ? doctors?.filter(doctor => {
        const primarySpecialty = doctor.doctor_specialties?.find((ds: any) => ds.is_primary);
        const specialtyName = primarySpecialty?.specialty?.name || '';
        // Exclure "Médecine Générale" pour les spécialistes
        return specialtyName && specialtyName !== 'Médecine Générale';
      })
    : doctors;

  const handleElementToggle = (elementId: string) => {
    setSelectedElements(prev => 
      prev.includes(elementId) 
        ? prev.filter(id => id !== elementId)
        : [...prev, elementId]
    );
  };

  const handleSubmit = async () => {
    if (!selectedRecipient || selectedElements.length === 0 || !reason.trim()) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      const transmissionData: TransmissionCreate = {
        consultation_id: consultationId,
        recipient_id: selectedRecipient,
        recipient_type: recipientType,
        transmitted_elements: selectedElements,
        reason: reason.trim(),
        validity_hours: validityHours
      };

      const result = await createTransmission.mutateAsync(transmissionData);
      setGeneratedCode(result.access_code);
      toast.success('Code de transmission généré avec succès');
    } catch (error) {
      toast.error('Erreur lors de la génération du code');
      console.error('Transmission error:', error);
    }
  };

  const copyToClipboard = async () => {
    if (generatedCode) {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Code copié dans le presse-papiers');
    }
  };

  const resetForm = () => {
    setSelectedRecipient('');
    setRecipientType('specialist');
    setSelectedElements([]);
    setReason('');
    setValidityHours(48);
    setGeneratedCode(null);
    setCopied(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Helper function to get primary specialty
  const getPrimarySpecialty = (doctor: any) => {
    const primarySpecialty = doctor.doctor_specialties?.find((ds: any) => ds.is_primary);
    return primarySpecialty?.specialty?.name || doctor.doctor_specialties?.[0]?.specialty?.name || 'Spécialité non définie';
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Send className="w-5 h-5 text-blue-600" />
            <span>{specialistMode ? 'Transmission vers un Spécialiste' : 'Transmission Sécurisée'} - {patientName}</span>
          </DialogTitle>
          <DialogDescription>
            {specialistMode 
              ? 'Transmettez ce dossier médical à un médecin spécialiste avec un code d\'accès sécurisé'
              : 'Générez un code d\'accès sécurisé pour partager des éléments du dossier médical'
            }
          </DialogDescription>
        </DialogHeader>

        {!generatedCode ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="recipient-type">Type de destinataire</Label>
                <Select value={recipientType} onValueChange={(value: any) => setRecipientType(value)} disabled={specialistMode}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="specialist">Spécialiste</SelectItem>
                    {!specialistMode && <SelectItem value="laboratory">Laboratoire</SelectItem>}
                    {!specialistMode && <SelectItem value="doctor">Médecin</SelectItem>}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="recipient">Destinataire</Label>
                <Select value={selectedRecipient} onValueChange={setSelectedRecipient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir le destinataire..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDoctors?.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        Dr. {doctor.profile?.first_name} {doctor.profile?.last_name} - {getPrimarySpecialty(doctor)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-base font-medium mb-3 block">Éléments à transmettre</Label>
              <div className="grid grid-cols-2 gap-3">
                {transmissibleElements.map((element) => (
                  <div key={element.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={element.id}
                      checked={selectedElements.includes(element.id)}
                      onCheckedChange={() => handleElementToggle(element.id)}
                    />
                    <Label htmlFor={element.id} className="text-sm">
                      {element.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="reason">Motif de la transmission *</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Précisez le motif de cette transmission..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="validity">Durée de validité (heures)</Label>
              <Select value={validityHours.toString()} onValueChange={(v) => setValidityHours(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24">24 heures</SelectItem>
                  <SelectItem value="48">48 heures</SelectItem>
                  <SelectItem value="72">72 heures</SelectItem>
                  <SelectItem value="168">7 jours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={handleClose}>
                Annuler
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={createTransmission.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {createTransmission.isPending ? 'Génération...' : 'Générer le code'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-6">
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-4">
                Code d'accès généré avec succès
              </h3>
              
              <div className="bg-white p-4 rounded border-2 border-green-200 mb-4">
                <div className="text-3xl font-mono font-bold text-gray-800 mb-2">
                  {generatedCode}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  className="text-green-600"
                >
                  {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copied ? 'Copié!' : 'Copier le code'}
                </Button>
              </div>

              <div className="text-sm text-green-700 space-y-1">
                <p>Validité: {validityHours} heures</p>
                <p>Expire le: {new Date(Date.now() + validityHours * 60 * 60 * 1000).toLocaleString('fr-FR')}</p>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-center mb-3">
                <QrCode className="w-6 h-6 text-blue-600 mr-2" />
                <span className="text-blue-800 font-medium">QR Code disponible</span>
              </div>
              <p className="text-sm text-blue-700">
                Le destinataire peut scanner le QR code pour un accès rapide
              </p>
            </div>

            <div className="flex justify-center space-x-3">
              <Button variant="outline" onClick={() => window.print()}>
                Imprimer
              </Button>
              <Button onClick={handleClose} className="bg-blue-600 hover:bg-blue-700">
                Fermer
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SecureTransmissionModal;
