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
    const imageData: string | undefined = body?.image || body?.imageData;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    if (!imageData || typeof imageData !== 'string' || !imageData.startsWith('data:image/')) {
      return new Response(JSON.stringify({ error: 'Image invalide', details: 'Attendez une chaîne data:image/... base64' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const prompt = `Tu es un assistant IA spécialisé en imagerie cardiologique (échocardiographie, IRM cardiaque, scanner, radiographie thoracique, ECG image).\n\nAnalyse l'image fournie et RENVOIE UNIQUEMENT un objet JSON avec ce schéma exact :\n{\n  "imagingType": "type d'imagerie détecté (echo, IRM, scanner, radio, autre)",\n  "generalCondition": "résumé de l'état cardio-pulmonaire",\n  "findings": [\n    { "type": "anomalie", "severity": "léger|modéré|sévère", "location": "zone anatomique", "description": "détails" }\n  ],\n  "heartChambers": {\n    "leftVentricle": "fonction / taille / épaisseur",\n    "rightVentricle": "fonction / taille",\n    "leftAtrium": "taille / particularités",\n    "rightAtrium": "taille / particularités"\n  },\n  "valves": {\n    "mitral": "normal|insuffisance|sténose|calcification ...",\n    "aortic": "normal|insuffisance|sténose|calcification ...",\n    "tricuspid": "normal|insuffisance|sténose ...",\n    "pulmonary": "normal|insuffisance|sténose ..."\n  },\n  "symptoms": ["liste brève de symptômes déduits"],\n  "diagnosis": "hypothèse diagnostique principale",\n  "recommendedActions": ["actions recommandées"],\n  "urgency": "Faible|Modérée|Urgente",\n  "confidence": 75\n}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          { role: 'system', content: 'Tu es un assistant médical concis et fiable. Toujours renvoyer du JSON strict sans texte additionnel.' },
          { role: 'user', content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: imageData } }
            ] as any },
        ],
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit dépassé, réessayez plus tard.' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Crédits Lovable AI épuisés. Merci d’ajouter des crédits.' }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      console.error('AI gateway error:', response.status, t);
      return new Response(JSON.stringify({ error: 'Erreur passerelle IA' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const result = await response.json();
    const content: string = result?.choices?.[0]?.message?.content ?? '';
    const cleaned = cleanJsonResponse(content);

    let analysis: any;
    try {
      analysis = JSON.parse(cleaned);
    } catch (e) {
      console.error('JSON parse error:', e, '\
Raw:', cleaned);
      return new Response(JSON.stringify({ error: 'Réponse IA invalide' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('analyze-cardiac-imaging error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
