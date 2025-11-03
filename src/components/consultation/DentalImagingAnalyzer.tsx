import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, Upload, Loader2, FileImage, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface DentalAnalysis {
  imagingType: string;
  generalCondition: string;
  findings: Array<{
    type: string;
    location: string;
    severity: string;
    description: string;
  }>;
  teeth: {
    present: number;
    missing: number;
    restored: number;
  };
  symptoms: string;
  diagnosis: string;
  recommendedActions: string[];
  urgency: string;
  confidence: number;
}

interface DentalImagingAnalyzerProps {
  onAnalysisComplete: (symptoms: string, diagnosis: string) => void;
}

const DentalImagingAnalyzer: React.FC<DentalImagingAnalyzerProps> = ({ onAnalysisComplete }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<DentalAnalysis | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une image valide",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result as string;
        setPreviewImage(base64Image);

        try {
          const { data, error } = await supabase.functions.invoke('analyze-dental-imaging', {
            body: { imageData: base64Image }
          });

          if (error) throw error;

          if (!data.success) {
            throw new Error(data.error || 'Échec de l\'analyse');
          }

          const analysisResult = data.analysis as DentalAnalysis;
          setAnalysis(analysisResult);

          toast({
            title: "Analyse terminée",
            description: `Confiance: ${analysisResult.confidence}%`,
          });
        } catch (error) {
          console.error('Error analyzing image:', error);
          toast({
            title: "Erreur d'analyse",
            description: error instanceof Error ? error.message : "Impossible d'analyser l'image",
            variant: "destructive"
          });
        } finally {
          setIsAnalyzing(false);
        }
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error reading file:', error);
      toast({
        title: "Erreur",
        description: "Impossible de lire le fichier",
        variant: "destructive"
      });
      setIsAnalyzing(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleApplyToConsultation = () => {
    if (analysis) {
      onAnalysisComplete(analysis.symptoms, analysis.diagnosis);
      toast({
        title: "Résultats appliqués",
        description: "Les symptômes et diagnostic ont été ajoutés à la consultation",
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'légère': return 'bg-yellow-100 text-yellow-800';
      case 'modérée': return 'bg-orange-100 text-orange-800';
      case 'sévère': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case 'faible': return 'text-green-600';
      case 'modérée': return 'text-orange-600';
      case 'élevée': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-blue-600">
          <FileImage className="w-5 h-5 mr-2" />
          Analyse IA d'Imagerie Dentaire
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <div className="flex gap-2">
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isAnalyzing}
              className="flex-1"
              variant="outline"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyse en cours...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Télécharger une image
                </>
              )}
            </Button>
          </div>

          <Alert>
            <AlertDescription className="text-sm">
              Formats acceptés: Radiographies panoramiques, rétro-alvéolaires, bite-wings, photos intra-orales
            </AlertDescription>
          </Alert>
        </div>

        {previewImage && (
          <div className="border rounded-lg overflow-hidden">
            <img 
              src={previewImage} 
              alt="Imagerie dentaire" 
              className="w-full h-auto max-h-64 object-contain bg-gray-50"
            />
          </div>
        )}

        {analysis && (
          <div className="space-y-4 border-t pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Type d'imagerie</p>
                <p className="font-medium">{analysis.imagingType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">État général</p>
                <p className="font-medium">{analysis.generalCondition}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Urgence</p>
                <p className={`font-medium ${getUrgencyColor(analysis.urgency)}`}>
                  {analysis.urgency}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Confiance</p>
                <p className="font-medium">{analysis.confidence}%</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">État dentaire</p>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="bg-green-50 p-2 rounded">
                  <p className="text-gray-600">Présentes</p>
                  <p className="font-bold text-green-700">{analysis.teeth.present}</p>
                </div>
                <div className="bg-red-50 p-2 rounded">
                  <p className="text-gray-600">Manquantes</p>
                  <p className="font-bold text-red-700">{analysis.teeth.missing}</p>
                </div>
                <div className="bg-blue-50 p-2 rounded">
                  <p className="text-gray-600">Restaurées</p>
                  <p className="font-bold text-blue-700">{analysis.teeth.restored}</p>
                </div>
              </div>
            </div>

            {analysis.findings.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Observations cliniques</p>
                <div className="space-y-2">
                  {analysis.findings.map((finding, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {finding.type}
                          </Badge>
                          <Badge className={`text-xs ${getSeverityColor(finding.severity)}`}>
                            {finding.severity}
                          </Badge>
                        </div>
                        <span className="text-xs text-gray-500">{finding.location}</span>
                      </div>
                      <p className="text-sm">{finding.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analysis.recommendedActions.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Actions recommandées</p>
                <ul className="space-y-1">
                  {analysis.recommendedActions.map((action, index) => (
                    <li key={index} className="flex items-start text-sm">
                      <CheckCircle2 className="w-4 h-4 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Button 
              onClick={handleApplyToConsultation}
              className="w-full"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Appliquer à la consultation
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DentalImagingAnalyzer;
