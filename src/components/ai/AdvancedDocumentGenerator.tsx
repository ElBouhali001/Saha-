import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { 
  Sparkles, 
  FileText, 
  Settings, 
  Brain, 
  Stethoscope, 
  ClipboardList,
  Download,
  Copy,
  Wand2
} from 'lucide-react';
import { toast } from 'sonner';

interface AdvancedSettings {
  tone: 'professional' | 'compassionate' | 'clinical' | 'detailed';
  language: 'fr' | 'en' | 'es';
  includeMedicalTerms: boolean;
  includeRecommendations: boolean;
  confidentialityLevel: 'standard' | 'high' | 'maximum';
  documentLength: number; // 1-5 scale
}

interface DocumentSection {
  id: string;
  title: string;
  content: string;
  isRequired: boolean;
  isGenerated: boolean;
}

const DEFAULT_SETTINGS: AdvancedSettings = {
  tone: 'professional',
  language: 'fr',
  includeMedicalTerms: true,
  includeRecommendations: true,
  confidentialityLevel: 'standard',
  documentLength: 3
};

const DOCUMENT_SECTIONS = {
  consultation_report: [
    { id: 'header', title: 'En-tête', content: '', isRequired: true, isGenerated: false },
    { id: 'patient_info', title: 'Informations patient', content: '', isRequired: true, isGenerated: false },
    { id: 'chief_complaint', title: 'Motif de consultation', content: '', isRequired: true, isGenerated: true },
    { id: 'history', title: 'Anamnèse', content: '', isRequired: false, isGenerated: true },
    { id: 'examination', title: 'Examen clinique', content: '', isRequired: true, isGenerated: true },
    { id: 'investigations', title: 'Examens complémentaires', content: '', isRequired: false, isGenerated: true },
    { id: 'diagnosis', title: 'Diagnostic', content: '', isRequired: true, isGenerated: true },
    { id: 'treatment', title: 'Traitement', content: '', isRequired: true, isGenerated: true },
    { id: 'follow_up', title: 'Suivi', content: '', isRequired: false, isGenerated: true },
    { id: 'signature', title: 'Signature', content: '', isRequired: true, isGenerated: false }
  ]
};

interface AdvancedDocumentGeneratorProps {
  patientData?: any;
  consultationData?: any;
}

export default function AdvancedDocumentGenerator({ 
  patientData, 
  consultationData 
}: AdvancedDocumentGeneratorProps) {
  const [documentType, setDocumentType] = useState<'consultation_report' | 'discharge_summary' | 'referral_letter'>('consultation_report');
  const [sections, setSections] = useState<DocumentSection[]>(DOCUMENT_SECTIONS.consultation_report);
  const [settings, setSettings] = useState<AdvancedSettings>(DEFAULT_SETTINGS);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingSection, setGeneratingSection] = useState<string | null>(null);
  const [globalPrompt, setGlobalPrompt] = useState('');

  const updateSection = (sectionId: string, content: string) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId ? { ...section, content } : section
    ));
  };

  const generateSection = async (sectionId: string) => {
    setGeneratingSection(sectionId);
    
    try {
      // Simuler la génération IA
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockContent = generateMockSectionContent(sectionId, settings);
      updateSection(sectionId, mockContent);
      
      toast.success(`Section "${sections.find(s => s.id === sectionId)?.title}" générée`);
    } catch (error) {
      toast.error('Erreur lors de la génération');
    } finally {
      setGeneratingSection(null);
    }
  };

  const generateAllSections = async () => {
    setIsGenerating(true);
    
    const generatableSections = sections.filter(s => s.isGenerated && !s.content);
    
    for (const section of generatableSections) {
      setGeneratingSection(section.id);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockContent = generateMockSectionContent(section.id, settings);
      updateSection(section.id, mockContent);
    }
    
    setIsGenerating(false);
    setGeneratingSection(null);
    toast.success('Document entièrement généré');
  };

  const generateMockSectionContent = (sectionId: string, settings: AdvancedSettings) => {
    const toneStyle = {
      professional: 'langage médical précis et professionnel',
      compassionate: 'ton empathique et bienveillant',
      clinical: 'style clinique factuel',
      detailed: 'description détaillée et exhaustive'
    };

    switch (sectionId) {
      case 'chief_complaint':
        return consultationData?.symptoms || 'Le patient consulte pour [symptômes principaux]. L\'évolution de ces symptômes est [évolution].';
      
      case 'history':
        return 'Antécédents médicaux: [antécédents pertinents]\nHistoire de la maladie actuelle: [évolution des symptômes]\nTraitements en cours: [médicaments actuels]';
      
      case 'examination':
        return 'Examen général: Patient en bon état général\nExamen cardiovasculaire: [résultats]\nExamen pulmonaire: [résultats]\nExamen abdominal: [résultats]\nExamen neurologique: [résultats]';
      
      case 'diagnosis':
        return consultationData?.diagnosis || 'Diagnostic principal: [diagnostic]\nDiagnostics différentiels: [autres hypothèses]\nCertitude diagnostique: [niveau de certitude]';
      
      case 'treatment':
        return `Plan thérapeutique:\n- Traitement médicamenteux: [médicaments]\n- Mesures non-pharmacologiques: [recommandations]\n- Surveillance: [paramètres à surveiller]${settings.includeRecommendations ? '\n- Recommandations lifestyle: [conseils]' : ''}`;
      
      case 'follow_up':
        return 'Prochaine consultation: [date]\nSignes d\'alarme à surveiller: [symptômes]\nConduite à tenir en cas d\'urgence: [instructions]';
      
      default:
        return `[Contenu généré automatiquement pour ${sectionId} avec ${toneStyle[settings.tone]}]`;
    }
  };

  const exportDocument = () => {
    const fullDocument = sections
      .filter(s => s.content)
      .map(s => `${s.title.toUpperCase()}\n${'-'.repeat(s.title.length)}\n${s.content}\n`)
      .join('\n');

    const blob = new Blob([fullDocument], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `document_medical_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Document exporté');
  };

  const copyFullDocument = () => {
    const fullDocument = sections
      .filter(s => s.content)
      .map(s => `${s.title.toUpperCase()}\n${s.content}`)
      .join('\n\n');
    
    navigator.clipboard.writeText(fullDocument);
    toast.success('Document copié');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Générateur Avancé de Documents Médicaux
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="editor" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="editor" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Éditeur
              </TabsTrigger>
              <TabsTrigger value="ai-assist" className="flex items-center gap-2">
                <Wand2 className="h-4 w-4" />
                Assistant IA
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Paramètres
              </TabsTrigger>
            </TabsList>

            <TabsContent value="editor" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Sections du document</h3>
                <div className="flex gap-2">
                  <Button
                    onClick={generateAllSections}
                    disabled={isGenerating}
                    variant="default"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Générer tout
                  </Button>
                  <Button onClick={copyFullDocument} variant="outline">
                    <Copy className="mr-2 h-4 w-4" />
                    Copier
                  </Button>
                  <Button onClick={exportDocument} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Exporter
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {sections.map((section) => (
                  <Card key={section.id} className="relative">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base">{section.title}</CardTitle>
                          {section.isRequired && (
                            <Badge variant="destructive" className="text-xs">Requis</Badge>
                          )}
                          {section.isGenerated && (
                            <Badge variant="secondary" className="text-xs">IA</Badge>
                          )}
                        </div>
                        {section.isGenerated && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => generateSection(section.id)}
                            disabled={generatingSection === section.id}
                          >
                            {generatingSection === section.id ? (
                              <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                                Génération...
                              </div>
                            ) : (
                              <>
                                <Sparkles className="h-3 w-3 mr-1" />
                                Générer
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        placeholder={`Contenu de la section ${section.title.toLowerCase()}...`}
                        value={section.content}
                        onChange={(e) => updateSection(section.id, e.target.value)}
                        rows={4}
                        className="min-h-[100px]"
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="ai-assist" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="h-5 w-5" />
                    Assistant IA Médical
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Prompt global pour la génération</Label>
                    <Textarea
                      placeholder="Décrivez le style, le ton, les éléments spécifiques à inclure dans le document..."
                      value={globalPrompt}
                      onChange={(e) => setGlobalPrompt(e.target.value)}
                      rows={3}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="p-4">
                      <h4 className="font-medium mb-2">Suggestions rapides</h4>
                      <div className="space-y-2">
                        <Button variant="outline" size="sm" className="w-full text-left justify-start">
                          Style académique
                        </Button>
                        <Button variant="outline" size="sm" className="w-full text-left justify-start">
                          Langage simplifié patient
                        </Button>
                        <Button variant="outline" size="sm" className="w-full text-left justify-start">
                          Format hospitalier
                        </Button>
                      </div>
                    </Card>
                    
                    <Card className="p-4">
                      <h4 className="font-medium mb-2">Modèles spécialisés</h4>
                      <div className="space-y-2">
                        <Button variant="outline" size="sm" className="w-full text-left justify-start">
                          Cardiologie
                        </Button>
                        <Button variant="outline" size="sm" className="w-full text-left justify-start">
                          Pneumologie
                        </Button>
                        <Button variant="outline" size="sm" className="w-full text-left justify-start">
                          Médecine générale
                        </Button>
                      </div>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Paramètres de génération</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label>Ton du document</Label>
                      <div className="space-y-2 mt-2">
                        {[
                          { value: 'professional', label: 'Professionnel' },
                          { value: 'compassionate', label: 'Bienveillant' },
                          { value: 'clinical', label: 'Clinique' },
                          { value: 'detailed', label: 'Détaillé' }
                        ].map(tone => (
                          <label key={tone.value} className="flex items-center space-x-2">
                            <input
                              type="radio"
                              checked={settings.tone === tone.value}
                              onChange={() => setSettings(prev => ({ ...prev, tone: tone.value as any }))}
                            />
                            <span>{tone.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <Label>Langue</Label>
                      <div className="space-y-2 mt-2">
                        {[{ code: 'fr', name: 'Français' }, { code: 'en', name: 'Anglais' }, { code: 'es', name: 'Espagnol' }].map(lang => (
                          <label key={lang.code} className="flex items-center space-x-2">
                            <input
                              type="radio"
                              checked={settings.language === lang.code}
                              onChange={() => setSettings(prev => ({ ...prev, language: lang.code as any }))}
                            />
                            <span>{lang.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Inclure des termes médicaux techniques</Label>
                      <Switch
                        checked={settings.includeMedicalTerms}
                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, includeMedicalTerms: checked }))}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label>Inclure des recommandations</Label>
                      <Switch
                        checked={settings.includeRecommendations}
                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, includeRecommendations: checked }))}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label>Niveau de détail: {settings.documentLength}/5</Label>
                    <Slider
                      value={[settings.documentLength]}
                      onValueChange={([value]) => setSettings(prev => ({ ...prev, documentLength: value }))}
                      max={5}
                      min={1}
                      step={1}
                      className="mt-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Concis</span>
                      <span>Très détaillé</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}