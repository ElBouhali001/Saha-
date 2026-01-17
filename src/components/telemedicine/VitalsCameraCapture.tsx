import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Camera, 
  CameraOff,
  Heart, 
  Wind, 
  Thermometer, 
  Brain, 
  Activity,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Smile,
  Frown,
  Meh,
  Eye,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface VitalsAnalysis {
  detectedSkinType: string;
  skinTypeNote: string;
  heartRate: number;
  heartRateConfidence: number;
  respiratoryRate: number;
  respiratoryRateConfidence: number;
  estimatedTemperature: string;
  temperatureNote: string;
  mood: string;
  moodConfidence: number;
  moodIndicators: string[];
  physicalCondition: string;
  physicalConditionDetails: string[];
  skinColor: string;
  skinColorAnalysis: string;
  facialExpression: string;
  eyeCondition: string;
  mucosalAssessment: string;
  overallHealthScore: number;
  alerts: string[];
  recommendations: string[];
  analysisTimestamp: string;
}

interface VitalsCameraCaptureProps {
  onVitalsCapture?: (vitals: VitalsAnalysis) => void;
  autoCapture?: boolean;
  captureIntervalSeconds?: number;
}

const VitalsCameraCapture: React.FC<VitalsCameraCaptureProps> = ({
  onVitalsCapture,
  autoCapture = false,
  captureIntervalSeconds = 30
}) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [vitals, setVitals] = useState<VitalsAnalysis | null>(null);
  const [captureProgress, setCaptureProgress] = useState(0);
  const [isAutoCapturing, setIsAutoCapturing] = useState(autoCapture);
  const [lastCaptureTime, setLastCaptureTime] = useState<Date | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const autoCaptureIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const { toast } = useToast();

  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      
      streamRef.current = stream;
      setIsCameraActive(true);
      
      toast({
        title: "Caméra activée",
        description: "Positionnez le visage du patient face à la caméra",
      });
    } catch (error) {
      console.error('Erreur d\'accès à la caméra:', error);
      setCameraError("Impossible d'accéder à la caméra. Vérifiez les permissions.");
      toast({
        title: "Erreur",
        description: "Impossible d'accéder à la caméra",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (autoCaptureIntervalRef.current) {
      clearInterval(autoCaptureIntervalRef.current);
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    setIsCameraActive(false);
    setIsAutoCapturing(false);
    setCaptureProgress(0);
  };

  const captureFrame = (): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video.readyState < 2 || video.videoWidth === 0) {
      return null;
    }
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.9);
  };

  const analyzeVitals = async () => {
    if (!isCameraActive || isAnalyzing) return;
    
    setIsAnalyzing(true);
    const frameData = captureFrame();
    
    if (!frameData) {
      toast({
        title: "Capture échouée",
        description: "Assurez-vous que le patient est visible à la caméra",
        variant: "destructive",
      });
      setIsAnalyzing(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('analyze-vitals-camera', {
        body: { imageData: frameData }
      });

      if (error) throw error;

      if (data?.analysis) {
        const analysis: VitalsAnalysis = {
          ...data.analysis,
          analysisTimestamp: new Date().toISOString()
        };
        
        setVitals(analysis);
        setLastCaptureTime(new Date());
        
        if (onVitalsCapture) {
          onVitalsCapture(analysis);
        }
        
        toast({
          title: "✅ Analyse terminée",
          description: `Score de santé: ${analysis.overallHealthScore}/100`,
        });
        
        if (analysis.alerts && analysis.alerts.length > 0) {
          toast({
            title: "⚠️ Alertes détectées",
            description: analysis.alerts[0],
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Erreur d\'analyse:', error);
      toast({
        title: "Erreur d'analyse",
        description: "Impossible d'analyser les constantes vitales",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleAutoCapture = () => {
    if (!isAutoCapturing) {
      setIsAutoCapturing(true);
      setCaptureProgress(0);
      
      // Capture immédiate
      analyzeVitals();
      
      // Puis intervalle
      autoCaptureIntervalRef.current = setInterval(() => {
        analyzeVitals();
        setCaptureProgress(0);
      }, captureIntervalSeconds * 1000);
      
      // Barre de progression
      progressIntervalRef.current = setInterval(() => {
        setCaptureProgress(prev => {
          if (prev >= 100) return 0;
          return prev + (100 / captureIntervalSeconds);
        });
      }, 1000);
    } else {
      setIsAutoCapturing(false);
      if (autoCaptureIntervalRef.current) {
        clearInterval(autoCaptureIntervalRef.current);
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      setCaptureProgress(0);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const getMoodIcon = (mood: string) => {
    switch (mood?.toLowerCase()) {
      case 'heureux':
      case 'joyeux':
      case 'positif':
        return <Smile className="w-5 h-5 text-green-500" />;
      case 'triste':
      case 'déprimé':
      case 'négatif':
        return <Frown className="w-5 h-5 text-red-500" />;
      default:
        return <Meh className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Camera className="w-5 h-5 text-primary" />
            <span>Capture des Constantes par Caméra</span>
          </CardTitle>
          <CardDescription>
            Analyse IA du visage pour estimer les constantes vitales, l'humeur et l'état de forme
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Zone vidéo */}
          <div className="relative bg-black rounded-lg overflow-hidden" style={{ height: '300px' }}>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {!isCameraActive && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-90">
                <div className="text-center text-white">
                  <Camera className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">Analyse par Caméra</p>
                  <p className="text-gray-300 text-sm">Activez la caméra pour capturer les constantes du patient</p>
                </div>
              </div>
            )}
            
            {isAnalyzing && (
              <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-2 rounded-lg flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Analyse en cours...</span>
              </div>
            )}
            
            {isAutoCapturing && (
              <div className="absolute bottom-4 left-4 right-4">
                <Progress value={captureProgress} className="h-2" />
                <p className="text-white text-xs mt-1">Prochaine analyse dans {Math.ceil((100 - captureProgress) / (100 / captureIntervalSeconds))}s</p>
              </div>
            )}
          </div>

          {cameraError && (
            <Alert variant="destructive">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>{cameraError}</AlertDescription>
            </Alert>
          )}

          {/* Contrôles */}
          <div className="flex flex-wrap gap-2 justify-center">
            {!isCameraActive ? (
              <Button onClick={startCamera} className="gap-2">
                <Camera className="w-4 h-4" />
                Activer la caméra
              </Button>
            ) : (
              <>
                <Button onClick={analyzeVitals} disabled={isAnalyzing} className="gap-2">
                  {isAnalyzing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Activity className="w-4 h-4" />
                  )}
                  Analyser maintenant
                </Button>
                <Button 
                  onClick={toggleAutoCapture} 
                  variant={isAutoCapturing ? "default" : "outline"}
                  className="gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isAutoCapturing ? 'animate-spin' : ''}`} />
                  {isAutoCapturing ? 'Arrêter auto' : 'Analyse auto'}
                </Button>
                <Button onClick={stopCamera} variant="destructive" className="gap-2">
                  <CameraOff className="w-4 h-4" />
                  Arrêter
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Résultats de l'analyse */}
      {vitals && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Résultats de l'Analyse</span>
              </div>
              <Badge className={getHealthScoreColor(vitals.overallHealthScore)}>
                Score: {vitals.overallHealthScore}/100
              </Badge>
            </CardTitle>
            {lastCaptureTime && (
              <CardDescription>
                Dernière analyse: {lastCaptureTime.toLocaleTimeString('fr-FR')}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Constantes vitales principales */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-secondary rounded-lg text-center">
                <Heart className="w-6 h-6 text-red-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{vitals.heartRate}</p>
                <p className="text-xs text-muted-foreground">bpm</p>
                <Badge variant="outline" className="mt-1 text-xs">
                  {vitals.heartRateConfidence}% confiance
                </Badge>
              </div>
              
              <div className="p-4 bg-secondary rounded-lg text-center">
                <Wind className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{vitals.respiratoryRate}</p>
                <p className="text-xs text-muted-foreground">/min</p>
                <Badge variant="outline" className="mt-1 text-xs">
                  {vitals.respiratoryRateConfidence}% confiance
                </Badge>
              </div>
              
              <div className="p-4 bg-secondary rounded-lg text-center">
                <Thermometer className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{vitals.estimatedTemperature}</p>
                <p className="text-xs text-muted-foreground">estimation</p>
                <p className="text-xs text-amber-600 mt-1">{vitals.temperatureNote}</p>
              </div>
              
              <div className="p-4 bg-secondary rounded-lg text-center">
                {getMoodIcon(vitals.mood)}
                <p className="text-lg font-bold mt-2">{vitals.mood}</p>
                <p className="text-xs text-muted-foreground">humeur</p>
                <Badge variant="outline" className="mt-1 text-xs">
                  {vitals.moodConfidence}% confiance
                </Badge>
              </div>
            </div>

            {/* Type de peau détecté */}
            {vitals.detectedSkinType && (
              <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-lg">🌍</span>
                  <h4 className="font-medium text-amber-800 dark:text-amber-200">Phototype détecté</h4>
                </div>
                <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">{vitals.detectedSkinType}</p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">{vitals.skinTypeNote}</p>
              </div>
            )}

            {/* Analyse détaillée */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Brain className="w-5 h-5 text-purple-500" />
                  <h4 className="font-medium">État physique</h4>
                </div>
                <p className="text-sm font-semibold">{vitals.physicalCondition}</p>
                <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                  {vitals.physicalConditionDetails?.map((detail, i) => (
                    <li key={i}>• {detail}</li>
                  ))}
                </ul>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Eye className="w-5 h-5 text-cyan-500" />
                  <h4 className="font-medium">Analyse visuelle</h4>
                </div>
                <p className="text-sm"><strong>Expression:</strong> {vitals.facialExpression}</p>
                <p className="text-sm"><strong>Teint:</strong> {vitals.skinColor}</p>
                <p className="text-sm text-muted-foreground">{vitals.skinColorAnalysis}</p>
                <p className="text-sm"><strong>Yeux:</strong> {vitals.eyeCondition}</p>
                {vitals.mucosalAssessment && vitals.mucosalAssessment !== 'non visible' && (
                  <p className="text-sm"><strong>Muqueuses:</strong> {vitals.mucosalAssessment}</p>
                )}
              </div>
            </div>

            {/* Indicateurs d'humeur */}
            {vitals.moodIndicators && vitals.moodIndicators.length > 0 && (
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Indicateurs d'humeur détectés</h4>
                <div className="flex flex-wrap gap-2">
                  {vitals.moodIndicators.map((indicator, i) => (
                    <Badge key={i} variant="secondary">{indicator}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Alertes */}
            {vitals.alerts && vitals.alerts.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>
                  <ul className="space-y-1">
                    {vitals.alerts.map((alert, i) => (
                      <li key={i}>• {alert}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Recommandations */}
            {vitals.recommendations && vitals.recommendations.length > 0 && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Recommandations</h4>
                <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                  {vitals.recommendations.map((rec, i) => (
                    <li key={i}>✓ {rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VitalsCameraCapture;
