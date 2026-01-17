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

    const prompt = `Tu es un expert médical spécialisé en analyse de signes vitaux par imagerie.

Analyse l'image du visage du patient et RENVOIE UNIQUEMENT un objet JSON avec ce schéma exact:

{
  "heartRate": <nombre estimé entre 50 et 120 basé sur la coloration de la peau et les micro-variations visibles>,
  "heartRateConfidence": <nombre entre 20 et 60 - la mesure par caméra est approximative>,
  "respiratoryRate": <nombre estimé entre 10 et 25 basé sur les mouvements thoraciques/épaules visibles>,
  "respiratoryRateConfidence": <nombre entre 20 et 60>,
  "estimatedTemperature": "normale|légèrement élevée|possiblement fébrile",
  "temperatureNote": "Estimation visuelle uniquement - thermomètre requis pour mesure précise",
  "mood": "neutre|calme|anxieux|fatigué|stressé|détendu|triste|positif",
  "moodConfidence": <nombre entre 40 et 80>,
  "moodIndicators": ["liste des signes observés: tension faciale, sourcils froncés, yeux fatigués, etc."],
  "physicalCondition": "bonne forme|forme moyenne|fatigue apparente|signes de malaise",
  "physicalConditionDetails": ["détails observés: cernes, pâleur, sudation visible, etc."],
  "skinColor": "normal|pâle|rougeâtre|jaunâtre|cyanosé",
  "skinColorAnalysis": "description de ce que la coloration suggère",
  "facialExpression": "détendue|tendue|douloureuse|neutre|fatiguée",
  "eyeCondition": "yeux vifs|yeux fatigués|cernes marquées|conjonctives normales|conjonctives rouges",
  "overallHealthScore": <nombre entre 0 et 100 basé sur l'ensemble des observations>,
  "alerts": ["liste d'alertes si signes préoccupants détectés - peut être vide"],
  "recommendations": ["recommandations basées sur l'analyse"]
}

IMPORTANT:
- Les mesures de fréquence cardiaque et respiratoire par caméra sont des ESTIMATIONS
- La confiance ne doit JAMAIS dépasser 60% pour ces mesures car c'est une analyse visuelle
- La température NE PEUT PAS être mesurée précisément sans caméra thermique
- Concentre-toi sur les signes VISUELS: expression faciale, coloration de la peau, apparence des yeux, posture
- Sois CONSERVATEUR dans tes estimations et HONNÊTE sur les limites de cette méthode

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
