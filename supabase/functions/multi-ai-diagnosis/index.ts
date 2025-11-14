import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ClinicalData {
  symptoms: string;
  patientAge: number;
  patientGender: 'M' | 'F';
  medicalHistory?: string[];
  vitalSigns?: {
    temperature?: number;
    bloodPressure?: string;
    heartRate?: number;
    respiratoryRate?: number;
  };
}

interface DiagnosticResult {
  condition: string;
  confidenceIndex: number;
  icd10Code: string;
  whoCategory: string;
  symptoms: string[];
  additionalTests: string[];
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  clinicalEvidence: {
    whoGuidelines: string;
    medlineReferences: string[];
    prevalenceData: string;
  };
  differentialDiagnosis: string[];
  source: string; // 'gemini' | 'claude' | 'openevidence'
  confidence: number;
}

async function callGeminiDiagnosis(data: ClinicalData): Promise<DiagnosticResult[]> {
  const prompt = `
En tant qu'assistant diagnostique médical, analysez les symptômes suivants et fournissez un diagnostic différentiel.

DONNÉES PATIENT:
- Âge: ${data.patientAge} ans
- Sexe: ${data.patientGender === 'M' ? 'Masculin' : 'Féminin'}
- Symptômes: ${data.symptoms}
${data.medicalHistory ? `- Antécédents: ${data.medicalHistory.join(', ')}` : ''}
${data.vitalSigns ? `- Signes vitaux: ${JSON.stringify(data.vitalSigns)}` : ''}

Proposez 3-5 diagnostics différentiels avec codes ICD-10 et niveau de confiance.

Structurez votre réponse en JSON:
{
  "diagnostics": [
    {
      "condition": "Nom de la pathologie",
      "confidenceIndex": 85,
      "icd10Code": "J44.1",
      "whoCategory": "Maladies respiratoires",
      "symptoms": ["symptôme1", "symptôme2"],
      "additionalTests": ["test1", "test2"],
      "urgencyLevel": "medium",
      "clinicalEvidence": {
        "whoGuidelines": "WHO Global Strategy",
        "medlineReferences": ["ref1", "ref2"],
        "prevalenceData": "Données de prévalence"
      },
      "differentialDiagnosis": ["diagnostic1", "diagnostic2"]
    }
  ]
}`;

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-pro',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Gemini API error:', response.status, errorText);
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const result = await response.json();
  const content = result.choices[0].message.content;
  const parsed = JSON.parse(content);
  
  return parsed.diagnostics.map((d: any) => ({
    ...d,
    source: 'gemini',
    confidence: d.confidenceIndex
  }));
}

async function callClaudeDiagnosis(data: ClinicalData): Promise<DiagnosticResult[]> {
  const prompt = `Analysez ces symptômes médicaux et fournissez un diagnostic différentiel:

Patient: ${data.patientAge} ans, ${data.patientGender === 'M' ? 'Homme' : 'Femme'}
Symptômes: ${data.symptoms}
${data.medicalHistory ? `Antécédents: ${data.medicalHistory.join(', ')}` : ''}

Proposez 3-5 diagnostics différentiels avec codes ICD-10 et justifications cliniques.

Format JSON:
{
  "diagnostics": [
    {
      "condition": "nom",
      "confidenceIndex": 0-100,
      "icd10Code": "code",
      "whoCategory": "catégorie",
      "symptoms": [],
      "additionalTests": [],
      "urgencyLevel": "low|medium|high|critical",
      "clinicalEvidence": {
        "whoGuidelines": "",
        "medlineReferences": [],
        "prevalenceData": ""
      },
      "differentialDiagnosis": []
    }
  ]
}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Claude API error:', response.status, errorText);
    throw new Error(`Claude API error: ${response.status}`);
  }

  const result = await response.json();
  const content = result.content[0].text;
  
  // Extraire le JSON du contenu
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No valid JSON found in Claude response');
  }
  
  const parsed = JSON.parse(jsonMatch[0]);
  return parsed.diagnostics.map((d: any) => ({
    ...d,
    source: 'claude',
    confidence: d.confidenceIndex
  }));
}

function mergeAndRankResults(
  geminiResults: DiagnosticResult[],
  claudeResults: DiagnosticResult[]
): DiagnosticResult[] {
  // Créer une map pour combiner les résultats par condition
  const conditionMap = new Map<string, DiagnosticResult[]>();
  
  // Ajouter tous les résultats
  [...geminiResults, ...claudeResults].forEach(result => {
    const key = result.condition.toLowerCase();
    if (!conditionMap.has(key)) {
      conditionMap.set(key, []);
    }
    conditionMap.get(key)!.push(result);
  });
  
  // Calculer un score combiné pour chaque condition
  const combinedResults: DiagnosticResult[] = [];
  
  conditionMap.forEach((results, condition) => {
    if (results.length > 1) {
      // Si plusieurs sources mentionnent la même condition, calculer la moyenne
      const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;
      const bestResult = results.reduce((best, curr) => 
        curr.confidence > best.confidence ? curr : best
      );
      
      combinedResults.push({
        ...bestResult,
        confidence: avgConfidence * 1.2, // Bonus pour consensus
        source: `consensus (${results.map(r => r.source).join(', ')})`
      });
    } else {
      // Une seule source mentionne cette condition
      combinedResults.push(results[0]);
    }
  });
  
  // Trier par confiance décroissante
  return combinedResults.sort((a, b) => b.confidence - a.confidence);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: ClinicalData = await req.json();
    
    console.log('Analyzing with multiple AI engines...');
    
    // Appeler les deux moteurs en parallèle
    const [geminiResults, claudeResults] = await Promise.allSettled([
      callGeminiDiagnosis(data),
      callClaudeDiagnosis(data)
    ]);
    
    const gemini = geminiResults.status === 'fulfilled' ? geminiResults.value : [];
    const claude = claudeResults.status === 'fulfilled' ? claudeResults.value : [];
    
    console.log(`Gemini results: ${gemini.length}, Claude results: ${claude.length}`);
    
    // Fusionner et classer les résultats
    const mergedResults = mergeAndRankResults(gemini, claude);
    
    return new Response(
      JSON.stringify({ 
        diagnostics: mergedResults.slice(0, 5), // Top 5 résultats
        sources: {
          gemini: gemini.length,
          claude: claude.length,
          total: mergedResults.length
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Multi-AI diagnosis error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
