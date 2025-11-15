import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, Loader2, FileImage, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CardiologyAnalysis {
  imagingType: string;
  generalCondition: string;
  findings: Array<{
    type: string;
    severity: string;
    location: string;
    description: string;
  }>;
  heartChambers: {
    leftVentricle: string;
    rightVentricle: string;
    leftAtrium: string;
    rightAtrium: string;
  };
  valves: {
    mitral: string;
    aortic: string;
    tricuspid: string;
    pulmonary: string;
  };
  symptoms: string[];
  diagnosis: string;
  recommendedActions: string[];
  urgency: string;
  confidence: number;
}

interface CardiologyImagingAnalyzerProps {
  onAnalysisComplete?: (analysis: CardiologyAnalysis) => void;
  onSpecialtyDataUpdate?: (data: any) => void;
}

const CardiologyImagingAnalyzer: React.FC<CardiologyImagingAnalyzerProps> = ({
  onAnalysisComplete,
  onSpecialtyDataUpdate
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<CardiologyAnalysis | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageUpload = async (file: File) => {
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleAnalyze = async () => {
    if (!previewImage) return;
    setIsAnalyzing(true);
    try {
      const response = await fetch(previewImage);
      const blob = await response.blob();

      const reader = new FileReader();
      reader.readAsDataURL(blob);

      reader.onload = async () => {
        const base64Image = reader.result as string;

        const { data, error } = await supabase.functions.invoke('analyze-cardiac-imaging', {
          body: { image: base64Image }
        });

        if (error) throw error;

        setAnalysis(data);
        if (onAnalysisComplete) onAnalysisComplete(data);

        toast({
          title: "Analyse terminée",
          description: "L'imagerie cardiologique a été analysée avec succès",
        });
      };

      reader.onerror = () => {
        throw new Error("Erreur lors de la lecture de l'image");
      };
    } catch (error: any) {
      toast({
        title: "Erreur d'analyse",
        description: error.message || "Impossible d'analyser l'image",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleApplyToConsultation = () => {
    if (!analysis || !onSpecialtyDataUpdate) return;

    onSpecialtyDataUpdate({
      cardiacImaging: {
        type: analysis.imagingType,
        findings: analysis.findings,
        heartChambers: analysis.heartChambers,
        valves: analysis.valves,
        diagnosis: analysis.diagnosis,
        urgency: analysis.urgency
      }
    });

    toast({
      title: "Appliqué à la consultation",
      description: "Les résultats d'imagerie ont été ajoutés",
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'sévère': return 'destructive';
      case 'modéré': return 'default';
      case 'léger': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-600" />
          Analyse IA d'Imagerie Cardiologique
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />
        
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={isAnalyzing}
          className="w-full"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyse en cours...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Télécharger une image (ECG, Echo, IRM)
            </>
          )}
        </Button>

        {previewImage && (
          <div className="space-y-2">
            <div className="relative">
              <img src={previewImage} alt="Imagerie cardiologique" className="w-full rounded-md" />
            </div>
            <Button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full">
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyse en cours...
                </>
              ) : (
                "Lancer l'analyse IA"
              )}
            </Button>
          </div>
        )}

        {analysis && (
          <div className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <Badge variant="outline">{analysis.imagingType}</Badge>
              <Badge variant={analysis.urgency === 'Urgente' ? 'destructive' : 'default'}>
                {analysis.urgency}
              </Badge>
            </div>

            <div>
              <h4 className="font-semibold mb-2">État général:</h4>
              <p className="text-sm">{analysis.generalCondition}</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Chambres cardiaques:</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm">
                  <strong>VG:</strong> {analysis.heartChambers.leftVentricle}
                </div>
                <div className="text-sm">
                  <strong>VD:</strong> {analysis.heartChambers.rightVentricle}
                </div>
                <div className="text-sm">
                  <strong>OG:</strong> {analysis.heartChambers.leftAtrium}
                </div>
                <div className="text-sm">
                  <strong>OD:</strong> {analysis.heartChambers.rightAtrium}
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Valves:</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm">
                  <strong>Mitrale:</strong> {analysis.valves.mitral}
                </div>
                <div className="text-sm">
                  <strong>Aortique:</strong> {analysis.valves.aortic}
                </div>
                <div className="text-sm">
                  <strong>Tricuspide:</strong> {analysis.valves.tricuspid}
                </div>
                <div className="text-sm">
                  <strong>Pulmonaire:</strong> {analysis.valves.pulmonary}
                </div>
              </div>
            </div>

            {analysis.findings.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Résultats cliniques:</h4>
                <div className="space-y-2">
                  {analysis.findings.map((finding, index) => (
                    <div key={index} className="p-3 bg-muted rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{finding.type}</span>
                        <Badge variant={getSeverityColor(finding.severity)}>
                          {finding.severity}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        <strong>Localisation:</strong> {finding.location}
                      </p>
                      <p className="text-sm mt-1">{finding.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="font-semibold mb-2">Diagnostic:</h4>
              <p className="text-sm">{analysis.diagnosis}</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Actions recommandées:</h4>
              <ul className="list-disc list-inside space-y-1">
                {analysis.recommendedActions.map((action, index) => (
                  <li key={index} className="text-sm">{action}</li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-sm text-muted-foreground">
                Confiance: {(analysis.confidence * 100).toFixed(0)}%
              </span>
              <Button onClick={handleApplyToConsultation}>
                Appliquer à la consultation
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CardiologyImagingAnalyzer;
