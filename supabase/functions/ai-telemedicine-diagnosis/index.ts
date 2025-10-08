import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      symptoms, 
      vitals, 
      patientHistory, 
      currentMedications,
      patientAge,
      patientGender 
    } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Generating AI diagnosis...');

    const prompt = `En tant qu'assistant médical IA, analyse les informations suivantes du patient et fournis un diagnostic différentiel:

INFORMATIONS PATIENT:
- Âge: ${patientAge} ans
- Sexe: ${patientGender}
- Symptômes actuels: ${symptoms}

CONSTANTES VITALES ACTUELLES:
- Fréquence cardiaque: ${vitals.heartRate} bpm
- Fréquence respiratoire: ${vitals.respiratoryRate} /min
- Température: ${vitals.temperature}°C
- État émotionnel: ${vitals.emotionalState}
- Niveau de conscience: ${vitals.consciousnessLevel}
- Signes de détresse: ${vitals.distressSignals?.join(', ') || 'Aucun'}

HISTORIQUE MÉDICAL:
${patientHistory || 'Aucun antécédent significatif'}

MÉDICAMENTS ACTUELS:
${currentMedications || 'Aucun'}

Fournis une analyse structurée comprenant:
1. Diagnostic différentiel (3-5 hypothèses diagnostiques)
2. Niveau d'urgence (faible, modéré, élevé, critique)
3. Examens complémentaires recommandés
4. Recommandations de traitement
5. Signes d'alerte à surveiller
6. Score de confiance pour chaque diagnostic

Réponds UNIQUEMENT avec un objet JSON structuré.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `Tu es un assistant médical IA expert. Fournis des diagnostics différentiels structurés basés sur les symptômes et les constantes vitales du patient.

Réponds TOUJOURS avec un objet JSON structuré comme suit:
{
  "differentialDiagnosis": [
    {
      "condition": "Nom de la pathologie",
      "icd10": "Code CIM-10",
      "probability": number (0-100),
      "reasoning": "Explication clinique",
      "keyFindings": ["signe 1", "signe 2"]
    }
  ],
  "urgencyLevel": "faible|modéré|élevé|critique",
  "urgencyReason": "Explication",
  "recommendedTests": ["examen 1", "examen 2"],
  "treatmentRecommendations": [
    {
      "category": "pharmacologique|non-pharmacologique|intervention",
      "recommendation": "Description du traitement",
      "priority": "immédiat|urgent|routine"
    }
  ],
  "warningSignals": ["signe 1", "signe 2"],
  "followUp": {
    "timeframe": "délai recommandé",
    "instructions": "instructions de suivi"
  },
  "disclaimer": "Ceci est un avis d'IA à but informatif uniquement."
}`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.4,
        max_tokens: 2000
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('AI Diagnosis Response:', content);

    // Parse the JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from AI');
    }

    const diagnosis = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify({ 
      success: true,
      diagnosis,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating diagnosis:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
