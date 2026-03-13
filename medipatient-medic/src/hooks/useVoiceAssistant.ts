import { useState, useCallback, useRef } from 'react';
import { VoiceService, VoiceIntent } from '@/services/voiceService';

interface VoiceAssistantState {
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  currentTranscript: string;
  lastIntent: VoiceIntent | null;
  currentLanguage: string;
  error: string | null;
}

export const useVoiceAssistant = () => {
  const voiceService = useRef(new VoiceService());
  
  const [state, setState] = useState<VoiceAssistantState>({
    isListening: false,
    isProcessing: false,
    isSpeaking: false,
    currentTranscript: '',
    lastIntent: null,
    currentLanguage: 'francais',
    error: null
  });

  const updateState = useCallback((updates: Partial<VoiceAssistantState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const setLanguage = useCallback((language: string) => {
    voiceService.current.setLanguage(language);
    updateState({ currentLanguage: language });
  }, [updateState]);

  const startListening = useCallback(async () => {
    try {
      updateState({ isListening: true, error: null });
      
      const transcript = await voiceService.current.startListening();
      
      if (transcript.trim()) {
        updateState({ 
          currentTranscript: transcript,
          isListening: false,
          isProcessing: true 
        });

        // Analyser l'intention
        const intent = voiceService.current.analyzeIntent(transcript);
        
        updateState({ 
          lastIntent: intent,
          isProcessing: false 
        });

        return { transcript, intent };
      } else {
        updateState({ isListening: false });
        return null;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      updateState({ 
        isListening: false, 
        isProcessing: false, 
        error: errorMessage 
      });
      throw error;
    }
  }, [updateState]);

  const stopListening = useCallback(() => {
    voiceService.current.stopListening();
    updateState({ isListening: false });
  }, [updateState]);

  const speak = useCallback(async (text: string) => {
    try {
      updateState({ isSpeaking: true, error: null });
      await voiceService.current.speak(text);
      updateState({ isSpeaking: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur synthèse vocale';
      updateState({ 
        isSpeaking: false, 
        error: errorMessage 
      });
      throw error;
    }
  }, [updateState]);

  const respondToIntent = useCallback(async (intent: VoiceIntent) => {
    const service = voiceService.current;
    
    try {
      let response = '';
      
      switch (intent.type) {
        case 'appointment':
          if (intent.entities.urgent) {
            response = intent.language === 'wolof' 
              ? "Urgent la. Dama di jox dokotoor bi nekk. Dem fi ak 30 minute."
              : intent.language === 'pulaar'
              ? "Gaawɗo. Mi waylii dokotoor. Yahra haa 30 minute."
              : "C'est urgent. Je contacte un médecin disponible. Allez-y dans 30 minutes.";
          } else {
            response = intent.language === 'wolof'
              ? "Déedéet, RDV nga bëgg. Kan dokotoor nga bëgg jàng ?"
              : intent.language === 'pulaar'
              ? "Eey, takkuure. Hol dokotoor ɗon ngoo-ɗa yiɗi ?"
              : "D'accord pour le rendez-vous. Quel médecin souhaitez-vous voir ?";
          }
          break;
          
        case 'prescription':
          response = intent.language === 'wolof'
            ? "Sama farmaasi yi, dama di jox leen. Pharmacie bi am na leen."
            : intent.language === 'pulaar'
            ? "Leɗɗe maa, mi jeyaa. Farmaaji wi heɓi ɗee."
            : "Vos médicaments, je vérifie. La pharmacie les a en stock.";
          break;
          
        case 'emergency':
          response = intent.language === 'wolof'
            ? "URGENT ! Télé 15 wala dem ci clinique bi gaaw gaaw !"
            : intent.language === 'pulaar'
            ? "GAAWƊO ! Noddu 15 walla yahra spital suudu-ɗo !"
            : "URGENCE ! Appelez le 15 ou allez immédiatement à l'hôpital !";
          break;
          
        case 'results':
          response = intent.language === 'wolof'
            ? "Sama résultat yi, dama di wër. Bees laa gis."
            : intent.language === 'pulaar'
            ? "Jilluɓe maa, mi jiyii. Hesere e ɗoo."
            : "Vos résultats, je regarde. Il y a du nouveau.";
          break;
          
        default:
          response = service.getPhrase('help');
      }
      
      await speak(response);
      return response;
      
    } catch (error) {
      const errorResponse = service.getPhrase('notUnderstood');
      await speak(errorResponse);
      throw error;
    }
  }, [speak]);

  const greet = useCallback(async () => {
    const greeting = voiceService.current.getPhrase('greeting');
    await speak(greeting);
  }, [speak]);

  const getQuickCommands = useCallback(() => {
    const lang = state.currentLanguage;
    
    switch (lang) {
      case 'wolof':
        return [
          { text: 'Dama bëgg RDV', action: 'appointment' },
          { text: 'Sama médicament', action: 'prescription' },
          { text: 'Urgent !', action: 'emergency' },
          { text: 'Jàrëm', action: 'help' }
        ];
        
      case 'pulaar':
        return [
          { text: 'Mi yiɗi takkuure', action: 'appointment' },
          { text: 'Leɗɗe am', action: 'prescription' },
          { text: 'Gaawɗo !', action: 'emergency' },
          { text: 'Wallu-mi', action: 'help' }
        ];
        
      case 'serere':
        return [
          { text: 'Madda bëgg RDV', action: 'appointment' },
          { text: 'Sama yaram', action: 'prescription' },
          { text: 'Urgent !', action: 'emergency' },
          { text: 'Jàrëm', action: 'help' }
        ];
        
      case 'diola':
        return [
          { text: 'Emmita RDV', action: 'appointment' },
          { text: 'Sama yaram', action: 'prescription' },
          { text: 'Urgent !', action: 'emergency' },
          { text: 'Jàrëm', action: 'help' }
        ];
        
      default:
        return [
          { text: 'Prendre RDV', action: 'appointment' },
          { text: 'Mes médicaments', action: 'prescription' },
          { text: 'Urgence !', action: 'emergency' },
          { text: 'Aide', action: 'help' }
        ];
    }
  }, [state.currentLanguage]);

  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  const clearTranscript = useCallback(() => {
    updateState({ currentTranscript: '', lastIntent: null });
  }, [updateState]);

  return {
    ...state,
    setLanguage,
    startListening,
    stopListening,
    speak,
    respondToIntent,
    greet,
    getQuickCommands,
    clearError,
    clearTranscript,
    supportedLanguages: voiceService.current.getSupportedLanguages()
  };
};