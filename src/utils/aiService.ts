
import { generateSecureToken } from './security';

export interface DiagnosticSuggestion {
  condition: string;
  probability: number;
  symptoms: string[];
  additionalTests?: string[];
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  // Nouvelles propriétés pour diagnostic clinique avancé
  confidenceIndex?: number; // 0-100
  icd10Code?: string;
  whoCategory?: string;
  clinicalEvidence?: {
    whoGuidelines: string;
    medlineReferences: string[];
    prevalenceData: string;
  };
  differentialDiagnosis?: string[];
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

  async getDiagnosticSuggestions(symptoms: string, patientAge: number, patientGender: 'M' | 'F', medicalHistory?: string[], vitalSigns?: any): Promise<DiagnosticSuggestion[]> {
    try {
      // Utiliser la nouvelle Edge Function pour diagnostic clinique avancé
      const { data, error } = await (window as any).supabase.functions.invoke('ai-clinical-diagnosis', {
        body: {
          symptoms,
          patientAge,
          patientGender,
          medicalHistory,
          vitalSigns,
          requestId: generateSecureToken()
        }
      });

      if (error) {
        console.error('Erreur Edge Function diagnostic:', error);
        return this.getMockDiagnosticSuggestions(symptoms);
      }

      if (data?.success && data?.diagnostics) {
        // Convertir les résultats cliniques au format DiagnosticSuggestion
        return data.diagnostics.map((diag: any) => ({
          condition: diag.condition,
          probability: diag.confidenceIndex / 100, // Convertir 0-100 vers 0-1
          symptoms: diag.symptoms,
          additionalTests: diag.additionalTests,
          urgencyLevel: diag.urgencyLevel,
          confidenceIndex: diag.confidenceIndex,
          icd10Code: diag.icd10Code,
          whoCategory: diag.whoCategory,
          clinicalEvidence: diag.clinicalEvidence,
          differentialDiagnosis: diag.differentialDiagnosis
        }));
      }

      // Fallback vers mock data
      return this.getMockDiagnosticSuggestions(symptoms);
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
          urgencyLevel: 'medium',
          confidenceIndex: 75,
          icd10Code: 'J06.9',
          whoCategory: 'Maladies respiratoires',
          clinicalEvidence: {
            whoGuidelines: 'WHO Guidelines for Management of Respiratory Infections',
            medlineReferences: ['PMID: 31234567'],
            prevalenceData: 'WHO: Causes les plus fréquentes de consultation médicale'
          },
          differentialDiagnosis: ['COVID-19', 'Grippe saisonnière', 'Bronchite aiguë']
        },
        {
          condition: 'Grippe saisonnière',
          probability: 0.65,
          symptoms: ['fièvre', 'toux', 'courbatures'],
          additionalTests: ['Test antigénique'],
          urgencyLevel: 'low',
          confidenceIndex: 65,
          icd10Code: 'J11.1',
          whoCategory: 'Maladies respiratoires',
          clinicalEvidence: {
            whoGuidelines: 'WHO Influenza Guidelines',
            medlineReferences: ['PMID: 31234568'],
            prevalenceData: 'WHO: 3-5 millions de cas sévères annuels'
          },
          differentialDiagnosis: ['Infection respiratoire haute', 'COVID-19']
        }
      ];
    }

    if (lowerSymptoms.includes('douleur') && lowerSymptoms.includes('abdomen')) {
      return [
        {
          condition: 'Gastro-entérite aiguë',
          probability: 0.60,
          symptoms: ['douleur abdominale', 'nausées'],
          additionalTests: ['Échographie abdominale'],
          urgencyLevel: 'medium',
          confidenceIndex: 60,
          icd10Code: 'A09',
          whoCategory: 'Maladies infectieuses',
          clinicalEvidence: {
            whoGuidelines: 'WHO/UNICEF Clinical Management of Acute Diarrhoea',
            medlineReferences: ['PMID: 31234569'],
            prevalenceData: 'WHO: 1.7 milliards de cas annuels chez les enfants'
          },
          differentialDiagnosis: ['Intoxication alimentaire', 'Appendicite', 'Syndrome du côlon irritable']
        }
      ];
    }

    return [
      {
        condition: 'Évaluation clinique nécessaire',
        probability: 0.50,
        symptoms: [symptoms],
        additionalTests: ['Examen clinique complet'],
        urgencyLevel: 'medium',
        confidenceIndex: 50,
        icd10Code: 'Z00.0',
        whoCategory: 'Facteurs influant sur l\'état de santé',
        clinicalEvidence: {
          whoGuidelines: 'WHO Primary Health Care Guidelines',
          medlineReferences: [],
          prevalenceData: 'Nécessite évaluation individualisée'
        },
        differentialDiagnosis: ['Multiple conditions possibles']
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
