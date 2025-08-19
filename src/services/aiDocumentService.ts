import { supabase } from '@/integrations/supabase/client';

export interface PatientData {
  id: string;
  name: string;
  dateOfBirth: string;
  gender: string;
  allergies?: string[];
  chronicConditions?: string[];
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export interface ConsultationData {
  id: string;
  patientId: string;
  consultationDate: string;
  symptoms: string;
  diagnosis: string;
  treatmentPlan: string;
  vitals?: {
    temperature?: number;
    bloodPressure?: string;
    heartRate?: number;
    respiratoryRate?: number;
  };
  doctorName: string;
  doctorSpecialty: string;
}

export interface DocumentGenerationRequest {
  documentType: 'consultation_report' | 'discharge_summary' | 'referral_letter' | 'medical_certificate' | 'prescription_note' | 'care_plan';
  patientData: PatientData;
  consultationData: ConsultationData;
  additionalData?: {
    referralSpecialty?: string;
    referralReason?: string;
    certificateType?: string;
    workRestrictions?: string;
    careGoals?: string[];
  };
  language?: 'fr' | 'en';
  tone?: 'professional' | 'compassionate' | 'clinical' | 'detailed';
  customInstructions?: string;
}

export interface DocumentGenerationResponse {
  success: boolean;
  content?: string;
  error?: string;
  metadata?: {
    documentType: string;
    patientId: string;
    consultationId: string;
    generatedAt: string;
  };
}

export class AIDocumentService {
  
  /**
   * Génère un document médical en utilisant l'IA
   */
  static async generateDocument(request: DocumentGenerationRequest): Promise<DocumentGenerationResponse> {
    try {
      console.log('Generating document with AI:', request.documentType);
      
      const { data, error } = await supabase.functions.invoke('generate-medical-document', {
        body: request
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Erreur lors de la génération du document');
      }

      return data as DocumentGenerationResponse;
      
    } catch (error) {
      console.error('Document generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue lors de la génération'
      };
    }
  }

  /**
   * Génère automatiquement le contenu d'une section spécifique d'un document
   */
  static async generateSection(
    sectionType: string,
    patientData: PatientData,
    consultationData: ConsultationData,
    context?: string
  ): Promise<{ success: boolean; content?: string; error?: string }> {
    
    const sectionPrompts = {
      chief_complaint: `Rédigez le motif de consultation basé sur: ${consultationData.symptoms}`,
      history: `Rédigez l'anamnèse du patient incluant les antécédents médicaux et l'histoire de la maladie actuelle`,
      examination: `Rédigez les résultats de l'examen clinique basé sur les signes vitaux et observations`,
      diagnosis: `Formulez le diagnostic médical: ${consultationData.diagnosis}`,
      treatment: `Détaillez le plan de traitement: ${consultationData.treatmentPlan}`,
      follow_up: `Rédigez les recommandations de suivi médical`,
      prescription: `Rédigez l'ordonnance médicale détaillée`,
      recommendations: `Formulez les recommandations et conseils au patient`
    };

    const customRequest: DocumentGenerationRequest = {
      documentType: 'consultation_report',
      patientData,
      consultationData,
      tone: 'professional',
      language: 'fr',
      customInstructions: `Générez uniquement la section "${sectionType}" du document. ${sectionPrompts[sectionType as keyof typeof sectionPrompts] || ''} ${context || ''}`
    };

    return await this.generateDocument(customRequest);
  }

  /**
   * Génère des suggestions de contenu pour améliorer un document existant
   */
  static async generateSuggestions(
    currentContent: string,
    documentType: string,
    patientData: PatientData,
    consultationData: ConsultationData
  ): Promise<{ success: boolean; suggestions?: string[]; error?: string }> {
    
    const request: DocumentGenerationRequest = {
      documentType: documentType as any,
      patientData,
      consultationData,
      tone: 'professional',
      language: 'fr',
      customInstructions: `Analysez le contenu existant et proposez 3-5 améliorations spécifiques sous forme de liste. Contenu actuel: ${currentContent}`
    };

    const response = await this.generateDocument(request);
    
    if (response.success && response.content) {
      // Extraire les suggestions du contenu généré
      const suggestions = response.content
        .split('\n')
        .filter(line => line.trim().startsWith('-') || line.trim().startsWith('•'))
        .map(line => line.replace(/^[-•]\s*/, '').trim())
        .filter(suggestion => suggestion.length > 0);
      
      return {
        success: true,
        suggestions
      };
    }
    
    return response;
  }

  /**
   * Adapte le contenu d'un document selon le public cible
   */
  static async adaptForAudience(
    content: string,
    audience: 'patient' | 'specialist' | 'insurance' | 'administration',
    patientData: PatientData,
    consultationData: ConsultationData
  ): Promise<{ success: boolean; content?: string; error?: string }> {
    
    const audienceInstructions = {
      patient: 'Adaptez le langage pour être compréhensible par le patient, évitez le jargon médical complexe',
      specialist: 'Utilisez la terminologie médicale précise et détaillez les aspects techniques',
      insurance: 'Mettez l\'accent sur les éléments nécessaires pour les remboursements et justifications',
      administration: 'Respectez les formats administratifs et incluez tous les éléments réglementaires'
    };

    const request: DocumentGenerationRequest = {
      documentType: 'consultation_report',
      patientData,
      consultationData,
      tone: audience === 'patient' ? 'compassionate' : 'professional',
      language: 'fr',
      customInstructions: `Adaptez le contenu suivant pour ${audience}: ${audienceInstructions[audience]}. Contenu original: ${content}`
    };

    return await this.generateDocument(request);
  }

  /**
   * Vérifie la qualité et la complétude d'un document
   */
  static async validateDocument(
    content: string,
    documentType: string,
    patientData: PatientData,
    consultationData: ConsultationData
  ): Promise<{ 
    success: boolean; 
    isValid?: boolean; 
    issues?: string[]; 
    score?: number; 
    error?: string 
  }> {
    
    const request: DocumentGenerationRequest = {
      documentType: documentType as any,
      patientData,
      consultationData,
      tone: 'clinical',
      language: 'fr',
      customInstructions: `Analysez ce document médical et évaluez sa qualité sur 100. Identifiez les éléments manquants ou problématiques. Répondez au format: SCORE: [0-100] | PROBLÈMES: [liste] | VALIDE: [oui/non]. Document: ${content}`
    };

    const response = await this.generateDocument(request);
    
    if (response.success && response.content) {
      try {
        // Parser la réponse structurée
        const scoreMatch = response.content.match(/SCORE:\s*(\d+)/);
        const problemsMatch = response.content.match(/PROBLÈMES:\s*(.+?)(?=\s*\|\s*VALIDE:|$)/s);
        const validMatch = response.content.match(/VALIDE:\s*(oui|non)/i);
        
        const score = scoreMatch ? parseInt(scoreMatch[1]) : 0;
        const isValid = validMatch ? validMatch[1].toLowerCase() === 'oui' : false;
        const issues = problemsMatch ? 
          problemsMatch[1].split(/[,;-]/).map(issue => issue.trim()).filter(issue => issue.length > 0) : 
          [];

        return {
          success: true,
          isValid,
          issues,
          score
        };
      } catch (parseError) {
        console.error('Error parsing validation response:', parseError);
        return {
          success: false,
          error: 'Erreur lors de l\'analyse de la validation'
        };
      }
    }
    
    return response;
  }
}