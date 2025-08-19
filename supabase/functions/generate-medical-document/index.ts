import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PatientData {
  id: string;
  name: string;
  dateOfBirth: string;
  gender: string;
  allergies?: string[];
  chronicConditions?: string[];
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

interface ConsultationData {
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

interface DocumentRequest {
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

function buildSystemPrompt(request: DocumentRequest): string {
  const { documentType, language = 'fr', tone = 'professional' } = request;
  
  const toneDescriptions = {
    professional: 'professionnel et médical précis',
    compassionate: 'empathique et bienveillant', 
    clinical: 'clinique et factuel',
    detailed: 'détaillé et exhaustif'
  };
  
  const documentDescriptions = {
    consultation_report: 'compte-rendu de consultation médicale complet',
    discharge_summary: 'lettre de sortie d\'hospitalisation avec recommandations',
    referral_letter: 'lettre de référence vers un spécialiste',
    medical_certificate: 'certificat médical pour arrêt de travail ou aptitude',
    prescription_note: 'note d\'ordonnance médicale détaillée',
    care_plan: 'plan de soins personnalisé'
  };

  return `Vous êtes un médecin expert en rédaction de documents médicaux. Générez un ${documentDescriptions[documentType]} en français avec un ton ${toneDescriptions[tone]}.

RÈGLES IMPORTANTES:
- Utilisez un langage médical approprié et professionnel
- Respectez la confidentialité médicale et les standards RGPD
- Incluez tous les éléments requis selon le type de document
- Utilisez la terminologie médicale française correcte
- Structurez le document de manière claire et logique
- Respectez les formats standards des documents médicaux français

FORMAT ATTENDU:
- En-tête avec informations du médecin
- Informations patient complètes
- Corps du document structuré selon le type
- Signature et cachet médical

Le document doit être prêt à être imprimé et utilisé dans un contexte médical professionnel.`;
}

function buildUserPrompt(request: DocumentRequest): string {
  const { patientData, consultationData, additionalData, customInstructions } = request;
  
  let prompt = `Générez le document médical suivant:

INFORMATIONS PATIENT:
- Nom: ${patientData.name}
- Date de naissance: ${patientData.dateOfBirth}
- Sexe: ${patientData.gender}`;

  if (patientData.allergies?.length) {
    prompt += `\n- Allergies: ${patientData.allergies.join(', ')}`;
  }
  
  if (patientData.chronicConditions?.length) {
    prompt += `\n- Antécédents: ${patientData.chronicConditions.join(', ')}`;
  }

  prompt += `\n
CONSULTATION:
- Date: ${consultationData.consultationDate}
- Médecin: Dr. ${consultationData.doctorName} (${consultationData.doctorSpecialty})
- Symptômes: ${consultationData.symptoms}
- Diagnostic: ${consultationData.diagnosis}
- Plan de traitement: ${consultationData.treatmentPlan}`;

  if (consultationData.vitals) {
    prompt += `\n- Signes vitaux: `;
    if (consultationData.vitals.temperature) prompt += `Température: ${consultationData.vitals.temperature}°C, `;
    if (consultationData.vitals.bloodPressure) prompt += `TA: ${consultationData.vitals.bloodPressure}, `;
    if (consultationData.vitals.heartRate) prompt += `FC: ${consultationData.vitals.heartRate} bpm, `;
    if (consultationData.vitals.respiratoryRate) prompt += `FR: ${consultationData.vitals.respiratoryRate}/min`;
  }

  if (additionalData) {
    if (additionalData.referralSpecialty) {
      prompt += `\n- Spécialité de référence: ${additionalData.referralSpecialty}`;
    }
    if (additionalData.referralReason) {
      prompt += `\n- Motif de référence: ${additionalData.referralReason}`;
    }
    if (additionalData.certificateType) {
      prompt += `\n- Type de certificat: ${additionalData.certificateType}`;
    }
    if (additionalData.workRestrictions) {
      prompt += `\n- Restrictions de travail: ${additionalData.workRestrictions}`;
    }
    if (additionalData.careGoals?.length) {
      prompt += `\n- Objectifs de soins: ${additionalData.careGoals.join(', ')}`;
    }
  }

  if (customInstructions) {
    prompt += `\n\nINSTRUCTIONS SUPPLÉMENTAIRES:
${customInstructions}`;
  }

  return prompt;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const request: DocumentRequest = await req.json();
    console.log('Generating document:', { type: request.documentType, patient: request.patientData.name });

    const systemPrompt = buildSystemPrompt(request);
    const userPrompt = buildUserPrompt(request);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    console.log('Document generated successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        content: generatedContent,
        metadata: {
          documentType: request.documentType,
          patientId: request.patientData.id,
          consultationId: request.consultationData.id,
          generatedAt: new Date().toISOString()
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in generate-medical-document function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});