// Service de reconnaissance et synthèse vocale multilingue avec ElevenLabs
import { ElevenLabsVoiceService } from './elevenLabsVoiceService';

export interface SupportedLanguage {
  code: string;
  nom: string;
  population: string;
  activated: boolean;
}

export const LANGUES_SUPPORTEES: Record<string, SupportedLanguage> = {
  wolof: {
    code: 'wo-SN',
    nom: 'Wolof',
    population: '40% Sénégal',
    activated: true
  },
  pulaar: {
    code: 'ff-SN', 
    nom: 'Pulaar/Peul',
    population: '25% Sénégal',
    activated: true
  },
  serere: {
    code: 'sr-SN',
    nom: 'Sérère', 
    population: '15% Sénégal',
    activated: true
  },
  diola: {
    code: 'dyo-SN',
    nom: 'Diola/Joola',
    population: '5% Sénégal',
    activated: true
  },
  francais: {
    code: 'fr-SN',
    nom: 'Français',
    population: 'Officielle',
    activated: true
  }
};

// Dictionnaire médical contextuel multilingue
export const DICTIONNAIRE_MEDICAL = {
  wolof: {
    'rendez-vous': ['RDV', 'takkuure', 'jàngale', 'ñene'],
    'docteur': ['dokotoor', 'jabathakat', 'médecin'],
    'médicament': ['farmaasi', 'yaram', 'médicament'],
    'maladie': ['feebar', 'jëf', 'maladie'],
    'douleur': ['metit', 'sax', 'douleur'],
    'cœur': ['xol', 'kalbi'],
    'tête': ['bët', 'kaw'],
    'ventre': ['biir', 'ventre'],
    'urgent': ['urgent', 'gaaw', 'suuf'],
    'prendre': ['jël', 'am'],
    'voir': ['gis', 'wër'],
    'parler': ['wax', 'dale']
  },
  pulaar: {
    'rendez-vous': ['takkuure', 'jokkondiral'],
    'docteur': ['dokotoor', 'jawlo'],
    'médicament': ['leɗɗe', 'farmaaji'],
    'maladie': ['jawdi', 'majji'],
    'douleur': ['ɓernde', 'saabu'],
    'cœur': ['njuɓɓu', 'kalbu'],
    'tête': ['hoore', 'tête'],
    'ventre': ['njide', 'bide'],
    'urgent': ['gaawɗo', 'tellin'],
    'prendre': ['waɗde', 'heɓde'],
    'voir': ['jiyude', 'ñeenude'],
    'parler': ['haalinde', 'wiyyde']
  },
  serere: {
    'rendez-vous': ['RDV', 'jàng', 'dox'],
    'docteur': ['dokotoor', 'jabathakat'],
    'médicament': ['medicament', 'yaram'],
    'maladie': ['feebar', 'jëf'],
    'douleur': ['metit', 'sax'],
    'cœur': ['xol', 'kalbi'],
    'tête': ['bët'],
    'ventre': ['biir'],
    'urgent': ['urgent', 'gaaw'],
    'prendre': ['jël'],
    'voir': ['wër'],
    'parler': ['wax']
  },
  diola: {
    'rendez-vous': ['RDV', 'bakaal'],
    'docteur': ['dokotoor', 'jabaat'],
    'médicament': ['yaram', 'sirop'],
    'maladie': ['feebar'],
    'douleur': ['ajan'],
    'cœur': ['xol'],
    'tête': ['abul'],
    'ventre': ['odiom'],
    'urgent': ['urgent'],
    'prendre': ['am'],
    'voir': ['ñek'],
    'parler': ['kajaale']
  },
  francais: {
    'rendez-vous': ['rendez-vous', 'RDV', 'consultation'],
    'docteur': ['docteur', 'médecin', 'praticien'],
    'médicament': ['médicament', 'remède', 'traitement'],
    'maladie': ['maladie', 'pathologie', 'trouble'],
    'douleur': ['douleur', 'mal', 'souffrance'],
    'cœur': ['cœur', 'cardiaque'],
    'tête': ['tête', 'crâne'],
    'ventre': ['ventre', 'abdomen'],
    'urgent': ['urgent', 'prioritaire', 'immédiat'],
    'prendre': ['prendre', 'réserver'],
    'voir': ['voir', 'consulter'],
    'parler': ['parler', 'contacter']
  }
};

// Phrases de base par langue
export const PHRASES_BASE = {
  wolof: {
    greeting: "Na nga def ? Dama def Assistant MediPatient. Man naa ko bëgg a dimi ?",
    understood: "Déedéet, dëgg naa",
    notUnderstood: "Baldema, dëgguma. Wax ko gën ?",
    processing: "Dama jëkk...",
    goodbye: "Ci kanam !",
    help: "Kon sax nga bëgg ?"
  },
  pulaar: {
    greeting: "No feeñi ? Mi woni Assistant MediPatient. Hol ko mi maayi ma ?",
    understood: "Eey, mi añi",
    notUnderstood: "Njaafoore, mi añaani. Haala gootum ?",
    processing: "Mi ɓokki...",
    goodbye: "Tawi hakkille !",
    help: "Ko ɗon mi wallu-ɗaa ?"
  },
  serere: {
    greeting: "No dem ? Man Assistant MediPatient laa. Kon a bëgg ?",
    understood: "Waaw, dëgg naa",
    notUnderstood: "Sama bal, dëgguma. Wax ko ci benn mët ?",
    processing: "Dama jëkk...",
    goodbye: "Ba ci kanam !",
    help: "Lan laa mën a def ?"
  },
  diola: {
    greeting: "Kajimaat ? Emmit Assistant MediPatient. Aniou a bukabaai ?",
    understood: "Enau, ejong naa",
    notUnderstood: "Asaamaye, ejonguma. Kajal keren ?",
    processing: "Ejeke...",
    goodbye: "Kusukusu !",
    help: "Aniou emmen a def ?"
  },
  francais: {
    greeting: "Bonjour ! Je suis l'Assistant MediPatient. Comment puis-je vous aider ?",
    understood: "D'accord, j'ai compris",
    notUnderstood: "Excusez-moi, je n'ai pas compris. Pouvez-vous répéter ?",
    processing: "Je réfléchis...",
    goodbye: "Au revoir et bonne santé !",
    help: "Que puis-je faire pour vous ?"
  }
};

export interface VoiceIntent {
  type: 'appointment' | 'prescription' | 'results' | 'emergency' | 'navigation' | 'help';
  confidence: number;
  entities: Record<string, any>;
  language: string;
}

export class VoiceService {
  private recognition: any = null;
  private synthesis: SpeechSynthesis | null = null;
  private elevenLabsService: ElevenLabsVoiceService | null = null;
  private currentLanguage: string = 'francais';
  private isListening: boolean = false;
  private useElevenLabs: boolean = false;

  constructor() {
    this.initializeServices();
    this.initializeElevenLabs();
  }

  private initializeServices() {
    // Initialiser la reconnaissance vocale
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 3;
    }

    // Initialiser la synthèse vocale (fallback)
    if ('speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
    }
  }

  private initializeElevenLabs() {
    // Vérifier si la clé API ElevenLabs est disponible
    const apiKey = this.getElevenLabsApiKey();
    if (apiKey) {
      this.elevenLabsService = new ElevenLabsVoiceService(apiKey);
      this.useElevenLabs = true;
      console.log('ElevenLabs activé pour une voix naturelle africaine');
    } else {
      console.log('ElevenLabs non disponible, utilisation de la synthèse navigateur');
    }
  }

  private getElevenLabsApiKey(): string | null {
    // Récupérer la clé depuis le stockage local
    return localStorage.getItem('elevenlabs_api_key') || null;
  }

  setLanguage(language: string) {
    this.currentLanguage = language;
    if (this.recognition) {
      const langCode = LANGUES_SUPPORTEES[language]?.code || 'fr-FR';
      this.recognition.lang = langCode;
    }
    if (this.elevenLabsService) {
      this.elevenLabsService.setLanguage(language);
    }
  }

  async startListening(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Reconnaissance vocale non supportée'));
        return;
      }

      this.isListening = true;
      let finalTranscript = '';

      this.recognition.onresult = (event) => {
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        resolve(finalTranscript);
      };

      this.recognition.onerror = (event) => {
        this.isListening = false;
        reject(new Error(`Erreur reconnaissance: ${event.error}`));
      };

      this.recognition.start();
    });
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  async speak(text: string): Promise<void> {
    // Priorité à ElevenLabs pour une voix naturelle africaine
    if (this.useElevenLabs && this.elevenLabsService) {
      try {
        await this.elevenLabsService.speak(text);
        return;
      } catch (error) {
        console.error('Erreur ElevenLabs, fallback vers synthèse navigateur:', error);
        // Continuer avec la synthèse du navigateur en cas d'erreur
      }
    }

    // Fallback vers synthèse vocale du navigateur
    return this.speakWithBrowserSynthesis(text);
  }

  private async speakWithBrowserSynthesis(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error('Synthèse vocale non supportée'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = LANGUES_SUPPORTEES[this.currentLanguage]?.code || 'fr-FR';
      utterance.rate = 0.85; // Plus lent pour clarté avec accent africain
      utterance.pitch = 1.1; // Légèrement plus aigu pour chaleur
      utterance.volume = 1.0;

      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(new Error(`Erreur synthèse: ${event.error}`));

      this.synthesis.speak(utterance);
    });
  }

  analyzeIntent(transcript: string): VoiceIntent {
    const normalizedText = transcript.toLowerCase();
    const dict = DICTIONNAIRE_MEDICAL[this.currentLanguage] || DICTIONNAIRE_MEDICAL.francais;
    
    let maxScore = 0;
    let detectedIntent: VoiceIntent['type'] = 'help';
    const entities: Record<string, any> = {};

    // Détecter l'intention de rendez-vous
    if (this.containsKeywords(normalizedText, dict['rendez-vous'])) {
      const score = this.calculateKeywordScore(normalizedText, dict['rendez-vous']);
      if (score > maxScore) {
        maxScore = score;
        detectedIntent = 'appointment';
      }
    }

    // Détecter l'intention ordonnance
    if (this.containsKeywords(normalizedText, dict['médicament'])) {
      const score = this.calculateKeywordScore(normalizedText, dict['médicament']);
      if (score > maxScore) {
        maxScore = score;
        detectedIntent = 'prescription';
      }
    }

    // Détecter urgence
    if (this.containsKeywords(normalizedText, dict['urgent'])) {
      entities.urgent = true;
      detectedIntent = 'emergency';
      maxScore = Math.max(maxScore, 0.9);
    }

    // Détecter parties du corps
    for (const [bodyPart, keywords] of Object.entries(dict)) {
      if (['cœur', 'tête', 'ventre'].includes(bodyPart)) {
        if (Array.isArray(keywords) && this.containsKeywords(normalizedText, keywords)) {
          entities.bodyPart = bodyPart;
        }
      }
    }

    return {
      type: detectedIntent,
      confidence: maxScore,
      entities,
      language: this.currentLanguage
    };
  }

  private containsKeywords(text: string, keywords: string[]): boolean {
    return keywords.some(keyword => text.includes(keyword.toLowerCase()));
  }

  private calculateKeywordScore(text: string, keywords: string[]): number {
    const matches = keywords.filter(keyword => text.includes(keyword.toLowerCase()));
    return matches.length / keywords.length;
  }

  getPhrase(key: keyof typeof PHRASES_BASE.francais): string {
    const phrases = PHRASES_BASE[this.currentLanguage] || PHRASES_BASE.francais;
    return phrases[key] || phrases.help;
  }

  getSupportedLanguages() {
    return LANGUES_SUPPORTEES;
  }

  getCurrentLanguage() {
    return this.currentLanguage;
  }

  isCurrentlyListening() {
    return this.isListening;
  }

  // Méthodes pour ElevenLabs
  setVoiceGender(gender: 'female' | 'male') {
    if (this.elevenLabsService) {
      this.elevenLabsService.setGenderPreference(gender);
    }
  }

  async testAfricanVoice(voiceId: string, text: string) {
    if (this.elevenLabsService) {
      await this.elevenLabsService.testVoice(voiceId, text);
    }
  }

  getVoiceInfo() {
    if (this.elevenLabsService) {
      return {
        provider: 'ElevenLabs',
        voice: this.elevenLabsService.getCurrentVoiceInfo(),
        quality: 'Premium - Voix naturelle africaine'
      };
    }
    return {
      provider: 'Navigateur',
      voice: { name: 'Synthèse système' },
      quality: 'Standard'
    };
  }

  isElevenLabsEnabled() {
    return this.useElevenLabs;
  }
}