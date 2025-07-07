
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
  const [medicalHistory, setMedicalHistory] = useState('');
  const [vitalSigns, setVitalSigns] = useState({
    temperature: '',
    bloodPressure: '',
    heartRate: '',
    respiratoryRate: ''
  });
  const [suggestions, setSuggestions] = useState<DiagnosticSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!symptoms.trim()) return;

    setIsLoading(true);
    try {
      const historyArray = medicalHistory.trim() ? medicalHistory.split(',').map(h => h.trim()) : undefined;
      const vitals = Object.entries(vitalSigns).some(([_, value]) => value.trim()) ? {
        temperature: vitalSigns.temperature ? parseFloat(vitalSigns.temperature) : undefined,
        bloodPressure: vitalSigns.bloodPressure || undefined,
        heartRate: vitalSigns.heartRate ? parseInt(vitalSigns.heartRate) : undefined,
        respiratoryRate: vitalSigns.respiratoryRate ? parseInt(vitalSigns.respiratoryRate) : undefined
      } : undefined;

      const results = await aiService.getDiagnosticSuggestions(
        symptoms,
        parseInt(patientAge) || 30,
        patientGender,
        historyArray,
        vitals
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
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Brain className="w-5 h-5 mr-2 text-purple-600" />
            Assistant Diagnostique IA
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Connecté OMS
          </Badge>
        </CardTitle>
        <p className="text-sm text-gray-600 mt-1">
          Diagnostic différentiel basé sur les bases de données cliniques mondiales et les guidelines de l'OMS
        </p>
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
          <Label htmlFor="symptoms">Symptômes observés *</Label>
          <Textarea
            id="symptoms"
            placeholder="Décrire les symptômes du patient (fièvre, toux, douleurs, etc.)"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            rows={4}
          />
        </div>

        <div>
          <Label htmlFor="medical-history">Antécédents médicaux</Label>
          <Textarea
            id="medical-history"
            placeholder="Antécédents médicaux significatifs (séparés par des virgules)"
            value={medicalHistory}
            onChange={(e) => setMedicalHistory(e.target.value)}
            rows={2}
          />
        </div>

        <div>
          <Label>Signes vitaux (optionnel)</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
            <div>
              <Label htmlFor="temperature" className="text-xs">Température (°C)</Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                placeholder="37.5"
                value={vitalSigns.temperature}
                onChange={(e) => setVitalSigns(prev => ({ ...prev, temperature: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="blood-pressure" className="text-xs">Tension (mmHg)</Label>
              <Input
                id="blood-pressure"
                placeholder="120/80"
                value={vitalSigns.bloodPressure}
                onChange={(e) => setVitalSigns(prev => ({ ...prev, bloodPressure: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="heart-rate" className="text-xs">Pouls (bpm)</Label>
              <Input
                id="heart-rate"
                type="number"
                placeholder="72"
                value={vitalSigns.heartRate}
                onChange={(e) => setVitalSigns(prev => ({ ...prev, heartRate: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="respiratory-rate" className="text-xs">Resp. (/min)</Label>
              <Input
                id="respiratory-rate"
                type="number"
                placeholder="16"
                value={vitalSigns.respiratoryRate}
                onChange={(e) => setVitalSigns(prev => ({ ...prev, respiratoryRate: e.target.value }))}
              />
            </div>
          </div>
        </div>

        <Button 
          onClick={handleAnalyze} 
          disabled={!symptoms.trim() || isLoading}
          className="w-full"
        >
          <Brain className="w-4 h-4 mr-2" />
          {isLoading ? 'Analyse clinique IA en cours...' : 'Diagnostic IA + Bases OMS'}
        </Button>

        {suggestions.length > 0 && (
          <div className="space-y-3 mt-6">
            <h4 className="font-medium text-gray-900">Diagnostic différentiel IA + OMS</h4>
            {suggestions.map((suggestion, index) => (
              <Card key={index} className="border-l-4 border-l-purple-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h5 className="font-medium text-gray-900">{suggestion.condition}</h5>
                        {suggestion.icd10Code && (
                          <Badge variant="outline" className="text-xs font-mono">
                            {suggestion.icd10Code}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          <Target className="w-3 h-3 mr-1" />
                          {suggestion.confidenceIndex || Math.round(suggestion.probability * 100)}% confiance
                        </Badge>
                        <Badge className={getUrgencyColor(suggestion.urgencyLevel)}>
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          {getUrgencyLabel(suggestion.urgencyLevel)}
                        </Badge>
                        {suggestion.whoCategory && (
                          <Badge variant="outline" className="text-xs">
                            {suggestion.whoCategory}
                          </Badge>
                        )}
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

                  <div className="space-y-3 text-sm">
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

                    {suggestion.differentialDiagnosis && suggestion.differentialDiagnosis.length > 0 && (
                      <div>
                        <span className="font-medium">Diagnostic différentiel:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {suggestion.differentialDiagnosis.map((diff, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {diff}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {suggestion.clinicalEvidence && (
                      <div className="bg-gray-50 p-3 rounded mt-3">
                        <span className="font-medium text-xs">Références cliniques:</span>
                        <div className="mt-1 space-y-1 text-xs text-gray-600">
                          <div><strong>OMS:</strong> {suggestion.clinicalEvidence.whoGuidelines}</div>
                          {suggestion.clinicalEvidence.prevalenceData && (
                            <div><strong>Prévalence:</strong> {suggestion.clinicalEvidence.prevalenceData}</div>
                          )}
                          {suggestion.clinicalEvidence.medlineReferences.length > 0 && (
                            <div><strong>Références:</strong> {suggestion.clinicalEvidence.medlineReferences.join(', ')}</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded border border-blue-200">
              <Brain className="w-4 h-4 inline mr-2 text-blue-600" />
              <strong>IA Clinique:</strong> Diagnostic basé sur l'analyse croisée des symptômes avec les bases de données cliniques mondiales et les guidelines de l'OMS. 
              Ces résultats doivent être interprétés par un professionnel de santé qualifié.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DiagnosticAssistant;
