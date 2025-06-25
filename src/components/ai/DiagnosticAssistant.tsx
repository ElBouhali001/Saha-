
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Brain, AlertTriangle, Clock, Target } from 'lucide-react';
import { aiService, DiagnosticSuggestion } from '@/utils/aiService';

interface DiagnosticAssistantProps {
  onSuggestionSelect?: (suggestion: DiagnosticSuggestion) => void;
}

const DiagnosticAssistant: React.FC<DiagnosticAssistantProps> = ({ onSuggestionSelect }) => {
  const [symptoms, setSymptoms] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState<'M' | 'F'>('M');
  const [suggestions, setSuggestions] = useState<DiagnosticSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!symptoms.trim()) return;

    setIsLoading(true);
    try {
      const results = await aiService.getDiagnosticSuggestions(
        symptoms,
        parseInt(patientAge) || 30,
        patientGender
      );
      setSuggestions(results);
    } catch (error) {
      console.error('Erreur analyse diagnostique:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUrgencyLabel = (level: string) => {
    switch (level) {
      case 'critical': return 'Critique';
      case 'high': return 'Élevé';
      case 'medium': return 'Modéré';
      case 'low': return 'Faible';
      default: return 'Non défini';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Brain className="w-5 h-5 mr-2 text-purple-600" />
          Assistant Diagnostique IA
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="patient-age">Âge du patient</Label>
            <Input
              id="patient-age"
              type="number"
              placeholder="30"
              value={patientAge}
              onChange={(e) => setPatientAge(e.target.value)}
            />
          </div>
          <div>
            <Label>Sexe</Label>
            <Select value={patientGender} onValueChange={(value: 'M' | 'F') => setPatientGender(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="M">Masculin</SelectItem>
                <SelectItem value="F">Féminin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="symptoms">Symptômes observés</Label>
          <Textarea
            id="symptoms"
            placeholder="Décrire les symptômes du patient (fièvre, toux, douleurs, etc.)"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            rows={4}
          />
        </div>

        <Button 
          onClick={handleAnalyze} 
          disabled={!symptoms.trim() || isLoading}
          className="w-full"
        >
          <Brain className="w-4 h-4 mr-2" />
          {isLoading ? 'Analyse en cours...' : 'Analyser les symptômes'}
        </Button>

        {suggestions.length > 0 && (
          <div className="space-y-3 mt-6">
            <h4 className="font-medium text-gray-900">Suggestions diagnostiques</h4>
            {suggestions.map((suggestion, index) => (
              <Card key={index} className="border-l-4 border-l-purple-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900">{suggestion.condition}</h5>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="secondary">
                          <Target className="w-3 h-3 mr-1" />
                          {Math.round(suggestion.probability * 100)}% probabilité
                        </Badge>
                        <Badge className={getUrgencyColor(suggestion.urgencyLevel)}>
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          {getUrgencyLabel(suggestion.urgencyLevel)}
                        </Badge>
                      </div>
                    </div>
                    {onSuggestionSelect && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onSuggestionSelect(suggestion)}
                      >
                        Utiliser
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Symptômes associés:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {suggestion.symptoms.map((symptom, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {symptom}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {suggestion.additionalTests && suggestion.additionalTests.length > 0 && (
                      <div>
                        <span className="font-medium">Examens suggérés:</span>
                        <ul className="list-disc list-inside mt-1 text-gray-600">
                          {suggestion.additionalTests.map((test, idx) => (
                            <li key={idx}>{test}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <div className="text-xs text-gray-500 bg-yellow-50 p-3 rounded border border-yellow-200">
              <AlertTriangle className="w-4 h-4 inline mr-2 text-yellow-600" />
              <strong>Avertissement:</strong> Ces suggestions sont générées par IA à titre informatif uniquement. 
              Elles ne remplacent pas l'expertise médicale et le jugement clinique du praticien.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DiagnosticAssistant;
