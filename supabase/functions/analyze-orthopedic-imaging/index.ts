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

    if (!imageData || !imageData.startsWith('data:image/')) {
      return new Response(JSON.stringify({ error: 'Image invalide' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const prompt = `Tu es un assistant IA spécialisé en orthopédie et imagerie musculo-squelettique.\n\nAnalyse l'image orthopédique fournie (radiographie osseuse, IRM articulaire, scanner osseux) et RENVOIE UNIQUEMENT un objet JSON :\n{\n  "imagingType": "radiographie|IRM|scanner|échographie|autre",\n  "generalCondition": "état général des structures osseuses/articulaires",\n  "findings": [\n    { "type": "fracture|arthrose|lésion|autre", "severity": "léger|modéré|sévère", "location": "os ou articulation", "description": "détails" }\n  ],\n  "boneStructures": {\n    "integrity": "intact|fracturé|autre",\n    "density": "normale|ostéopénie|ostéoporose",\n    "alignment": "normal|déformé"\n  },\n  "joints": {\n    "condition": "normale|arthrose|inflammation",\n    "mobility": "observations"\n  },\n  "symptoms": ["symptômes musculo-squelettiques observables"],\n  "diagnosis": "hypothèse diagnostique orthopédique",\n  "recommendedActions": ["actions recommandées"],\n  "urgency": "Faible|Modérée|Urgente",\n  "confidence": 75\n}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'Tu es un assistant médical. Renvoie uniquement du JSON strict.' },
          { role: 'user', content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: imageData } }
            ] as any },
        ],
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error('AI gateway error:', response.status, t);
      return new Response(JSON.stringify({ error: 'Erreur passerelle IA' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const result = await response.json();
    const content = result?.choices?.[0]?.message?.content ?? '';
    const cleaned = cleanJsonResponse(content);
    const analysis = JSON.parse(cleaned);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('analyze-orthopedic-imaging error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
