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
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');

    if (!ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }

    // Validate image data
    if (!imageData || !imageData.startsWith('data:image/')) {
      console.error('Invalid image data received');
      return new Response(JSON.stringify({ 
        error: 'Image invalide. Veuillez fournir une image valide.',
        success: false 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Analyzing dental imaging with Claude Sonnet 4...');

    // Extract media type and base64 data
    const mediaTypeMatch = imageData.match(/^data:image\/(png|jpeg|jpg|webp);base64,/);
    if (!mediaTypeMatch) {
      throw new Error('Unsupported image format');
    }

    const mediaType = mediaTypeMatch[1] === 'jpg' ? 'jpeg' : mediaTypeMatch[1];
    const base64Data = imageData.split(',')[1];

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': `${ANTHROPIC_API_KEY}`,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: `image/${mediaType}`,
                  data: base64Data,
                },
              },
              {
                type: 'text',
                text: `Tu es un assistant médical IA spécialisé dans l'analyse d'imagerie dentaire.

Analyse l'image dentaire fournie (radiographie, photo intra-orale, panoramique dentaire, etc.) et fournis un rapport clinique détaillé.

Identifie et décris:
- Type d'imagerie (radiographie rétro-alvéolaire, bite-wing, panoramique, photo intra-orale, etc.)
- État général de la dentition
- Caries détectées (localisation précise par numérotation dentaire FDI)
- Maladies parodontales (gingivite, parodontite, récession gingivale)
- Problèmes d'occlusion ou d'alignement
- Dents manquantes ou extraites
- Présence de restaurations (obturations, couronnes, bridges, implants)
- Lésions apicales ou kystes
- Usure dentaire, érosions, abrasions
- Problèmes de gencives ou muqueuses
- Toute autre anomalie détectée

Réponds UNIQUEMENT avec un objet JSON structuré comme suit:
{
  "imagingType": "type d'imagerie détecté",
  "generalCondition": "état général de la dentition (bon, moyen, préoccupant, critique)",
  "findings": [
    {
      "type": "carie | parodontite | restauration | autre",
      "location": "localisation précise (numéro dent FDI si applicable)",
      "severity": "légère | modérée | sévère",
      "description": "description détaillée"
    }
  ],
  "teeth": {
    "present": number,
    "missing": number,
    "restored": number
  },
  "symptoms": "description narrative des symptômes observables pour section consultation",
  "diagnosis": "diagnostic dentaire détaillé basé sur les observations",
  "recommendedActions": ["action1", "action2", "..."],
  "urgency": "faible | modérée | élevée",
  "confidence": number (0-100),
  "specialtyFields": {
    "dentitionState": "bon | moyen | mauvais | edente",
    "missingTeeth": number,
    "cavities": "liste des dents avec caries (notation FDI séparée par virgules)",
    "gumsState": "saines | gingivite | parodontite-legere | parodontite-moderee | parodontite-severe",
    "oralHygiene": "excellente | bonne | moyenne | insuffisante | mauvaise",
    "tartar": "absent | leger | modere | important",
    "occlusion": "classe-I | classe-II | classe-III | supraclusion | infraclusion",
    "dentalSymptoms": ["liste des symptômes détectés parmi: Douleur dentaire, Sensibilité au froid, Sensibilité au chaud, Saignement gingival, Mauvaise haleine, Mobilité dentaire"],
    "requiredCare": ["liste des soins nécessaires parmi: Détartrage, Soins de caries, Extraction, Prothèse dentaire, Couronne, Implant, Blanchiment, Orthodontie"],
    "panoramicXray": "non-necessaire | recommandee | realisee",
    "dentalNotes": "observations cliniques complémentaires"
  }
}`,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', response.status, errorText);
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.content?.[0]?.text;

    if (!content) {
      throw new Error('No content received from AI');
    }

    console.log('AI Response received from Claude');

    // Parse the JSON response (Claude may wrap it in markdown code blocks)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from AI');
    }

    const analysis = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify({ 
      success: true,
      analysis,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error analyzing dental imaging:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Une erreur est survenue',
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
