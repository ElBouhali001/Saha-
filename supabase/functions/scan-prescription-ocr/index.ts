import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting OCR analysis of prescription');
    
    const { imageBase64, pharmacyId } = await req.json();

    if (!imageBase64) {
      throw new Error('Image data is required');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get pharmacy inventory if pharmacyId provided
    let inventory = [];
    if (pharmacyId) {
      console.log('Fetching pharmacy inventory for matching');
      const { data: inventoryData } = await supabase
        .from('pharmacy_inventory')
        .select('*')
        .eq('pharmacy_id', pharmacyId);
      
      inventory = inventoryData || [];
    }

    // Call Lovable AI Gateway with Gemini Vision for OCR
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Calling Lovable AI (Gemini Vision Pro) for OCR');
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${lovableApiKey}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          {
            role: 'system',
            content: 'Tu es un assistant d\'OCR médical. Analyse l\'image d\'ordonnance et renvoie UNIQUEMENT les champs structurés via l\'outil extract_prescription. Pas de texte libre.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: { url: `data:image/jpeg;base64,${imageBase64}` }
              },
              {
                type: 'text',
                text: 'Extraire les champs demandés et APPELER la fonction extract_prescription avec les valeurs.'
              }
            ]
          }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'extract_prescription',
              description: 'Retourne les informations structurées d\'une ordonnance',
              parameters: {
                type: 'object',
                properties: {
                  doctor_name: { type: 'string', nullable: true },
                  patient_name: { type: 'string', nullable: true },
                  date: { type: 'string', nullable: true, description: "format DD/MM/YYYY" },
                  medications: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: { type: 'string' },
                        dosage: { type: 'string', nullable: true },
                        frequency: { type: 'string', nullable: true },
                        duration: { type: 'string', nullable: true },
                        instructions: { type: 'string', nullable: true }
                      },
                      required: ['name'],
                      additionalProperties: false
                    }
                  },
                  notes: { type: 'string', nullable: true }
                },
                required: ['medications'],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'extract_prescription' } },
        max_completion_tokens: 1000
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Limite de requêtes atteinte. Veuillez réessayer dans quelques instants.' 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Crédits AI insuffisants. Veuillez ajouter des crédits dans les paramètres.' 
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const error = await aiResponse.text();
      console.error('Lovable AI error:', error);
      throw new Error(`Lovable AI error: ${aiResponse.status}`);
    }

    // Prefer tool call structured output
    const message = aiData.choices?.[0]?.message;
    const toolCalls = message?.tool_calls;

    let prescriptionData;

    try {
      if (toolCalls && toolCalls.length > 0) {
        const argsStr = toolCalls[0]?.function?.arguments ?? '{}';
        console.log('Tool call arguments (truncated):', (argsStr as string).slice(0, 200));
        prescriptionData = JSON.parse(argsStr);
      } else {
        const content = message?.content ?? '';
        // Clean up the response - remove all markdown code blocks markers
        let jsonStr = (content as string)
          .replace(/```json\s*/g, '')
          .replace(/```\s*/g, '')
          .trim();
        // Extract JSON object
        const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
        if (jsonMatch) jsonStr = jsonMatch[0];
        console.log('Extracted JSON string:', jsonStr.substring(0, 200));
        prescriptionData = JSON.parse(jsonStr);
      }
    } catch (e) {
      console.error('Failed to parse AI response as JSON:', e);
      console.error('Raw message:', JSON.stringify(message));
      throw new Error('Failed to parse prescription data');
    }

    // Match medications with inventory
    if (inventory.length > 0 && prescriptionData.medications) {
      console.log('Matching medications with inventory');
      prescriptionData.medications = prescriptionData.medications.map((med: any) => {
        const medName = med.name?.toLowerCase() || '';
        
        // Try exact match first
        let match = inventory.find((item: any) => 
          item.name.toLowerCase() === medName ||
          item.generic_name?.toLowerCase() === medName
        );

        // Try partial match
        if (!match) {
          match = inventory.find((item: any) => 
            medName.includes(item.name.toLowerCase()) ||
            item.name.toLowerCase().includes(medName) ||
            (item.generic_name && (
              medName.includes(item.generic_name.toLowerCase()) ||
              item.generic_name.toLowerCase().includes(medName)
            ))
          );
        }

        if (match) {
          return {
            ...med,
            inventory_id: match.id,
            matched_name: match.name,
            confidence: 0.9,
            found_in_inventory: true,
            current_stock: match.current_stock
          };
        }

        // Find suggestions
        const suggestions = inventory
          .filter((item: any) => {
            const itemName = item.name.toLowerCase();
            const genericName = item.generic_name?.toLowerCase() || '';
            return itemName.includes(medName.substring(0, 5)) ||
                   medName.includes(itemName.substring(0, 5)) ||
                   (genericName && genericName.includes(medName.substring(0, 5)));
          })
          .slice(0, 3)
          .map((item: any) => item.name);

        return {
          ...med,
          confidence: 0.5,
          found_in_inventory: false,
          suggestions
        };
      });
    }

    console.log('OCR analysis completed successfully');
    
    return new Response(
      JSON.stringify({
        success: true,
        data: prescriptionData
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in scan-prescription-ocr:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
