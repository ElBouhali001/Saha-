import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Volume2, Check } from 'lucide-react';
import { LANGUES_SUPPORTEES, PHRASES_BASE } from '@/services/voiceService';
import { cn } from '@/lib/utils';

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
  onPlaySample?: (language: string, text: string) => void;
  className?: string;
  compact?: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onLanguageChange,
  onPlaySample,
  className,
  compact = false
}) => {
  const [playingLanguage, setPlayingLanguage] = useState<string | null>(null);

  const languages = Object.entries(LANGUES_SUPPORTEES);

  const getLanguageFlag = (languageKey: string) => {
    const flags = {
      wolof: '🇸🇳',
      pulaar: '🇸🇳',
      serere: '🇸🇳', 
      diola: '🇸🇳',
      francais: '🇫🇷'
    };
    return flags[languageKey as keyof typeof flags] || '🌍';
  };

  const handlePlaySample = async (languageKey: string) => {
    if (!onPlaySample) return;
    
    setPlayingLanguage(languageKey);
    const phrases = PHRASES_BASE[languageKey as keyof typeof PHRASES_BASE];
    const sampleText = phrases?.greeting || "Bonjour";
    
    try {
      await onPlaySample(languageKey, sampleText);
    } finally {
      setPlayingLanguage(null);
    }
  };

  if (compact) {
    return (
      <div className={cn("flex flex-wrap gap-1", className)}>
        {languages.map(([key, lang]) => (
          <Button
            key={key}
            variant={selectedLanguage === key ? "default" : "outline"}
            size="sm"
            className="h-8"
            onClick={() => onLanguageChange(key)}
          >
            <span className="mr-1">{getLanguageFlag(key)}</span>
            <span className="text-xs">{lang.nom.split('/')[0]}</span>
            {selectedLanguage === key && <Check className="w-3 h-3 ml-1" />}
          </Button>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <h3 className="text-sm font-medium text-gray-700">Choisir votre langue</h3>
      
      <div className="grid gap-2">
        {languages.map(([key, lang]) => (
          <Card 
            key={key}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              selectedLanguage === key && "ring-2 ring-primary bg-primary/5"
            )}
            onClick={() => onLanguageChange(key)}
          >
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getLanguageFlag(key)}</span>
                  
                  <div>
                    <div className="font-medium text-sm">{lang.nom}</div>
                    <div className="text-xs text-gray-500">{lang.population}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Badge de sélection */}
                  {selectedLanguage === key && (
                    <Badge variant="default" className="text-xs">
                      <Check className="w-3 h-3 mr-1" />
                      Sélectionné
                    </Badge>
                  )}

                  {/* Bouton d'écoute */}
                  {onPlaySample && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlaySample(key);
                      }}
                      disabled={playingLanguage === key}
                    >
                      <Volume2 
                        className={cn(
                          "w-4 h-4",
                          playingLanguage === key && "animate-pulse text-blue-500"
                        )} 
                      />
                    </Button>
                  )}
                </div>
              </div>

              {/* Exemple de phrase */}
              <div className="mt-2 text-xs text-gray-600 italic">
                "{(PHRASES_BASE[key as keyof typeof PHRASES_BASE] || PHRASES_BASE.francais).greeting}"
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Note d'accessibilité */}
      <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
        💡 Appuyez sur l'icône 🔊 pour entendre un exemple dans chaque langue
      </div>
    </div>
  );
};

export default LanguageSelector;