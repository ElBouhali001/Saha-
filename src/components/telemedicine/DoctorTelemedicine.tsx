import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  Activity,
  Heart,
  Thermometer,
  Wind,
  Brain,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  FileText,
  Loader2,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface VitalsData {
  respiratoryRate: number;
  heartRate: number;
  temperature: number;
  emotionalState: string;
  consciousnessLevel: string;
  distressSignals: string[];
  skinColor: string;
  facialExpression: string;
  confidence: number;
  alerts: string[];
}

interface DiagnosisData {
  differentialDiagnosis: Array<{
    condition: string;
    icd10: string;
    probability: number;
    reasoning: string;
    keyFindings: string[];
  }>;
  urgencyLevel: string;
  urgencyReason: string;
  recommendedTests: string[];
  treatmentRecommendations: Array<{
    category: string;
    recommendation: string;
    priority: string;
  }>;
  warningSignals: string[];
  followUp: {
    timeframe: string;
    instructions: string;
  };
}

const DoctorTelemedicine = () => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [vitals, setVitals] = useState<VitalsData | null>(null);
  const [diagnosis, setDiagnosis] = useState<DiagnosisData | null>(null);
  const [symptoms, setSymptoms] = useState('');
  const [autoAnalysis, setAutoAnalysis] = useState(false);
  const [analysisHistory, setAnalysisHistory] = useState<Array<{timestamp: string, vitals: VitalsData}>>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const { toast } = useToast();

  const handleStartVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCallActive(true);
      toast({
        title: "Consultation démarrée",
        description: "La téléconsultation est active",
      });
    } catch (error) {
      console.error('Erreur d\'accès à la caméra:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'accéder à la caméra",
        variant: "destructive",
      });
    }
  };

  const handleEndCall = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
    }
    setIsCallActive(false);
    setIsVideoOn(true);
    setIsAudioOn(true);
    setAutoAnalysis(false);
  };

  const captureFrame = (): string | null => {
    if (!canvasRef.current) return null;
    
    // Try remote video first (patient), fallback to local video (doctor) for testing
    const video = remoteVideoRef.current?.srcObject ? remoteVideoRef.current : videoRef.current;
    
    if (!video || !video.srcObject) {
      console.warn('No video stream available for analysis');
      return null;
    }
    
    // Wait for video to be ready
    if (video.readyState < 2) { // HAVE_CURRENT_DATA
      console.warn('Video not ready yet, readyState:', video.readyState);
      return null;
    }
    
    // Check if video has loaded and has dimensions
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.warn('Video not ready, dimensions are 0');
      return null;
    }
    
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    try {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      
      // Validate the image data
      if (imageData === 'data:,' || imageData.length < 100) {
        console.warn('Invalid image data captured');
        return null;
      }
      
      return imageData;
    } catch (error) {
      console.error('Error capturing frame:', error);
      return null;
    }
  };

  const analyzeVitals = async () => {
    if (!isCallActive || isAnalyzing) return;
    
    setIsAnalyzing(true);
    const frameData = captureFrame();
    
    if (!frameData || frameData === 'data:,') {
      toast({
        title: "Vidéo non disponible",
        description: "Aucun flux vidéo actif à analyser. Assurez-vous que la caméra est activée.",
        variant: "destructive",
      });
      setIsAnalyzing(false);
      return;
    }

    try {
      console.log('Sending frame for analysis...');
      const { data, error } = await supabase.functions.invoke('analyze-patient-vitals', {
        body: { imageData: frameData }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (data.success && data.vitals) {
        setVitals(data.vitals);
        
        // Add to history
        setAnalysisHistory(prev => [...prev, {
          timestamp: new Date().toISOString(),
          vitals: data.vitals
        }].slice(-10)); // Keep last 10 analyses
        
        console.log('Vitals analyzed successfully:', data.vitals);
        
        if (!autoAnalysis) {
          toast({
            title: "✅ Analyse terminée",
            description: "Les constantes vitales ont été analysées avec succès",
          });
        }
        
        // Show alerts if any
        if (data.vitals.alerts && data.vitals.alerts.length > 0) {
          toast({
            title: "⚠️ Alerte constantes vitales",
            description: data.vitals.alerts[0],
            variant: "destructive",
          });
        }
      } else {
        throw new Error(data.error || 'Analyse échouée');
      }
    } catch (error) {
      console.error('Error analyzing vitals:', error);
      toast({
        title: "Erreur d'analyse",
        description: error instanceof Error ? error.message : "Erreur lors de l'analyse des constantes vitales",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateDiagnosis = async () => {
    if (!vitals || !symptoms) {
      toast({
        title: "Information manquante",
        description: "Veuillez saisir les symptômes du patient",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-telemedicine-diagnosis', {
        body: {
          symptoms,
          vitals,
          patientHistory: '',
          currentMedications: '',
          patientAge: 35,
          patientGender: 'M'
        }
      });

      if (error) throw error;

      if (data.success && data.diagnosis) {
        setDiagnosis(data.diagnosis);
        toast({
          title: "Diagnostic généré",
          description: "L'analyse IA est disponible",
        });
      }
    } catch (error) {
      console.error('Error generating diagnosis:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la génération du diagnostic",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (autoAnalysis && isCallActive) {
      // Initial analysis after a delay to let video stabilize
      const initialTimeout = setTimeout(() => {
        analyzeVitals();
      }, 3000);
      
      // Then analyze every 30 seconds
      analysisIntervalRef.current = setInterval(() => {
        analyzeVitals();
      }, 30000);
      
      return () => {
        clearTimeout(initialTimeout);
        if (analysisIntervalRef.current) {
          clearInterval(analysisIntervalRef.current);
        }
      };
    } else if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
      analysisIntervalRef.current = null;
    }
  }, [autoAnalysis, isCallActive]);

  const toggleVideo = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoOn;
        setIsVideoOn(!isVideoOn);
      }
    }
  };

  const toggleAudio = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioOn;
        setIsAudioOn(!isAudioOn);
      }
    }
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'critique': return 'destructive';
      case 'élevé': return 'destructive';
      case 'modéré': return 'default';
      case 'faible': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Video className="w-5 h-5 text-primary" />
            <span>Télémédecine avec Analyse IA</span>
          </CardTitle>
          <CardDescription>
            Consultation vidéo avec analyse en temps réel des constantes vitales et diagnostic IA
          </CardDescription>
        </CardHeader>
      </Card>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Zone vidéo principale */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Vidéo Patient</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative bg-black rounded-lg overflow-hidden" style={{ height: '400px' }}>
                {/* Vidéo du patient */}
                <video
                  ref={remoteVideoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                />
                
                {/* Vidéo du médecin (en petit) */}
                <div className="absolute top-4 right-4 w-32 h-24 bg-gray-800 rounded-lg overflow-hidden border-2 border-white">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    playsInline
                    muted
                  />
                  {!isVideoOn && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                      <VideoOff className="w-6 h-6 text-white" />
                    </div>
                  )}
                </div>

                {/* Indicateur d'analyse */}
                {isAnalyzing && (
                  <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-2 rounded-lg flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Analyse en cours...</span>
                  </div>
                )}

                {/* Message d'attente */}
                {!isCallActive && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
                    <div className="text-center text-white">
                      <Video className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium mb-2">Téléconsultation</p>
                      <p className="text-gray-300">Cliquez sur "Démarrer" pour commencer</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Contrôles */}
              <div className="flex justify-center items-center space-x-4 mt-4">
                {!isCallActive ? (
                  <Button onClick={handleStartVideo} className="bg-green-600 hover:bg-green-700">
                    <Video className="w-4 h-4 mr-2" />
                    Démarrer la consultation
                  </Button>
                ) : (
                  <>
                    <Button
                      variant={isVideoOn ? "default" : "destructive"}
                      onClick={toggleVideo}
                    >
                      {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant={isAudioOn ? "default" : "destructive"}
                      onClick={toggleAudio}
                    >
                      {isAudioOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant={autoAnalysis ? "default" : "outline"}
                      onClick={() => setAutoAnalysis(!autoAnalysis)}
                    >
                      <Activity className="w-4 h-4 mr-2" />
                      {autoAnalysis ? 'Analyse auto ON' : 'Analyse auto OFF'}
                    </Button>
                    <Button onClick={analyzeVitals} disabled={isAnalyzing}>
                      <Activity className="w-4 h-4 mr-2" />
                      Analyser maintenant
                    </Button>
                    <Button variant="destructive" onClick={handleEndCall}>
                      <PhoneOff className="w-4 h-4 mr-2" />
                      Terminer
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panneau des constantes vitales */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Activity className="w-4 h-4 text-primary" />
                <span>Constantes Vitales</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {vitals ? (
                <div className="space-y-4">
                  {/* Fréquence cardiaque */}
                  <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Heart className="w-5 h-5 text-red-500" />
                      <span className="text-sm font-medium">FC</span>
                    </div>
                    <span className="text-lg font-bold">{vitals.heartRate} bpm</span>
                  </div>

                  {/* Fréquence respiratoire */}
                  <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Wind className="w-5 h-5 text-blue-500" />
                      <span className="text-sm font-medium">FR</span>
                    </div>
                    <span className="text-lg font-bold">{vitals.respiratoryRate} /min</span>
                  </div>

                  {/* Température */}
                  <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Thermometer className="w-5 h-5 text-orange-500" />
                      <span className="text-sm font-medium">Temp</span>
                    </div>
                    <span className="text-lg font-bold">{vitals.temperature}°C</span>
                  </div>

                  {/* État émotionnel */}
                  <div className="p-3 bg-secondary rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Brain className="w-5 h-5 text-purple-500" />
                      <span className="text-sm font-medium">État émotionnel</span>
                    </div>
                    <Badge variant="outline">{vitals.emotionalState}</Badge>
                  </div>

                  {/* Niveau de conscience */}
                  <div className="p-3 bg-secondary rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Brain className="w-5 h-5 text-green-500" />
                      <span className="text-sm font-medium">Conscience</span>
                    </div>
                    <Badge variant="outline">{vitals.consciousnessLevel}</Badge>
                  </div>

                  {/* Confiance de l'analyse */}
                  <div className="p-3 bg-secondary rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Confiance</span>
                      <span className="text-sm">{Math.round(vitals.confidence * 100)}%</span>
                    </div>
                    <Progress value={vitals.confidence * 100} />
                  </div>

                  {/* Alertes */}
                  {vitals.alerts && vitals.alerts.length > 0 && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        {vitals.alerts.map((alert, idx) => (
                          <div key={idx}>{alert}</div>
                        ))}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Signes de détresse */}
                  {vitals.distressSignals && vitals.distressSignals.length > 0 && (
                    <div className="p-3 bg-destructive/10 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertTriangle className="w-5 h-5 text-destructive" />
                        <span className="text-sm font-medium">Signes de détresse</span>
                      </div>
                      <ul className="text-sm space-y-1">
                        {vitals.distressSignals.map((signal, idx) => (
                          <li key={idx}>• {signal}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Aucune donnée disponible</p>
                  <p className="text-xs">Démarrez l'analyse pour voir les constantes</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Historique des analyses en temps réel */}
          {analysisHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>Historique (Temps Réel)</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {analysisHistory.slice().reverse().map((entry, idx) => (
                    <div key={idx} className="p-2 bg-secondary/50 rounded text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">
                          {new Date(entry.timestamp).toLocaleTimeString('fr-FR')}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {Math.round(entry.vitals.confidence * 100)}%
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-muted-foreground">
                        <span>FC: {entry.vitals.heartRate} bpm</span>
                        <span>FR: {entry.vitals.respiratoryRate}/min</span>
                        <span>T: {entry.vitals.temperature}°C</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Diagnostic IA */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-primary" />
            <span>Assistant Diagnostic IA</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="input" className="space-y-4">
            <TabsList>
              <TabsTrigger value="input">Symptômes</TabsTrigger>
              <TabsTrigger value="diagnosis">Diagnostic</TabsTrigger>
            </TabsList>

            <TabsContent value="input" className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Symptômes du patient</label>
                <textarea
                  className="w-full p-3 border rounded-lg min-h-[100px]"
                  placeholder="Décrivez les symptômes du patient..."
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                />
              </div>
              <Button 
                onClick={generateDiagnosis} 
                disabled={isAnalyzing || !vitals || !symptoms}
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyse en cours...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Générer le diagnostic IA
                  </>
                )}
              </Button>
            </TabsContent>

            <TabsContent value="diagnosis">
              {diagnosis ? (
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-6">
                    {/* Niveau d'urgence */}
                    <Alert variant={getUrgencyColor(diagnosis.urgencyLevel) as any}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="font-semibold">Niveau d'urgence: {diagnosis.urgencyLevel}</div>
                        <div className="text-sm mt-1">{diagnosis.urgencyReason}</div>
                      </AlertDescription>
                    </Alert>

                    {/* Diagnostic différentiel */}
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center space-x-2">
                        <FileText className="w-4 h-4" />
                        <span>Diagnostic Différentiel</span>
                      </h3>
                      <div className="space-y-3">
                        {diagnosis.differentialDiagnosis.map((diag, idx) => (
                          <Card key={idx}>
                            <CardContent className="pt-4">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h4 className="font-medium">{diag.condition}</h4>
                                  <Badge variant="outline" className="text-xs mt-1">
                                    {diag.icd10}
                                  </Badge>
                                </div>
                                <Badge variant="default">{diag.probability}%</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{diag.reasoning}</p>
                              {diag.keyFindings && diag.keyFindings.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-xs font-medium mb-1">Éléments clés:</p>
                                  <ul className="text-xs space-y-1">
                                    {diag.keyFindings.map((finding, fidx) => (
                                      <li key={fidx}>• {finding}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    {/* Examens recommandés */}
                    <div>
                      <h3 className="font-semibold mb-3">Examens Complémentaires</h3>
                      <ul className="space-y-2">
                        {diagnosis.recommendedTests.map((test, idx) => (
                          <li key={idx} className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-primary" />
                            <span className="text-sm">{test}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Recommandations de traitement */}
                    <div>
                      <h3 className="font-semibold mb-3">Recommandations de Traitement</h3>
                      <div className="space-y-2">
                        {diagnosis.treatmentRecommendations.map((treatment, idx) => (
                          <div key={idx} className="p-3 bg-secondary rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <Badge variant="outline">{treatment.category}</Badge>
                              <Badge variant={
                                treatment.priority === 'immédiat' ? 'destructive' :
                                treatment.priority === 'urgent' ? 'default' : 'secondary'
                              }>
                                {treatment.priority}
                              </Badge>
                            </div>
                            <p className="text-sm">{treatment.recommendation}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Signes d'alerte */}
                    {diagnosis.warningSignals && diagnosis.warningSignals.length > 0 && (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="font-semibold mb-2">Signes d'alerte à surveiller:</div>
                          <ul className="space-y-1">
                            {diagnosis.warningSignals.map((signal, idx) => (
                              <li key={idx} className="text-sm">• {signal}</li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Suivi */}
                    {diagnosis.followUp && (
                      <div className="p-3 bg-secondary rounded-lg">
                        <h3 className="font-semibold mb-2">Suivi</h3>
                        <p className="text-sm mb-1"><strong>Délai:</strong> {diagnosis.followUp.timeframe}</p>
                        <p className="text-sm">{diagnosis.followUp.instructions}</p>
                      </div>
                    )}

                    {/* Disclaimer */}
                    <Alert>
                      <AlertDescription className="text-xs">
                        ℹ️ Ces recommandations sont générées par une IA à titre informatif uniquement. 
                        Elles ne remplacent pas le jugement clinique du médecin.
                      </AlertDescription>
                    </Alert>
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Brain className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Aucun diagnostic généré</p>
                  <p className="text-xs">Saisissez les symptômes et générez le diagnostic</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorTelemedicine;
