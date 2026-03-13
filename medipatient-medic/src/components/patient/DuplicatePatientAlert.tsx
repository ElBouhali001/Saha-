
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Share2, FilePlus, GitMerge } from 'lucide-react';
import { formatDate } from 'date-fns';

interface DuplicatePatientAlertProps {
  existingPatient: {
    globalId: string;
    organizations: Array<{
      name: string;
      lastVisit?: Date;
      hasConsent: boolean;
    }>;
  };
  onAction: (action: 'REQUEST_ACCESS' | 'CREATE_LOCAL' | 'MERGE') => void;
  onCancel: () => void;
}

export function DuplicatePatientAlert({ 
  existingPatient, 
  onAction, 
  onCancel 
}: DuplicatePatientAlertProps) {
  return (
    <Alert variant="destructive" className="p-6 border-orange-200 bg-orange-50">
      <AlertCircle className="h-5 w-5 text-orange-600" />
      <div className="ml-3">
        <h3 className="text-lg font-semibold text-orange-800">Patient existant détecté</h3>
        <AlertDescription className="mt-2 text-orange-700">
          Ce patient possède déjà un dossier dans {existingPatient.organizations.length} organisation(s) :
        </AlertDescription>
        
        <ul className="mt-3 space-y-2">
          {existingPatient.organizations.map((org, index) => (
            <li key={index} className="flex items-center justify-between p-3 bg-white border border-orange-200 rounded-lg">
              <span className="font-medium text-gray-900">{org.name}</span>
              <div className="flex items-center gap-2">
                {org.lastVisit && (
                  <span className="text-sm text-gray-600">
                    Dernière visite: {formatDate(org.lastVisit, 'dd/MM/yyyy')}
                  </span>
                )}
                {org.hasConsent && (
                  <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                    Accès autorisé
                  </Badge>
                )}
              </div>
            </li>
          ))}
        </ul>
        
        <div className="mt-6 flex flex-wrap gap-3">
          <Button 
            onClick={() => onAction('REQUEST_ACCESS')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Demander l'accès au dossier partagé
          </Button>
          
          <Button 
            onClick={() => onAction('CREATE_LOCAL')}
            variant="secondary"
            className="border-orange-300 text-orange-700 hover:bg-orange-100"
          >
            <FilePlus className="h-4 w-4 mr-2" />
            Créer un nouveau dossier local
          </Button>
          
          <Button 
            onClick={() => onAction('MERGE')}
            variant="outline"
            className="border-orange-300 text-orange-700 hover:bg-orange-50"
          >
            <GitMerge className="h-4 w-4 mr-2" />
            Fusionner les dossiers
          </Button>
          
          <Button 
            onClick={onCancel}
            variant="ghost"
            className="text-gray-600 hover:text-gray-800"
          >
            Annuler
          </Button>
        </div>
        
        <p className="mt-4 text-xs text-orange-600 bg-orange-100 p-2 rounded border border-orange-200">
          ⚠️ La demande d'accès nécessite le consentement du patient et sera soumise aux autres organisations.
        </p>
      </div>
    </Alert>
  );
}
