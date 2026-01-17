import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function cleanJsonResponse(content: string): string {
  let cleaned = content.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/```\s*$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/```\s*$/, '');
  }
  return cleaned.trim();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const imageData: string | undefined = body?.imageData;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    if (!imageData || !imageData.startsWith('data:image/')) {
      return new Response(JSON.stringify({ error: 'Image invalide' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const prompt = `Tu es un expert médical spécialisé en analyse de signes vitaux par imagerie, formé pour analyser TOUS les types de peau et origines ethniques.

IMPORTANT - DIVERSITÉ DES TYPES DE PEAU:
Tu dois adapter ton analyse selon le phototype du patient. Les signes cliniques se manifestent différemment selon la pigmentation:

1. PEAU CLAIRE (Type I-II - Caucasien, Européen du Nord):
   - Pâleur: teint blanc/grisâtre
   - Cyanose: lèvres/ongles bleutés facilement visibles
   - Rougeur: érythème visible directement
   - Ictère: jaunissement visible sur la peau et sclérotiques

2. PEAU INTERMÉDIAIRE (Type III-IV - Méditerranéen, Asiatique, Hispanique, Métissé):
   - Pâleur: perte de la teinte rosée sous-jacente, teint plus terne
   - Cyanose: vérifier muqueuses buccales, lit unguéal, paumes
   - Rougeur: peut apparaître comme assombrissement de la peau
   - Ictère: vérifier sclérotiques et paumes

3. PEAU FONCÉE (Type V-VI - Africain, Afro-Caribéen, Sud-Indien, Aborigène):
   - Pâleur: aspect grisâtre/cendreux, perte d'éclat, muqueuses pâles
   - Cyanose: CRITIQUE - vérifier muqueuses (lèvres intérieures, langue), paumes, plantes des pieds, lit unguéal
   - Rougeur: apparaît comme zones plus sombres/violacées
   - Ictère: vérifier SCLÉROTIQUES (blanc des yeux), paumes, plantes des pieds

4. PEAU AMÉRINDIENNE/AUTOCHTONE:
   - Teinte cuivrée naturelle à considérer comme baseline
   - Évaluer les changements par rapport à la teinte de base du patient

Analyse l'image du visage du patient et RENVOIE UNIQUEMENT un objet JSON avec ce schéma exact:

{
  "detectedSkinType": "très clair|clair|intermédiaire|mat|foncé|très foncé",
  "skinTypeNote": "description du phototype détecté et comment cela influence l'analyse",
  "heartRate": <nombre estimé entre 50 et 120>,
  "heartRateConfidence": <nombre entre 20 et 60>,
  "respiratoryRate": <nombre estimé entre 10 et 25>,
  "respiratoryRateConfidence": <nombre entre 20 et 60>,
  "estimatedTemperature": "normale|légèrement élevée|possiblement fébrile",
  "temperatureNote": "Estimation visuelle uniquement - thermomètre requis pour mesure précise",
  "mood": "neutre|calme|anxieux|fatigué|stressé|détendu|triste|positif",
  "moodConfidence": <nombre entre 40 et 80>,
  "moodIndicators": ["liste des signes observés adaptés au type de peau"],
  "physicalCondition": "bonne forme|forme moyenne|fatigue apparente|signes de malaise",
  "physicalConditionDetails": ["détails observés adaptés au type de peau"],
  "skinColor": "normal pour ce phototype|pâle/cendreux|rougeâtre/assombri|jaunâtre|cyanosé",
  "skinColorAnalysis": "description ADAPTÉE au type de peau du patient - ex: pour peau foncée, vérifier muqueuses et paumes",
  "facialExpression": "détendue|tendue|douloureuse|neutre|fatiguée",
  "eyeCondition": "yeux vifs|yeux fatigués|cernes marquées|conjonctives normales|conjonctives pâles|conjonctives ictériques|conjonctives rouges",
  "mucosalAssessment": "muqueuses roses et bien perfusées|muqueuses pâles|muqueuses cyanosées|non visible",
  "overallHealthScore": <nombre entre 0 et 100>,
  "alerts": ["liste d'alertes adaptées au type de peau - peut être vide"],
  "recommendations": ["recommandations basées sur l'analyse"]
}

RÈGLES CRITIQUES:
- IDENTIFIE d'abord le phototype/type de peau avant toute analyse
- ADAPTE tes critères d'évaluation au type de peau détecté
- Pour les peaux foncées, privilégie l'examen des MUQUEUSES, SCLÉROTIQUES, PAUMES et LIT UNGUÉAL
- Ne jamais appliquer des critères de peau claire à une peau foncée (erreur médicale grave)
- La confiance ne doit JAMAIS dépasser 60% car c'est une analyse visuelle
- Sois CONSERVATEUR et HONNÊTE sur les limites de cette méthode

Analyse maintenant l'image et renvoie le JSON.`;

    console.log('Sending image for vital signs analysis...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'Tu es un assistant médical expert en analyse visuelle. Renvoie uniquement du JSON strict sans markdown.' },
          { 
            role: 'user', 
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: imageData } }
            ]
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Limite de requêtes atteinte. Réessayez dans quelques instants.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Crédits IA insuffisants. Veuillez recharger votre compte.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(JSON.stringify({ error: 'Erreur passerelle IA' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const result = await response.json();
    const content = result?.choices?.[0]?.message?.content ?? '';
    
    console.log('AI response received, parsing...');
    
    const cleaned = cleanJsonResponse(content);
    const analysis = JSON.parse(cleaned);

    console.log('Analysis completed successfully:', {
      heartRate: analysis.heartRate,
      mood: analysis.mood,
      overallHealthScore: analysis.overallHealthScore
    });

    return new Response(JSON.stringify({ 
      success: true, 
      analysis 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('analyze-vitals-camera error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
