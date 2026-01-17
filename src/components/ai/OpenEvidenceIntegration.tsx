import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Copy, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OpenEvidenceIntegrationProps {
  symptoms: string;
  patientAge?: string;
  patientGender?: string;
  onDiagnosisImport?: (diagnosis: string) => void;
}

const OpenEvidenceIntegration: React.FC<OpenEvidenceIntegrationProps> = ({
  symptoms,
  patientAge,
  patientGender,
  onDiagnosisImport
}) => {
  const [diagnosisResult, setDiagnosisResult] = useState('');
  const [isImported, setIsImported] = useState(false);
  const { toast } = useToast();

  const getOpenEvidenceUrl = () => {
    let openEvidenceUrl = 'https://www.openevidence.com';
    
    if (symptoms.trim()) {
      let searchQuery = symptoms;
      if (patientAge) {
        searchQuery += ` patient ${patientAge} ans`;
      }
      if (patientGender) {
        searchQuery += ` ${patientGender === 'M' ? 'homme' : 'femme'}`;
      }
      openEvidenceUrl = `https://www.openevidence.com/search?q=${encodeURIComponent(searchQuery)}`;
    }
    
    return openEvidenceUrl;
  };

  const copySymptoms = () => {
    let textToCopy = symptoms;
    if (patientAge || patientGender) {
      textToCopy += `\n\nInformations patient:`;
      if (patientAge) textToCopy += `\n- Âge: ${patientAge} ans`;
      if (patientGender) textToCopy += `\n- Sexe: ${patientGender === 'M' ? 'Masculin' : 'Féminin'}`;
    }
    
    navigator.clipboard.writeText(textToCopy);
    toast({
      title: "Copié",
      description: "Les symptômes ont été copiés dans le presse-papiers",
    });
  };

  const handleImportDiagnosis = () => {
    if (!diagnosisResult.trim()) {
      toast({
        title: "Diagnostic vide",
        description: "Veuillez coller le résultat d'OpenEvidence avant d'importer",
        variant: "destructive",
      });
      return;
    }

    if (onDiagnosisImport) {
      onDiagnosisImport(diagnosisResult);
      setIsImported(true);
      toast({
        title: "Diagnostic importé",
        description: "Le diagnostic OpenEvidence a été ajouté à la consultation",
      });
    }
  };

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center space-x-2">
            <ExternalLink className="w-5 h-5 text-blue-600" />
            <span>Consultation OpenEvidence</span>
          </div>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Diagnostic IA Médical
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-white p-4 rounded-lg border border-blue-200">
          <Label className="text-sm font-medium text-gray-700 mb-2">
            Symptômes à rechercher
          </Label>
          <div className="text-sm text-gray-600 p-2 bg-gray-50 rounded border min-h-[60px] whitespace-pre-wrap">
            {symptoms || "Aucun symptôme renseigné"}
            {(patientAge || patientGender) && (
              <div className="mt-2 text-xs text-gray-500">
                {patientAge && `Âge: ${patientAge} ans | `}
                {patientGender && `Sexe: ${patientGender === 'M' ? 'Masculin' : 'Féminin'}`}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <a
            href={getOpenEvidenceUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full"
          >
            <Button
              type="button"
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Ouvrir OpenEvidence (Connexion Google)
            </Button>
          </a>
          {symptoms.trim() && (
            <Button
              onClick={copySymptoms}
              variant="outline"
              className="w-full"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copier les symptômes
            </Button>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="diagnosis-result">
            Résultat du diagnostic OpenEvidence
          </Label>
          <Textarea
            id="diagnosis-result"
            placeholder="Collez ici le diagnostic et les recommandations d'OpenEvidence..."
            value={diagnosisResult}
            onChange={(e) => {
              setDiagnosisResult(e.target.value);
              setIsImported(false);
            }}
            rows={8}
            className="font-mono text-sm"
          />
        </div>

        {diagnosisResult && (
          <Button
            onClick={handleImportDiagnosis}
            disabled={isImported}
            className="w-full"
            variant={isImported ? "secondary" : "default"}
          >
            {isImported ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Diagnostic importé
              </>
            ) : (
              <>
                Valider et utiliser dans la consultation
              </>
            )}
          </Button>
        )}

        <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded border border-blue-200">
          <strong>Instructions:</strong>
          <ol className="list-decimal list-inside mt-2 space-y-1">
            <li>Cliquez sur "Ouvrir dans OpenEvidence" pour lancer la recherche</li>
            <li>Consultez les résultats du diagnostic IA dans la fenêtre OpenEvidence</li>
            <li>Copiez le diagnostic et les recommandations pertinentes</li>
            <li>Collez le résultat dans le champ ci-dessus</li>
            <li>Cliquez sur "Valider" pour l'intégrer à la consultation médicale</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

export default OpenEvidenceIntegration;
