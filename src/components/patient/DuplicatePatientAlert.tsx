
import React, { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Share2, FileText, GitMerge } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PatientService } from '@/services/PatientService';
import { useTenant } from '@/contexts/TenantContext';
import { useToast } from '@/components/ui/use-toast';

interface DuplicatePatientAlertProps {
  globalPatientId: string;
  otherTenants: Array<{
    name: string;
    lastVisit?: string;
    hasConsent: boolean;
  }>;
  onAction: (action: 'REQUEST_ACCESS' | 'CREATE_LOCAL' | 'MERGE') => void;
}

export const DuplicatePatientAlert: React.FC<DuplicatePatientAlertProps> = ({
  globalPatientId,
  otherTenants,
  onAction
}) => {
  const [requestReason, setRequestReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { tenant } = useTenant();
  const { toast } = useToast();

  const handleRequestAccess = async () => {
    if (!requestReason.trim()) {
      toast({
        title: "Raison requise",
        description: "Veuillez expliquer pourquoi vous demandez l'accès à ce dossier",
        variant: "destructive",
      });
      return;
    }

    if (!tenant) {
      toast({
        title: "Erreur",
        description: "Organisation non définie",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await PatientService.requestPatientAccess(
        globalPatientId,
        tenant.id,
        requestReason
      );
      
      toast({
        title: "Demande envoyée",
        description: "Votre demande d'accès au dossier a été envoyée",
      });
      
      onAction('REQUEST_ACCESS');
    } catch (error) {
      console.error('Erreur lors de la demande d\'accès:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la demande d'accès",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Jamais';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  return (
    <Alert className="p-6 border-orange-200 bg-orange-50">
      <AlertCircle className="h-5 w-5 text-orange-600" />
      <div className="ml-3">
        <h3 className="text-lg font-semibold text-orange-800">
          Patient existant détecté
        </h3>
        <p className="mt-2 text-sm text-orange-700">
          Ce patient possède déjà un dossier dans {otherTenants.length} organisation(s) :
        </p>
        
        <ul className="mt-3 space-y-2">
          {otherTenants.map((org, index) => (
            <li key={index} className="flex items-center justify-between p-2 bg-white rounded border">
              <span className="font-medium text-gray-900">{org.name}</span>
              <div className="flex items-center gap-2">
                {org.lastVisit && (
                  <span className="text-sm text-gray-600">
                    Dernière visite: {formatDate(org.lastVisit)}
                  </span>
                )}
                {org.hasConsent && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Accès autorisé
                  </Badge>
                )}
              </div>
            </li>
          ))}
        </ul>
        
        <div className="mt-6 flex flex-wrap gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Share2 className="h-4 w-4 mr-2" />
                Demander l'accès au dossier
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Demande d'accès au dossier patient</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                    Motif de la demande
                  </label>
                  <Textarea
                    id="reason"
                    placeholder="Expliquez pourquoi vous avez besoin d'accéder à ce dossier..."
                    value={requestReason}
                    onChange={(e) => setRequestReason(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <DialogTrigger asChild>
                    <Button variant="outline">Annuler</Button>
                  </DialogTrigger>
                  <Button 
                    onClick={handleRequestAccess}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Envoi...' : 'Envoyer la demande'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button 
            onClick={() => onAction('CREATE_LOCAL')}
            variant="outline"
            className="border-gray-300 hover:bg-gray-50"
          >
            <FileText className="h-4 w-4 mr-2" />
            Créer un nouveau dossier local
          </Button>
          
          <Button 
            onClick={() => onAction('MERGE')}
            variant="outline"
            className="border-gray-300 hover:bg-gray-50"
          >
            <GitMerge className="h-4 w-4 mr-2" />
            Fusionner les dossiers
          </Button>
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700">
            <strong>Information:</strong> La demande d'accès nécessite le consentement du patient 
            et sera soumise aux autres organisations. Vous recevrez une notification une fois 
            la demande traitée.
          </p>
        </div>
      </div>
    </Alert>
  );
};
