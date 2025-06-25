
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, Pill, Settings, Key, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/utils/permissions';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DiagnosticAssistant from './DiagnosticAssistant';
import TreatmentSuggestions from './TreatmentSuggestions';
import { aiService, DiagnosticSuggestion, TreatmentSuggestion } from '@/utils/aiService';

const AIModule = () => {
  const { user } = useAuth();
  const permissions = usePermissions(user);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiConfigured, setApiConfigured] = useState(false);
  const [currentMedications, setCurrentMedications] = useState<string[]>([]);

  const handleDiagnosticSuggestion = (suggestion: DiagnosticSuggestion) => {
    setSelectedDiagnosis(suggestion.condition);
    // Audit log
    console.log(`[AUDIT] Suggestion diagnostique sélectionnée - Condition: ${suggestion.condition} - Doctor: ${user?.firstName} ${user?.lastName} - Time: ${new Date().toISOString()}`);
  };

  const handleTreatmentSuggestion = (treatment: TreatmentSuggestion) => {
    if (!currentMedications.includes(treatment.medication)) {
      setCurrentMedications([...currentMedications, treatment.medication]);
    }
    // Audit log
    console.log(`[AUDIT] Suggestion traitement sélectionnée - Medication: ${treatment.medication} - Doctor: ${user?.firstName} ${user?.lastName} - Time: ${new Date().toISOString()}`);
  };

  const handleApiKeySubmit = () => {
    if (apiKey.trim()) {
      aiService.setApiKey(apiKey);
      setApiConfigured(true);
      // Don't log the actual API key for security
      console.log(`[AUDIT] Clé API IA configurée - Doctor: ${user?.firstName} ${user?.lastName} - Time: ${new Date().toISOString()}`);
    }
  };

  const removeMedication = (medication: string) => {
    setCurrentMedications(currentMedications.filter(med => med !== medication));
  };

  return (
    <ProtectedRoute requiredPermission="create_consultation">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Module IA Médical</h1>
            <p className="text-gray-600">Assistant intelligent pour le diagnostic et le traitement</p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-purple-600">
            <Shield className="w-4 h-4" />
            <span>Accès sécurisé - {user?.firstName} {user?.lastName}</span>
          </div>
        </div>

        {!apiConfigured && (
          <Alert>
            <Key className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-3">
                <p>Pour utiliser les fonctionnalités IA avancées, configurez votre clé API.</p>
                <div className="flex space-x-2">
                  <Input
                    type="password"
                    placeholder="Clé API IA (optionnel)"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleApiKeySubmit} size="sm">
                    Configurer
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Mode démo disponible sans clé API avec des données d'exemple.
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="diagnostic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="diagnostic" className="flex items-center space-x-2">
              <Brain className="w-4 h-4" />
              <span>Diagnostic</span>
            </TabsTrigger>
            <TabsTrigger value="treatment" className="flex items-center space-x-2">
              <Pill className="w-4 h-4" />
              <span>Traitement</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Paramètres</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="diagnostic" className="space-y-6">
            <DiagnosticAssistant onSuggestionSelect={handleDiagnosticSuggestion} />
          </TabsContent>

          <TabsContent value="treatment" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <TreatmentSuggestions
                  diagnosis={selectedDiagnosis}
                  currentMedications={currentMedications}
                  onTreatmentSelect={handleTreatmentSuggestion}
                />
              </div>
              
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Diagnostic Sélectionné</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedDiagnosis ? (
                      <p className="text-sm">{selectedDiagnosis}</p>
                    ) : (
                      <p className="text-sm text-gray-500">Aucun diagnostic sélectionné</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Médicaments Ajoutés</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {currentMedications.length > 0 ? (
                      <div className="space-y-2">
                        {currentMedications.map((med, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span>{med}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeMedication(med)}
                              className="h-6 w-6 p-0"
                            >
                              ×
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Aucun médicament ajouté</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuration IA</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="api-key">Clé API IA</Label>
                  <div className="flex space-x-2 mt-1">
                    <Input
                      id="api-key"
                      type="password"
                      placeholder="Votre clé API"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                    />
                    <Button onClick={handleApiKeySubmit}>
                      {apiConfigured ? 'Mettre à jour' : 'Configurer'}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {apiConfigured ? 'API configurée ✓' : 'Mode démo actif'}
                  </p>
                </div>

                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium">Sécurité et Confidentialité</p>
                      <ul className="text-sm space-y-1">
                        <li>• Les données patient ne sont jamais stockées par l'IA</li>
                        <li>• Toutes les requêtes sont chiffrées et auditées</li>
                        <li>• Les suggestions ne remplacent pas le jugement médical</li>
                        <li>• Conformité RGPD et secret médical</li>
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
};

export default AIModule;
