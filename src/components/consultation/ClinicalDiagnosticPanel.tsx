import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Database, AlertTriangle, Target, FileText, Globe } from 'lucide-react';
import DiagnosticAssistant from '@/components/ai/DiagnosticAssistant';
import OpenEvidenceIntegration from '@/components/ai/OpenEvidenceIntegration';
import { DiagnosticSuggestion } from '@/utils/aiService';

interface ClinicalDiagnosticPanelProps {
  onDiagnosisSelect?: (diagnosis: string) => void;
  patientData?: {
    age: number;
    gender: 'M' | 'F';
    symptoms: string;
    vitalSigns?: any;
    medicalHistory?: string[];
  };
}

const ClinicalDiagnosticPanel: React.FC<ClinicalDiagnosticPanelProps> = ({ 
  onDiagnosisSelect, 
  patientData 
}) => {
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<DiagnosticSuggestion | null>(null);

  const handleDiagnosisSelection = (suggestion: DiagnosticSuggestion) => {
    setSelectedDiagnosis(suggestion);
    if (onDiagnosisSelect) {
      onDiagnosisSelect(suggestion.condition);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-blue-600" />
            <span>Diagnostic Clinique IA</span>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              <Globe className="w-3 h-3 mr-1" />
              OMS + Bases Mondiales
            </Badge>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Système de diagnostic différentiel basé sur l'intelligence artificielle connectée aux bases de données cliniques mondiales et aux guidelines de l'OMS
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="diagnostic" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="diagnostic">Analyse IA</TabsTrigger>
              <TabsTrigger value="openevidence">OpenEvidence</TabsTrigger>
              <TabsTrigger value="selected">Sélectionné</TabsTrigger>
            </TabsList>

            <TabsContent value="diagnostic" className="space-y-4">
              <DiagnosticAssistant onSuggestionSelect={handleDiagnosisSelection} />
            </TabsContent>

            <TabsContent value="openevidence" className="space-y-4">
              <OpenEvidenceIntegration
                symptoms={patientData?.symptoms || ''}
                patientAge={patientData?.age?.toString()}
                patientGender={patientData?.gender}
                onDiagnosisImport={(diagnosis) => {
                  const openEvidenceSuggestion: DiagnosticSuggestion = {
                    condition: 'Diagnostic OpenEvidence',
                    probability: 1,
                    symptoms: patientData?.symptoms?.split(',').map(s => s.trim()) || [],
                    urgencyLevel: 'medium',
                    icd10Code: 'OpenEvidence',
                    whoCategory: 'Consultation OpenEvidence',
                    confidenceIndex: 95,
                    additionalTests: [],
                    differentialDiagnosis: [],
                    clinicalEvidence: {
                      whoGuidelines: diagnosis,
                      prevalenceData: '',
                      medlineReferences: []
                    }
                  };
                  handleDiagnosisSelection(openEvidenceSuggestion);
                }}
              />
            </TabsContent>

            <TabsContent value="selected" className="space-y-4">
              {selectedDiagnosis ? (
                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">
                            {selectedDiagnosis.condition}
                          </h3>
                          <div className="flex items-center space-x-2 mt-2">
                            {selectedDiagnosis.icd10Code && (
                              <Badge variant="outline" className="font-mono">
                                CIM-10: {selectedDiagnosis.icd10Code}
                              </Badge>
                            )}
                            {selectedDiagnosis.whoCategory && (
                              <Badge variant="secondary">
                                {selectedDiagnosis.whoCategory}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">
                            {selectedDiagnosis.confidenceIndex || Math.round(selectedDiagnosis.probability * 100)}%
                          </div>
                          <div className="text-sm text-gray-500">Indice de confiance</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Symptômes clés</h4>
                          <div className="flex flex-wrap gap-1">
                            {selectedDiagnosis.symptoms.map((symptom, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {symptom}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Niveau d'urgence</h4>
                          <Badge 
                            className={
                              selectedDiagnosis.urgencyLevel === 'critical' ? 'bg-red-100 text-red-800' :
                              selectedDiagnosis.urgencyLevel === 'high' ? 'bg-orange-100 text-orange-800' :
                              selectedDiagnosis.urgencyLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }
                          >
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            {selectedDiagnosis.urgencyLevel === 'critical' ? 'Critique' :
                             selectedDiagnosis.urgencyLevel === 'high' ? 'Élevé' :
                             selectedDiagnosis.urgencyLevel === 'medium' ? 'Modéré' : 'Faible'}
                          </Badge>
                        </div>
                      </div>

                      {selectedDiagnosis.additionalTests && selectedDiagnosis.additionalTests.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Examens complémentaires recommandés</h4>
                          <ul className="space-y-1">
                            {selectedDiagnosis.additionalTests.map((test, idx) => (
                              <li key={idx} className="flex items-center text-sm text-gray-700">
                                <Target className="w-3 h-3 mr-2 text-blue-500" />
                                {test}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {selectedDiagnosis.differentialDiagnosis && selectedDiagnosis.differentialDiagnosis.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Diagnostic différentiel</h4>
                          <div className="flex flex-wrap gap-1">
                            {selectedDiagnosis.differentialDiagnosis.map((diff, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {diff}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedDiagnosis.clinicalEvidence && (
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <h4 className="font-medium text-blue-900 mb-3 flex items-center">
                            <FileText className="w-4 h-4 mr-2" />
                            Références cliniques et épidémiologiques
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="font-medium text-blue-800">Guidelines OMS:</span>
                              <p className="text-blue-700 mt-1">{selectedDiagnosis.clinicalEvidence.whoGuidelines}</p>
                            </div>
                            {selectedDiagnosis.clinicalEvidence.prevalenceData && (
                              <div>
                                <span className="font-medium text-blue-800">Données de prévalence:</span>
                                <p className="text-blue-700 mt-1">{selectedDiagnosis.clinicalEvidence.prevalenceData}</p>
                              </div>
                            )}
                            {selectedDiagnosis.clinicalEvidence.medlineReferences.length > 0 && (
                              <div>
                                <span className="font-medium text-blue-800">Références scientifiques:</span>
                                <p className="text-blue-700 mt-1 font-mono text-xs">
                                  {selectedDiagnosis.clinicalEvidence.medlineReferences.join(', ')}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="pt-4 border-t">
                        <Button 
                          onClick={() => onDiagnosisSelect && onDiagnosisSelect(selectedDiagnosis.condition)}
                          className="w-full"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Utiliser ce diagnostic dans la consultation
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Brain className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Aucun diagnostic sélectionné
                    </h3>
                    <p className="text-gray-600">
                      Utilisez l'assistant diagnostique pour analyser les symptômes et obtenir des suggestions basées sur les bases de données cliniques mondiales.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClinicalDiagnosticPanel;