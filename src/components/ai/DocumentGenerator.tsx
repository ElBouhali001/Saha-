import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileText, Download, Copy, Sparkles, Bot, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { AIDocumentService, PatientData, ConsultationData } from '@/services/aiDocumentService';

interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  type: 'consultation_report' | 'discharge_summary' | 'prescription_note' | 'referral_letter' | 'medical_certificate' | 'care_plan';
  fields: string[];
}

interface GeneratedDocument {
  id: string;
  title: string;
  content: string;
  type: string;
  createdAt: Date;
  patientId?: string;
}

const DOCUMENT_TEMPLATES: DocumentTemplate[] = [
  {
    id: 'consultation-report',
    name: 'Compte-rendu de consultation',
    description: 'Rapport détaillé de la consultation médicale',
    type: 'consultation_report',
    fields: ['patient_info', 'chief_complaint', 'examination', 'diagnosis', 'treatment_plan']
  },
  {
    id: 'discharge-summary',
    name: 'Lettre de sortie',
    description: 'Résumé de hospitalisation et recommandations',
    type: 'discharge_summary',
    fields: ['admission_reason', 'treatment_received', 'current_status', 'discharge_instructions']
  },
  {
    id: 'referral-letter',
    name: 'Lettre de référence',
    description: 'Orientation vers un spécialiste',
    type: 'referral_letter',
    fields: ['patient_info', 'reason_for_referral', 'relevant_history', 'requested_consultation']
  },
  {
    id: 'medical-certificate',
    name: 'Certificat médical',
    description: 'Certification pour arrêt de travail ou aptitude',
    type: 'medical_certificate',
    fields: ['patient_info', 'medical_condition', 'recommendations', 'duration']
  },
  {
    id: 'care-plan',
    name: 'Plan de soins',
    description: 'Programme de soins personnalisé',
    type: 'care_plan',
    fields: ['patient_info', 'current_condition', 'goals', 'interventions', 'timeline']
  }
];

interface DocumentGeneratorProps {
  patientId?: string;
  patientData?: PatientData;
  consultationData?: ConsultationData;
  onDocumentGenerated?: (document: GeneratedDocument) => void;
}

export default function DocumentGenerator({ 
  patientId, 
  patientData,
  consultationData, 
  onDocumentGenerated 
}: DocumentGeneratorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDocuments, setGeneratedDocuments] = useState<GeneratedDocument[]>([]);
  const [customPrompt, setCustomPrompt] = useState('');
  const [useAI, setUseAI] = useState(true);
  const [aiTone, setAiTone] = useState<'professional' | 'compassionate' | 'clinical' | 'detailed'>('professional');

  useEffect(() => {
    if (consultationData && selectedTemplate) {
      // Pré-remplir avec les données de consultation
      const prefilled: Record<string, string> = {};
      if (consultationData.symptoms) prefilled.chief_complaint = consultationData.symptoms;
      if (consultationData.diagnosis) prefilled.diagnosis = consultationData.diagnosis;
      if (consultationData.treatmentPlan) prefilled.treatment_plan = consultationData.treatmentPlan;
      
      setFormData(prefilled);
    }
  }, [consultationData, selectedTemplate]);

  const handleTemplateSelect = (templateId: string) => {
    const template = DOCUMENT_TEMPLATES.find(t => t.id === templateId);
    setSelectedTemplate(template || null);
    setFormData({});
    setGeneratedContent('');
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateDocument = async () => {
    if (!selectedTemplate) return;

    setIsGenerating(true);
    
    try {
      let content: string;
      
      if (useAI && patientData && consultationData) {
        // Génération IA avec données réelles
        console.log('Generating with AI using real data');
        
        const aiRequest = {
          documentType: selectedTemplate.type,
          patientData,
          consultationData,
          tone: aiTone,
          language: 'fr' as const,
          customInstructions: customPrompt
        };
        
        const response = await AIDocumentService.generateDocument(aiRequest);
        
        if (response.success && response.content) {
          content = response.content;
          toast.success('Document généré par IA avec succès');
        } else {
          throw new Error(response.error || 'Erreur lors de la génération IA');
        }
      } else {
        // Génération mock pour les cas sans données complètes
        console.log('Generating mock document');
        await new Promise(resolve => setTimeout(resolve, 1500));
        content = generateMockDocument(selectedTemplate, formData);
        toast.success('Document généré avec des données de démonstration');
      }
      
      setGeneratedContent(content);
      
      const newDocument: GeneratedDocument = {
        id: Date.now().toString(),
        title: selectedTemplate.name,
        content,
        type: selectedTemplate.type,
        createdAt: new Date(),
        patientId
      };
      
      setGeneratedDocuments(prev => [newDocument, ...prev]);
      onDocumentGenerated?.(newDocument);
      
    } catch (error) {
      console.error('Document generation error:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la génération du document');
      
      // Fallback vers la génération mock
      const mockContent = generateMockDocument(selectedTemplate, formData);
      setGeneratedContent(mockContent);
      toast.success('Document généré en mode de secours');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMockDocument = (template: DocumentTemplate, data: Record<string, string>) => {
    const patientName = data.patient_info || 'M./Mme [Nom du patient]';
    const date = new Date().toLocaleDateString('fr-FR');
    
    switch (template.type) {
      case 'consultation_report':
        return `COMPTE-RENDU DE CONSULTATION MÉDICALE

Date: ${date}
Patient: ${patientName}

MOTIF DE CONSULTATION:
${data.chief_complaint || '[Motif de la consultation]'}

EXAMEN CLINIQUE:
${data.examination || '[Résultats de l\'examen clinique]'}

DIAGNOSTIC:
${data.diagnosis || '[Diagnostic établi]'}

PLAN DE TRAITEMENT:
${data.treatment_plan || '[Plan de traitement recommandé]'}

Dr. [Nom du médecin]
[Spécialité]`;

      case 'referral_letter':
        return `LETTRE DE RÉFÉRENCE

Date: ${date}
Patient: ${patientName}

Cher/Chère Confrère,

Je vous adresse ce patient pour ${data.reason_for_referral || '[motif de la référence]'}.

ANTÉCÉDENTS PERTINENTS:
${data.relevant_history || '[Antécédents médicaux pertinents]'}

CONSULTATION DEMANDÉE:
${data.requested_consultation || '[Type de consultation demandée]'}

Je vous remercie de votre prise en charge et reste à votre disposition pour tout renseignement complémentaire.

Cordialement,
Dr. [Nom du médecin]`;

      default:
        return `${template.name.toUpperCase()}

Date: ${date}
Patient: ${patientName}

[Contenu du document généré automatiquement]

${Object.entries(data).map(([key, value]) => `${key}: ${value}`).join('\n\n')}

Dr. [Nom du médecin]`;
    }
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Document copié dans le presse-papiers');
  };

  const downloadDocument = (content: string, title: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Document téléchargé');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Générateur de Documents IA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="template">Type de document</Label>
            <Select onValueChange={handleTemplateSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un type de document" />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_TEMPLATES.map(template => (
                  <SelectItem key={template.id} value={template.id}>
                    <div>
                      <div className="font-medium">{template.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {template.description}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedTemplate && (
            <>
              {/* Options IA */}
              {patientData && consultationData && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Bot className="h-5 w-5 text-blue-600" />
                        <span className="font-medium text-blue-900">Génération IA avec données patient</span>
                      </div>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        {patientData.name}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Ton du document</Label>
                        <Select value={aiTone} onValueChange={(value: any) => setAiTone(value)}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="professional">Professionnel</SelectItem>
                            <SelectItem value="compassionate">Bienveillant</SelectItem>
                            <SelectItem value="clinical">Clinique</SelectItem>
                            <SelectItem value="detailed">Détaillé</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Mode de génération</Label>
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            variant={useAI ? "default" : "outline"}
                            size="sm"
                            onClick={() => setUseAI(true)}
                            className="flex-1"
                          >
                            <Wand2 className="h-4 w-4 mr-2" />
                            IA Automatique
                          </Button>
                          <Button
                            variant={!useAI ? "default" : "outline"}
                            size="sm"
                            onClick={() => setUseAI(false)}
                            className="flex-1"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Manuel
                          </Button>
                        </div>
                      </div>
                    </div>

                    {useAI && (
                      <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="text-sm text-green-800">
                          <strong>Données disponibles:</strong>
                          <ul className="mt-1 list-disc list-inside space-y-1">
                            <li>Diagnostic: {consultationData.diagnosis}</li>
                            <li>Symptômes: {consultationData.symptoms.substring(0, 50)}...</li>
                            <li>Traitement: {consultationData.treatmentPlan?.substring(0, 50)}...</li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <div className="grid gap-4">
                <h3 className="font-medium">
                  {useAI && patientData && consultationData 
                    ? 'Instructions supplémentaires (optionnel)' 
                    : 'Informations requises'
                  }
                </h3>
                
                {(!useAI || !patientData || !consultationData) && selectedTemplate.fields.map(field => (
                  <div key={field}>
                    <Label htmlFor={field}>
                      {field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Label>
                    <Textarea
                      id={field}
                      placeholder={`Saisissez ${field.replace('_', ' ')}`}
                      value={formData[field] || ''}
                      onChange={(e) => handleFieldChange(field, e.target.value)}
                      rows={3}
                    />
                  </div>
                ))}
              </div>

              <div>
                <Label htmlFor="custom-prompt">Instructions supplémentaires (optionnel)</Label>
                <Textarea
                  id="custom-prompt"
                  placeholder="Ajoutez des instructions spécifiques pour personnaliser le document..."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  rows={2}
                />
              </div>

              <Button 
                onClick={generateDocument} 
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {useAI && patientData && consultationData 
                      ? 'Génération IA en cours...' 
                      : 'Génération en cours...'
                    }
                  </>
                ) : (
                  <>
                    {useAI && patientData && consultationData ? (
                      <>
                        <Wand2 className="mr-2 h-4 w-4" />
                        Générer avec IA médicale
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Générer le document
                      </>
                    )}
                  </>
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {generatedContent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Document généré
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(generatedContent)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadDocument(generatedContent, selectedTemplate?.name || 'document')}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm">{generatedContent}</pre>
            </div>
          </CardContent>
        </Card>
      )}

      {generatedDocuments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Documents récents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {generatedDocuments.slice(0, 5).map(doc => (
                <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{doc.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {doc.createdAt.toLocaleDateString('fr-FR')} à {doc.createdAt.toLocaleTimeString('fr-FR')}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary">{doc.type}</Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(doc.content)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}