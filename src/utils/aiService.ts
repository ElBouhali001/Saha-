
import { generateSecureToken } from './security';

export interface DiagnosticSuggestion {
  condition: string;
  probability: number;
  symptoms: string[];
  additionalTests?: string[];
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface TreatmentSuggestion {
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  contraindications: string[];
  interactions: string[];
  alternatives: string[];
}

export interface DrugInteraction {
  drug1: string;
  drug2: string;
  severity: 'minor' | 'moderate' | 'major';
  description: string;
  recommendation: string;
}

class AIService {
  private apiKey: string = '';
  private baseUrl: string = '';

  setApiKey(key: string) {
    this.apiKey = key;
  }

  async getDiagnosticSuggestions(symptoms: string, patientAge: number, patientGender: 'M' | 'F'): Promise<DiagnosticSuggestion[]> {
    if (!this.apiKey) {
      // Mock data for demonstration
      return this.getMockDiagnosticSuggestions(symptoms);
    }

    try {
      const response = await fetch('/api/ai/diagnostic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          symptoms,
          patientAge,
          patientGender,
          requestId: generateSecureToken()
        })
      });

      if (!response.ok) {
        throw new Error('Erreur API IA');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur diagnostic IA:', error);
      return this.getMockDiagnosticSuggestions(symptoms);
    }
  }

  async getTreatmentSuggestions(diagnosis: string, patientProfile: any): Promise<TreatmentSuggestion[]> {
    if (!this.apiKey) {
      return this.getMockTreatmentSuggestions(diagnosis);
    }

    try {
      const response = await fetch('/api/ai/treatment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          diagnosis,
          patientProfile,
          requestId: generateSecureToken()
        })
      });

      if (!response.ok) {
        throw new Error('Erreur API IA');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur traitement IA:', error);
      return this.getMockTreatmentSuggestions(diagnosis);
    }
  }

  async checkDrugInteractions(medications: string[]): Promise<DrugInteraction[]> {
    if (medications.length < 2) return [];

    if (!this.apiKey) {
      return this.getMockDrugInteractions(medications);
    }

    try {
      const response = await fetch('/api/ai/interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          medications,
          requestId: generateSecureToken()
        })
      });

      if (!response.ok) {
        throw new Error('Erreur API IA');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur interactions IA:', error);
      return this.getMockDrugInteractions(medications);
    }
  }

  private getMockDiagnosticSuggestions(symptoms: string): DiagnosticSuggestion[] {
    const lowerSymptoms = symptoms.toLowerCase();
    
    if (lowerSymptoms.includes('fièvre') && lowerSymptoms.includes('toux')) {
      return [
        {
          condition: 'Infection respiratoire haute',
          probability: 0.75,
          symptoms: ['fièvre', 'toux', 'mal de gorge'],
          additionalTests: ['Test COVID-19', 'Radiographie thoracique'],
          urgencyLevel: 'medium'
        },
        {
          condition: 'Grippe saisonnière',
          probability: 0.65,
          symptoms: ['fièvre', 'toux', 'courbatures'],
          additionalTests: ['Test antigénique'],
          urgencyLevel: 'low'
        }
      ];
    }

    if (lowerSymptoms.includes('douleur') && lowerSymptoms.includes('abdomen')) {
      return [
        {
          condition: 'Gastrite',
          probability: 0.60,
          symptoms: ['douleur abdominale', 'nausées'],
          additionalTests: ['Échographie abdominale'],
          urgencyLevel: 'medium'
        }
      ];
    }

    return [
      {
        condition: 'Évaluation clinique nécessaire',
        probability: 0.50,
        symptoms: [symptoms],
        additionalTests: ['Examen clinique complet'],
        urgencyLevel: 'medium'
      }
    ];
  }

  private getMockTreatmentSuggestions(diagnosis: string): TreatmentSuggestion[] {
    const lowerDiagnosis = diagnosis.toLowerCase();

    if (lowerDiagnosis.includes('infection respiratoire')) {
      return [
        {
          medication: 'Amoxicilline',
          dosage: '500mg',
          frequency: '3 fois par jour',
          duration: '7 jours',
          contraindications: ['Allergie pénicilline'],
          interactions: ['Warfarine'],
          alternatives: ['Azithromycine', 'Cefixime']
        },
        {
          medication: 'Paracétamol',
          dosage: '1g',
          frequency: '3 fois par jour',
          duration: '5 jours',
          contraindications: ['Insuffisance hépatique'],
          interactions: ['Warfarine'],
          alternatives: ['Ibuprofène']
        }
      ];
    }

    return [
      {
        medication: 'Traitement symptomatique',
        dosage: 'Selon prescription',
        frequency: 'Selon prescription',
        duration: 'Selon évolution',
        contraindications: [],
        interactions: [],
        alternatives: []
      }
    ];
  }

  private getMockDrugInteractions(medications: string[]): DrugInteraction[] {
    const interactions: DrugInteraction[] = [];

    if (medications.includes('Warfarine') && medications.includes('Amoxicilline')) {
      interactions.push({
        drug1: 'Warfarine',
        drug2: 'Amoxicilline',
        severity: 'moderate',
        description: 'Risque d\'augmentation de l\'effet anticoagulant',
        recommendation: 'Surveillance INR renforcée'
      });
    }

    if (medications.includes('Paracétamol') && medications.includes('Warfarine')) {
      interactions.push({
        drug1: 'Paracétamol',
        drug2: 'Warfarine',
        severity: 'minor',
        description: 'Augmentation possible de l\'effet anticoagulant à forte dose',
        recommendation: 'Limiter la dose de paracétamol'
      });
    }

    return interactions;
  }
}

export const aiService = new AIService();
