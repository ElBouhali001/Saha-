import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to clean JSON from markdown code blocks
function cleanJsonResponse(content: string): string {
  let cleaned = content.trim();
  
  // Remove markdown code blocks if present
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/```\s*$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/```\s*$/, '');
  }
  
  return cleaned.trim();
}

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
  const prompt = `Tu es un expert en diagnostic médical. Analyse ces symptômes et fournis un diagnostic différentiel précis et structuré.

PATIENT:
- Âge: ${data.patientAge} ans
- Sexe: ${data.patientGender === 'M' ? 'Homme' : 'Femme'}
- Symptômes principaux: ${data.symptoms}
${data.medicalHistory ? `- Antécédents médicaux: ${data.medicalHistory.join(', ')}` : ''}
${data.vitalSigns ? `- Signes vitaux: Température ${data.vitalSigns.temperature}°C, TA ${data.vitalSigns.bloodPressure}, FC ${data.vitalSigns.heartRate} bpm, FR ${data.vitalSigns.respiratoryRate}/min` : ''}

INSTRUCTIONS:
1. Analyse les symptômes en considérant l'âge, le sexe et les antécédents
2. Propose 3-5 diagnostics différentiels classés par probabilité décroissante
3. Base l'indice de confiance (0-100) sur:
   - Correspondance symptomatique précise
   - Prévalence épidémiologique
   - Facteurs de risque du patient
   - Cohérence clinique globale

4. Pour CHAQUE diagnostic, fournis:
   - Code ICD-10 exact
   - Liste des symptômes caractéristiques
   - Examens complémentaires pertinents et spécifiques
   - Niveau d'urgence justifié
   - Diagnostic différentiel concis

Réponds UNIQUEMENT avec ce JSON (aucun texte avant/après):
{
  "diagnostics": [
    {
      "condition": "Nom précis de la pathologie",
      "confidenceIndex": 85,
      "icd10Code": "A00.0",
      "whoCategory": "Catégorie OMS",
      "symptoms": ["symptôme caractéristique 1", "symptôme 2"],
      "additionalTests": ["examen spécifique 1", "examen 2"],
      "urgencyLevel": "low|medium|high|critical",
      "clinicalEvidence": {
        "whoGuidelines": "Guideline pertinent",
        "medlineReferences": ["référence 1"],
        "prevalenceData": "Données épidémiologiques"
      },
      "differentialDiagnosis": ["autre diagnostic possible 1", "autre 2"]
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
      model: 'google/gemini-2.5-flash',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.3
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Gemini API error:', response.status, errorText);
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const result = await response.json();
  const content = result.choices[0].message.content;
  const cleanedContent = cleanJsonResponse(content);
  const parsed = JSON.parse(cleanedContent);
  
  return parsed.diagnostics.map((d: any) => ({
    ...d,
    source: 'gemini-flash',
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
    const useMultiEngine = req.url.includes('multi=true');
    
    console.log(`Analyzing with ${useMultiEngine ? 'multi-engine' : 'fast'} mode...`);
    
    if (useMultiEngine) {
      // Mode multi-moteurs (plus lent mais plus précis)
      const [geminiResults, claudeResults] = await Promise.allSettled([
        callGeminiDiagnosis(data),
        callClaudeDiagnosis(data)
      ]);
      
      const gemini = geminiResults.status === 'fulfilled' ? geminiResults.value : [];
      const claude = claudeResults.status === 'fulfilled' ? claudeResults.value : [];
      
      console.log(`Gemini results: ${gemini.length}, Claude results: ${claude.length}`);
      
      const mergedResults = mergeAndRankResults(gemini, claude);
      
      return new Response(
        JSON.stringify({ 
          diagnostics: mergedResults.slice(0, 5),
          sources: {
            gemini: gemini.length,
            claude: claude.length,
            total: mergedResults.length
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // Mode rapide (Gemini Flash uniquement)
      const results = await callGeminiDiagnosis(data);
      
      return new Response(
        JSON.stringify({ 
          diagnostics: results.slice(0, 5),
          sources: {
            gemini: results.length,
            total: results.length
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
  } catch (error) {
    console.error('AI diagnosis error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
