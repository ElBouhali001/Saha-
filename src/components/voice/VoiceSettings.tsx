import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Volume2, User, UserCheck, Settings, Play, Info } from 'lucide-react';
import { AFRICAN_VOICES } from '@/services/elevenLabsVoiceService';
import { cn } from '@/lib/utils';

interface VoiceSettingsProps {
  currentLanguage: string;
  onVoiceTest?: (voiceId: string, text: string) => void;
  onGenderChange?: (gender: 'female' | 'male') => void;
  isElevenLabsEnabled?: boolean;
  className?: string;
}

const VoiceSettings: React.FC<VoiceSettingsProps> = ({
  currentLanguage,
  onVoiceTest,
  onGenderChange,
  isElevenLabsEnabled = false,
  className
}) => {
  const [selectedGender, setSelectedGender] = useState<'female' | 'male'>('female');
  const [isTestingVoice, setIsTestingVoice] = useState<string | null>(null);

  const africanVoices = Object.entries(AFRICAN_VOICES);
  const femaleVoices = africanVoices.filter(([_, voice]) => voice.name.includes('Maimouna'));
  const maleVoices = africanVoices.filter(([_, voice]) => voice.name.includes('Ibrahima'));

  const handleGenderChange = (gender: 'female' | 'male') => {
    setSelectedGender(gender);
    onGenderChange?.(gender);
  };

  const handleVoiceTest = async (voiceId: string, voiceName: string) => {
    if (!onVoiceTest) return;
    
    setIsTestingVoice(voiceId);
    
    const testTexts = {
      wolof: "Na nga def ? Dama def Maimouna, sama assistant MediPatient.",
      pulaar: "No feeñi ? Mi woni Maimouna, assistant maa MediPatient.",
      serere: "No dem ? Man Maimouna laa, assistant MediPatient.",
      diola: "Kajimaat ? Emmit Maimouna, assistant MediPatient.",
      francais: "Bonjour ! Je suis Maimouna, votre assistante MediPatient avec un accent sénégalais chaleureux."
    };

    const testText = testTexts[currentLanguage as keyof typeof testTexts] || testTexts.francais;
    
    try {
      await onVoiceTest(voiceId, testText);
    } finally {
      setIsTestingVoice(null);
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Paramètres Vocaux Africains
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Statut ElevenLabs */}
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border">
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-blue-600" />
            <div>
              <div className="font-medium">
                {isElevenLabsEnabled ? "Voix Premium Activée" : "Voix Standard"}
              </div>
              <div className="text-sm text-gray-600">
                {isElevenLabsEnabled 
                  ? "Voix naturelle africaine ElevenLabs" 
                  : "Synthèse vocale du navigateur"
                }
              </div>
            </div>
          </div>
          <Badge variant={isElevenLabsEnabled ? "default" : "secondary"}>
            {isElevenLabsEnabled ? "Premium" : "Standard"}
          </Badge>
        </div>

        {/* Sélection du genre de voix */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Genre de la voix</Label>
          <div className="flex gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="female-voice"
                checked={selectedGender === 'female'}
                onCheckedChange={() => handleGenderChange('female')}
              />
              <Label htmlFor="female-voice" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Féminine (Maimouna)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="male-voice"
                checked={selectedGender === 'male'}
                onCheckedChange={() => handleGenderChange('male')}
              />
              <Label htmlFor="male-voice" className="flex items-center gap-2">
                <UserCheck className="w-4 h-4" />
                Masculine (Ibrahima)
              </Label>
            </div>
          </div>
        </div>

        {/* Test des voix africaines */}
        {isElevenLabsEnabled && (
          <div className="space-y-4">
            <Label className="text-base font-medium">Tester les Voix Africaines</Label>
            
            {/* Voix féminines */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-pink-600">Voix Féminines</h4>
              <div className="grid gap-2">
                {femaleVoices.map(([key, voice]) => (
                  <Card key={key} className="p-3 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">🇸🇳 {voice.name}</div>
                        <div className="text-xs text-gray-600">{voice.description}</div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleVoiceTest(voice.id, voice.name)}
                        disabled={isTestingVoice === voice.id}
                        className="h-8"
                      >
                        {isTestingVoice === voice.id ? (
                          <Volume2 className="w-3 h-3 animate-pulse" />
                        ) : (
                          <Play className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Voix masculines */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-blue-600">Voix Masculines</h4>
              <div className="grid gap-2">
                {maleVoices.map(([key, voice]) => (
                  <Card key={key} className="p-3 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">🇸🇳 {voice.name}</div>
                        <div className="text-xs text-gray-600">{voice.description}</div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleVoiceTest(voice.id, voice.name)}
                        disabled={isTestingVoice === voice.id}
                        className="h-8"
                      >
                        {isTestingVoice === voice.id ? (
                          <Volume2 className="w-3 h-3 animate-pulse" />
                        ) : (
                          <Play className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Information sur les voix contextuelles */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Voix Contextuelles Sénégalaises</p>
              <ul className="text-sm space-y-1">
                <li>• <strong>Maimouna</strong> : Voix féminine chaleureuse avec accent francophone africain</li>
                <li>• <strong>Ibrahima</strong> : Voix masculine rassurante, contexte ouest-africain</li>
                <li>• Adaptation automatique selon la langue (Wolof, Pulaar, Sérère, Diola)</li>
                <li>• Prononciation optimisée pour les termes médicaux locaux</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>

        {/* Conseils d'utilisation */}
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
          <p className="font-medium mb-1">💡 Conseils d'utilisation :</p>
          <ul className="space-y-1">
            <li>• Parlez clairement et lentement pour une meilleure reconnaissance</li>
            <li>• Utilisez les mots-clés médicaux en wolof, pulaar ou français</li>
            <li>• L'assistant s'adapte automatiquement à votre accent</li>
            <li>• Testez différentes voix pour trouver celle qui vous convient</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceSettings;