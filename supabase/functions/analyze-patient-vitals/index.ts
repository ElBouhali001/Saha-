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
    const { imageData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Validate image data
    if (!imageData || imageData === 'data:,' || !imageData.startsWith('data:image/')) {
      console.error('Invalid image data received:', imageData?.substring(0, 50));
      return new Response(JSON.stringify({ 
        error: 'Image invalide. Assurez-vous que la caméra est activée.',
        success: false 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Analyzing patient vitals from video frame...');

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
            content: `Tu es un assistant médical IA spécialisé dans l'analyse des constantes vitales à partir d'images vidéo.
            
Analyse l'image du patient et fournis une estimation des constantes vitales suivantes:
- Rythme respiratoire (respirations par minute)
- État émotionnel (calme, anxieux, stressé, douleur)
- Fréquence cardiaque estimée (bpm) basée sur les micro-mouvements et la coloration de la peau
- Température corporelle estimée basée sur la coloration faciale et la transpiration
- Niveau de conscience (alerte, somnolent, confus)
- Signes visuels de détresse ou d'inconfort

Réponds UNIQUEMENT avec un objet JSON structuré comme suit:
{
  "respiratoryRate": number,
  "heartRate": number,
  "temperature": number,
  "emotionalState": string,
  "consciousnessLevel": string,
  "distressSignals": string[],
  "skinColor": string,
  "facialExpression": string,
  "confidence": number,
  "alerts": string[]
}`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyse cette image du patient et fournis les constantes vitales estimées.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageData
                }
              }
            ]
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('AI Response:', content);

    // Parse the JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from AI');
    }

    const vitals = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify({ 
      success: true,
      vitals,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error analyzing patient vitals:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'An error occurred',
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
