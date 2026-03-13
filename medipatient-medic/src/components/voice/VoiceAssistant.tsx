import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Languages, 
  Loader2, 
  Phone,
  MessageCircle,
  Calendar,
  Pill,
  FileText,
  HelpCircle,
  Settings
} from 'lucide-react';
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';
import VoiceSettings from './VoiceSettings';
import { cn } from '@/lib/utils';

interface VoiceAssistantProps {
  onNavigate?: (route: string) => void;
  className?: string;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ onNavigate, className }) => {
  const {
    isListening,
    isProcessing,
    isSpeaking,
    currentTranscript,
    lastIntent,
    currentLanguage,
    error,
    supportedLanguages,
    setLanguage,
    startListening,
    stopListening,
    speak,
    respondToIntent,
    greet,
    getQuickCommands,
    clearError,
    clearTranscript
  } = useVoiceAssistant();

  const [isExpanded, setIsExpanded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);

  const languages = Object.entries(supportedLanguages);
  const quickCommands = getQuickCommands();

  // Saluer l'utilisateur au premier chargement
  useEffect(() => {
    if (!hasGreeted) {
      setTimeout(() => {
        greet();
        setHasGreeted(true);
      }, 1000);
    }
  }, [greet, hasGreeted]);

  // Répondre automatiquement aux intentions détectées
  useEffect(() => {
    if (lastIntent && lastIntent.confidence > 0.5) {
      respondToIntent(lastIntent).then(() => {
        // Navigation automatique selon l'intention
        if (onNavigate) {
          switch (lastIntent.type) {
            case 'appointment':
              onNavigate('appointments');
              break;
            case 'prescription':
              onNavigate('prescriptions');
              break;
            case 'results':
              onNavigate('records');
              break;
            case 'emergency':
              // Afficher les contacts d'urgence
              break;
          }
        }
      }).catch(console.error);
    }
  }, [lastIntent, respondToIntent, onNavigate]);

  const handleVoiceToggle = async () => {
    if (isListening) {
      stopListening();
    } else {
      try {
        clearError();
        clearTranscript();
        await startListening();
      } catch (err) {
        console.error('Erreur reconnaissance vocale:', err);
      }
    }
  };

  const handleQuickCommand = async (command: string) => {
    try {
      await speak(command);
    } catch (err) {
      console.error('Erreur commande rapide:', err);
    }
  };

  const handleLanguageChange = (language: string) => {
    setLanguage(language);
    const langData = supportedLanguages[language];
    speak(`${langData.nom} - Assistant vocal sénégalais activé`);
  };

  const handleVoiceTest = async (voiceId: string, text: string) => {
    // Cette fonction sera gérée par le service vocal amélioré
    try {
      await speak(text);
    } catch (err) {
      console.error('Erreur test vocal:', err);
    }
  };

  const handleGenderChange = (gender: 'female' | 'male') => {
    // Informer le service vocal du changement de genre
    console.log('Changement de genre vocal:', gender);
  };

  const getStatusIcon = () => {
    if (isListening) return <Mic className="w-6 h-6 text-red-500 animate-pulse" />;
    if (isProcessing) return <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />;
    if (isSpeaking) return <Volume2 className="w-6 h-6 text-green-500 animate-bounce" />;
    return <MicOff className="w-6 h-6 text-gray-400" />;
  };

  const getStatusText = () => {
    if (isListening) return "À l'écoute...";
    if (isProcessing) return "Analyse en cours...";
    if (isSpeaking) return "Assistant qui parle...";
    return "Prêt à vous écouter";
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "bg-green-500";
    if (confidence >= 0.6) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className={cn("fixed bottom-4 right-4 z-50", className)}>
      {/* Bouton principal flottant */}
      <div className="relative">
        <Button
          size="lg"
          className={cn(
            "rounded-full w-16 h-16 shadow-lg transition-all duration-300",
            isListening && "ring-4 ring-red-200 bg-red-500 hover:bg-red-600",
            isProcessing && "ring-4 ring-blue-200 bg-blue-500 hover:bg-blue-600",
            isSpeaking && "ring-4 ring-green-200 bg-green-500 hover:bg-green-600",
            !isListening && !isProcessing && !isSpeaking && "bg-primary hover:bg-primary/90"
          )}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {getStatusIcon()}
        </Button>

        {/* Indicateur d'activité */}
        {(isListening || isProcessing || isSpeaking) && (
          <div className="absolute -top-2 -right-2">
            <div className="w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
          </div>
        )}
      </div>

      {/* Interface étendue */}
      {isExpanded && !showSettings && (
        <div className="absolute bottom-20 right-0 w-80 bg-white border rounded-lg shadow-xl p-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-lg">
                <span className="flex items-center gap-2">
                  <Languages className="w-5 h-5" />
                  Assistant Vocal Sénégalais
                </span>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowSettings(true)}
                    title="Paramètres vocaux"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setIsExpanded(false)}
                  >
                    ×
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Sélecteur de langue */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Langue:</label>
                <Select value={currentLanguage} onValueChange={handleLanguageChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map(([key, lang]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <span>{lang.nom}</span>
                          <Badge variant="outline" className="text-xs">
                            {lang.population}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                {getStatusIcon()}
                <span className="text-sm font-medium">{getStatusText()}</span>
              </div>

              {/* Contrôles principaux */}
              <div className="flex gap-2">
                <Button
                  onClick={handleVoiceToggle}
                  disabled={isProcessing || isSpeaking}
                  className="flex-1"
                  variant={isListening ? "destructive" : "default"}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-4 h-4 mr-2" />
                      Arrêter
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 mr-2" />
                      Parler
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => greet()}
                  disabled={isSpeaking}
                >
                  👋
                </Button>
              </div>

              {/* Commandes rapides */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Commandes rapides:</label>
                <div className="grid grid-cols-2 gap-1">
                  {quickCommands.map((cmd, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-xs p-2 h-auto"
                      onClick={() => handleQuickCommand(cmd.text)}
                      disabled={isSpeaking}
                    >
                      {cmd.action === 'appointment' && <Calendar className="w-3 h-3 mr-1" />}
                      {cmd.action === 'prescription' && <Pill className="w-3 h-3 mr-1" />}
                      {cmd.action === 'emergency' && <Phone className="w-3 h-3 mr-1" />}
                      {cmd.action === 'help' && <HelpCircle className="w-3 h-3 mr-1" />}
                      <span className="truncate">{cmd.text}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Transcription */}
              {currentTranscript && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Transcription:</label>
                  <div className="p-2 bg-blue-50 rounded text-sm">
                    {currentTranscript}
                  </div>
                </div>
              )}

              {/* Intention détectée */}
              {lastIntent && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Intention détectée:</label>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{lastIntent.type}</Badge>
                    <div className="flex items-center gap-1">
                      <div 
                        className={cn(
                          "w-2 h-2 rounded-full",
                          getConfidenceColor(lastIntent.confidence)
                        )}
                      />
                      <span className="text-xs text-gray-500">
                        {Math.round(lastIntent.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                  {Object.keys(lastIntent.entities).length > 0 && (
                    <div className="text-xs text-gray-600">
                      Détails: {JSON.stringify(lastIntent.entities)}
                    </div>
                  )}
                </div>
              )}

              {/* Erreurs */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Urgence */}
              <div className="pt-2 border-t">
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => speak("URGENCE ! Wutewu 15 bu gaaw gaaw ! Appelez le 15 immédiatement !")}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Urgence - 15
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Paramètres vocaux */}
      {isExpanded && showSettings && (
        <div className="absolute bottom-20 right-0 w-96 bg-white border rounded-lg shadow-xl p-1">
          <div className="flex items-center justify-between p-3 border-b">
            <h3 className="font-medium">Paramètres Vocaux</h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowSettings(false)}
            >
              ← Retour
            </Button>
          </div>
          <div className="p-3">
            <VoiceSettings
              currentLanguage={currentLanguage}
              onVoiceTest={handleVoiceTest}
              onGenderChange={handleGenderChange}
              isElevenLabsEnabled={true} // TODO: Détecter si ElevenLabs est activé
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceAssistant;