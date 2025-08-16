import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileText, Download, Copy, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

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
  consultationData?: any;
  onDocumentGenerated?: (document: GeneratedDocument) => void;
}

export default function DocumentGenerator({ 
  patientId, 
  consultationData, 
  onDocumentGenerated 
}: DocumentGeneratorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDocuments, setGeneratedDocuments] = useState<GeneratedDocument[]>([]);
  const [customPrompt, setCustomPrompt] = useState('');

  useEffect(() => {
    if (consultationData && selectedTemplate) {
      // Pré-remplir avec les données de consultation
      const prefilled: Record<string, string> = {};
      if (consultationData.symptoms) prefilled.chief_complaint = consultationData.symptoms;
      if (consultationData.diagnosis) prefilled.diagnosis = consultationData.diagnosis;
      if (consultationData.treatment_plan) prefilled.treatment_plan = consultationData.treatment_plan;
      
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
      // Construire le prompt pour l'IA
      const prompt = `
        Générez un ${selectedTemplate.name} professionnel en français pour un patient.
        
        Type de document: ${selectedTemplate.description}
        
        Données du patient et de la consultation:
        ${Object.entries(formData).map(([key, value]) => `${key}: ${value}`).join('\n')}
        
        Instructions supplémentaires: ${customPrompt}
        
        Veuillez générer un document médical complet, structuré et professionnel en français.
        Utilisez un langage médical approprié et suivez les standards de documentation médicale.
        Incluez tous les éléments nécessaires selon le type de document demandé.
      `;

      // TODO: Appeler le service d'IA (OpenAI, Claude, etc.)
      // Pour l'instant, simuler une génération
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockContent = generateMockDocument(selectedTemplate, formData);
      setGeneratedContent(mockContent);
      
      const newDocument: GeneratedDocument = {
        id: Date.now().toString(),
        title: selectedTemplate.name,
        content: mockContent,
        type: selectedTemplate.type,
        createdAt: new Date(),
        patientId
      };
      
      setGeneratedDocuments(prev => [newDocument, ...prev]);
      onDocumentGenerated?.(newDocument);
      
      toast.success('Document généré avec succès');
    } catch (error) {
      toast.error('Erreur lors de la génération du document');
      console.error('Error generating document:', error);
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
              <div className="grid gap-4">
                <h3 className="font-medium">Informations requises</h3>
                {selectedTemplate.fields.map(field => (
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
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Générer le document
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