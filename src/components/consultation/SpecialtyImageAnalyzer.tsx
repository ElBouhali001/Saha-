import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Image as ImageIcon, Loader2, Brain, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SpecialtyImageAnalyzerProps {
  specialty: 'cardiology' | 'dermatology' | 'pediatrics' | 'gynecology' | 'neurology' | 'orthopedics' | 'ophthalmology';
  onAnalysisComplete?: (analysis: string) => void;
}

const SPECIALTY_CONFIG = {
  cardiology: {
    title: 'Analyse d\'Imagerie Cardiaque',
    icon: '🫀',
    acceptedFormats: 'ECG, Échographie, Angiographie, IRM cardiaque',
    analysisPrompt: 'Analysez cette imagerie cardiaque et identifiez les anomalies cardiovasculaires, troubles du rythme, pathologies valvulaires ou coronariennes'
  },
  dermatology: {
    title: 'Analyse d\'Images Dermatologiques',
    icon: '🔬',
    acceptedFormats: 'Photos de lésions cutanées, dermatoscopie',
    analysisPrompt: 'Analysez cette image dermatologique et identifiez les lésions cutanées, mélanomes potentiels, dermatoses ou autres pathologies cutanées'
  },
  pediatrics: {
    title: 'Analyse d\'Imagerie Pédiatrique',
    icon: '👶',
    acceptedFormats: 'Radiographies, Échographies pédiatriques',
    analysisPrompt: 'Analysez cette imagerie pédiatrique en tenant compte des particularités anatomiques de l\'enfant et identifiez les anomalies de développement ou pathologies'
  },
  gynecology: {
    title: 'Analyse d\'Imagerie Gynécologique',
    icon: '🤰',
    acceptedFormats: 'Échographie pelvienne, Mammographie, IRM',
    analysisPrompt: 'Analysez cette imagerie gynécologique et identifiez les anomalies utérines, ovariennes, mammaires ou pathologies gynécologiques'
  },
  neurology: {
    title: 'Analyse d\'Imagerie Neurologique',
    icon: '🧠',
    acceptedFormats: 'IRM cérébrale, Scanner, EEG',
    analysisPrompt: 'Analysez cette imagerie neurologique et identifiez les lésions cérébrales, AVC, tumeurs, pathologies neurodégénératives ou épilepsie'
  },
  orthopedics: {
    title: 'Analyse d\'Imagerie Orthopédique',
    icon: '🦴',
    acceptedFormats: 'Radiographies osseuses, Scanner, IRM articulaire',
    analysisPrompt: 'Analysez cette imagerie orthopédique et identifiez les fractures, luxations, arthrose, lésions ligamentaires ou osseuses'
  },
  ophthalmology: {
    title: 'Analyse d\'Imagerie Ophtalmologique',
    icon: '👁️',
    acceptedFormats: 'Fond d\'œil, OCT, Topographie cornéenne',
    analysisPrompt: 'Analysez cette imagerie ophtalmologique et identifiez les pathologies rétiniennes, glaucome, cataracte ou autres troubles oculaires'
  }
};

const SpecialtyImageAnalyzer: React.FC<SpecialtyImageAnalyzerProps> = ({
  specialty,
  onAnalysisComplete
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string>('');
  const { toast } = useToast();

  const config = SPECIALTY_CONFIG[specialty];

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Veuillez sélectionner un fichier image valide'
      });
      return;
    }

    // Convertir en base64
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
      setAnalysis('');
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-medical-imaging', {
        body: {
          imageData: selectedImage,
          specialty,
          analysisPrompt: config.analysisPrompt
        }
      });

      if (error) throw error;

      const analysisText = data.analysis;
      setAnalysis(analysisText);
      
      if (onAnalysisComplete) {
        onAnalysisComplete(analysisText);
      }

      toast({
        title: 'Analyse complétée',
        description: 'L\'analyse IA de l\'imagerie a été générée avec succès'
      });
    } catch (error: any) {
      console.error('Error analyzing image:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur d\'analyse',
        description: error.message || 'Impossible d\'analyser l\'image'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            <span>{config.title}</span>
          </div>
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            {config.icon} IA Spécialisée
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Formats acceptés: {config.acceptedFormats}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id={`image-upload-${specialty}`}
          />
          <label htmlFor={`image-upload-${specialty}`} className="cursor-pointer">
            {selectedImage ? (
              <div className="space-y-4">
                <img
                  src={selectedImage}
                  alt="Selected medical imaging"
                  className="max-h-64 mx-auto rounded-lg"
                />
                <Button variant="outline" type="button">
                  <Upload className="w-4 h-4 mr-2" />
                  Changer l'image
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <ImageIcon className="w-12 h-12 mx-auto text-gray-400" />
                <p className="text-sm text-gray-600">
                  Cliquez pour sélectionner une image médicale
                </p>
                <p className="text-xs text-gray-500">
                  JPG, PNG ou DICOM
                </p>
              </div>
            )}
          </label>
        </div>

        {selectedImage && (
          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyse IA en cours...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Analyser l'imagerie
              </>
            )}
          </Button>
        )}

        {analysis && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="mt-2 space-y-2">
                <p className="font-semibold">Résultats de l'analyse IA :</p>
                <div className="text-sm whitespace-pre-wrap bg-muted p-3 rounded-md">
                  {analysis}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default SpecialtyImageAnalyzer;
