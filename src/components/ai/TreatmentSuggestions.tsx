
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Pill, AlertTriangle, Info, Plus } from 'lucide-react';
import { aiService, TreatmentSuggestion, DrugInteraction } from '@/utils/aiService';

interface TreatmentSuggestionsProps {
  diagnosis: string;
  patientProfile?: any;
  currentMedications?: string[];
  onTreatmentSelect?: (treatment: TreatmentSuggestion) => void;
}

const TreatmentSuggestions: React.FC<TreatmentSuggestionsProps> = ({
  diagnosis,
  patientProfile,
  currentMedications = [],
  onTreatmentSelect
}) => {
  const [suggestions, setSuggestions] = useState<TreatmentSuggestion[]>([]);
  const [interactions, setInteractions] = useState<DrugInteraction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (diagnosis) {
      loadTreatmentSuggestions();
    }
  }, [diagnosis, patientProfile]);

  useEffect(() => {
    if (currentMedications.length >= 2) {
      checkInteractions();
    }
  }, [currentMedications]);

  const loadTreatmentSuggestions = async () => {
    setIsLoading(true);
    try {
      const results = await aiService.getTreatmentSuggestions(diagnosis, patientProfile);
      setSuggestions(results);
    } catch (error) {
      console.error('Erreur suggestions traitement:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkInteractions = async () => {
    try {
      const interactionResults = await aiService.checkDrugInteractions(currentMedications);
      setInteractions(interactionResults);
    } catch (error) {
      console.error('Erreur vérification interactions:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'major': return 'bg-red-100 text-red-800 border-red-200';
      case 'moderate': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'minor': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'major': return 'Majeure';
      case 'moderate': return 'Modérée';
      case 'minor': return 'Mineure';
      default: return 'Inconnue';
    }
  };

  if (!diagnosis) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-gray-500">
          <Pill className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Saisissez un diagnostic pour obtenir des suggestions de traitement</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Pill className="w-5 h-5 mr-2 text-blue-600" />
            Suggestions Thérapeutiques
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Analyse des traitements...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-gray-600 mb-4">
                <strong>Diagnostic:</strong> {diagnosis}
              </div>

              {suggestions.map((suggestion, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">{suggestion.medication}</h5>
                        <div className="text-sm text-gray-600 mt-1">
                          {suggestion.dosage} - {suggestion.frequency} pendant {suggestion.duration}
                        </div>
                      </div>
                      {onTreatmentSelect && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onTreatmentSelect(suggestion)}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Ajouter
                        </Button>
                      )}
                    </div>

                    {suggestion.contraindications.length > 0 && (
                      <div className="mb-3">
                        <span className="text-sm font-medium text-red-700">Contre-indications:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {suggestion.contraindications.map((ci, idx) => (
                            <Badge key={idx} variant="destructive" className="text-xs">
                              {ci}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {suggestion.interactions.length > 0 && (
                      <div className="mb-3">
                        <span className="text-sm font-medium text-orange-700">Interactions possibles:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {suggestion.interactions.map((interaction, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {interaction}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {suggestion.alternatives.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-blue-700">Alternatives:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {suggestion.alternatives.map((alt, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {alt}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Ces suggestions sont générées par IA et doivent être validées selon votre expertise clinique. 
                  Vérifiez toujours les contre-indications et interactions médicamenteuses.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>

      {interactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-orange-700">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Interactions Médicamenteuses Détectées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {interactions.map((interaction, index) => (
                <Alert key={index} className="border-orange-200">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">
                          {interaction.drug1} + {interaction.drug2}
                        </span>
                        <Badge className={getSeverityColor(interaction.severity)}>
                          {getSeverityLabel(interaction.severity)}
                        </Badge>
                      </div>
                      <p className="text-sm">{interaction.description}</p>
                      <p className="text-sm font-medium text-orange-800">
                        Recommandation: {interaction.recommendation}
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TreatmentSuggestions;
