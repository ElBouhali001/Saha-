// Service ElevenLabs pour synthèse vocale contextuelle africaine
interface ElevenLabsVoice {
  id: string;
  name: string;
  description: string;
  language: string;
  accent: string;
}

// Voix sélectionnées pour contexte africain/sénégalais
export const AFRICAN_VOICES: Record<string, ElevenLabsVoice> = {
  // Voix féminines avec accent africain
  femaleAfrican1: {
    id: 'EXAVITQu4vr4xnSDxMaL', // Sarah - voix douce et claire
    name: 'Maimouna',
    description: 'Voix féminine chaleureuse, accent africain francophone',
    language: 'fr',
    accent: 'african'
  },
  femaleAfrican2: {
    id: 'XB0fDUnXU5powFXDhCwa', // Charlotte - voix expressive
    name: 'Maimouna',
    description: 'Voix féminine expressive, contexte sénégalais',
    language: 'fr',
    accent: 'senegalese'
  },
  
  // Voix masculines avec accent africain
  maleAfrican1: {
    id: 'TX3LPaxmHKxFdv7VOQHJ', // Liam - voix profonde
    name: 'Ibrahima',
    description: 'Voix masculine rassurante, accent africain',
    language: 'fr',
    accent: 'african'
  },
  maleAfrican2: {
    id: 'onwK4e9ZLuTAKqWW03F9', // Daniel - voix claire
    name: 'Ibrahima',
    description: 'Voix masculine claire, contexte ouest-africain',
    language: 'fr',
    accent: 'west_african'
  }
};

// Configuration par langue avec voix appropriées
export const LANGUAGE_VOICE_CONFIG = {
  wolof: {
    primary: AFRICAN_VOICES.femaleAfrican2, // Maimouna pour Wolof
    secondary: AFRICAN_VOICES.maleAfrican1,
    model: 'eleven_multilingual_v2'
  },
  pulaar: {
    primary: AFRICAN_VOICES.femaleAfrican1, // Maimouna pour Pulaar
    secondary: AFRICAN_VOICES.maleAfrican2,
    model: 'eleven_multilingual_v2'
  },
  serere: {
    primary: AFRICAN_VOICES.femaleAfrican2,
    secondary: AFRICAN_VOICES.maleAfrican1,
    model: 'eleven_multilingual_v2'
  },
  diola: {
    primary: AFRICAN_VOICES.femaleAfrican1,
    secondary: AFRICAN_VOICES.maleAfrican2,
    model: 'eleven_multilingual_v2'
  },
  francais: {
    primary: AFRICAN_VOICES.femaleAfrican2, // Accent sénégalais pour le français
    secondary: AFRICAN_VOICES.maleAfrican1,
    model: 'eleven_multilingual_v2'
  }
};

export class ElevenLabsVoiceService {
  private apiKey: string;
  private baseUrl = 'https://api.elevenlabs.io/v1';
  private currentLanguage = 'francais';
  private genderPreference: 'female' | 'male' = 'female';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  setLanguage(language: string) {
    this.currentLanguage = language;
  }

  setGenderPreference(gender: 'female' | 'male') {
    this.genderPreference = gender;
  }

  private getVoiceConfig() {
    const config = LANGUAGE_VOICE_CONFIG[this.currentLanguage] || LANGUAGE_VOICE_CONFIG.francais;
    return this.genderPreference === 'female' ? config.primary : config.secondary;
  }

  async synthesizeText(text: string): Promise<ArrayBuffer> {
    const voiceConfig = this.getVoiceConfig();
    const model = LANGUAGE_VOICE_CONFIG[this.currentLanguage]?.model || 'eleven_multilingual_v2';

    // Adapter le texte selon la langue pour une prononciation plus naturelle
    const adaptedText = this.adaptTextForLanguage(text);

    const response = await fetch(`${this.baseUrl}/text-to-speech/${voiceConfig.id}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': this.apiKey
      },
      body: JSON.stringify({
        text: adaptedText,
        model_id: model,
        voice_settings: {
          stability: 0.75, // Stabilité élevée pour clarté
          similarity_boost: 0.85, // Similarité pour cohérence
          style: 0.2, // Style léger pour naturel
          use_speaker_boost: true
        },
        pronunciation_dictionary_locators: this.getPronunciationRules()
      })
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    return await response.arrayBuffer();
  }

  private adaptTextForLanguage(text: string): string {
    // Adaptations pour une meilleure prononciation selon la langue
    let adaptedText = text;

    switch (this.currentLanguage) {
      case 'wolof':
        // Adapter la prononciation des mots wolof
        adaptedText = adaptedText
          .replace(/ë/g, 'eu')
          .replace(/ñ/g, 'gn')
          .replace(/ng/g, 'n-g');
        break;
        
      case 'pulaar':
        // Adapter la prononciation du pulaar
        adaptedText = adaptedText
          .replace(/ɓ/g, 'b')
          .replace(/ɗ/g, 'd')
          .replace(/ñ/g, 'gn');
        break;
        
      case 'francais':
        // Ajouter des pauses naturelles en français sénégalais
        adaptedText = adaptedText
          .replace(/\./g, '... ')
          .replace(/!/g, ' !!')
          .replace(/\?/g, ' ??');
        break;
    }

    return adaptedText;
  }

  private getPronunciationRules() {
    // Règles de prononciation spécifiques aux langues sénégalaises
    const rules = {
      wolof: [
        { word: 'xol', pronunciation: 'khol' },
        { word: 'bët', pronunciation: 'beut' },
        { word: 'wërumaa', pronunciation: 'weurou-maa' }
      ],
      pulaar: [
        { word: 'hoore', pronunciation: 'hoo-ré' },
        { word: 'njuɓɓu', pronunciation: 'njou-bou' }
      ]
    };

    return rules[this.currentLanguage] || [];
  }

  async playAudio(audioBuffer: ArrayBuffer): Promise<void> {
    return new Promise((resolve, reject) => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      audioContext.decodeAudioData(audioBuffer)
        .then(decodedData => {
          const source = audioContext.createBufferSource();
          source.buffer = decodedData;
          source.connect(audioContext.destination);
          
          source.onended = () => resolve();
          source.start();
        })
        .catch(reject);
    });
  }

  async speak(text: string): Promise<void> {
    try {
      const audioBuffer = await this.synthesizeText(text);
      await this.playAudio(audioBuffer);
    } catch (error) {
      console.error('Erreur ElevenLabs:', error);
      throw error;
    }
  }

  // Méthode pour tester différentes voix
  async testVoice(voiceId: string, text: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': this.apiKey
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.75,
          similarity_boost: 0.85
        }
      })
    });

    if (response.ok) {
      const audioBuffer = await response.arrayBuffer();
      await this.playAudio(audioBuffer);
    }
  }

  getAvailableVoices() {
    return AFRICAN_VOICES;
  }

  getCurrentVoiceInfo() {
    return this.getVoiceConfig();
  }
}