import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { barcode, prescriptionId, patientId } = await req.json();

    if (!barcode) {
      throw new Error('Barcode is required');
    }

    console.log('Scanning barcode:', barcode);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Look up medication in library
    const { data: medication, error: medError } = await supabase
      .from('medication_library')
      .select('*')
      .eq('barcode', barcode)
      .single();

    if (medError || !medication) {
      console.log('Medication not found in library, using AI recognition...');
      
      // Use AI to recognize medication from barcode
      const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
      
      if (LOVABLE_API_KEY) {
        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
                content: 'Tu es un assistant qui identifie les médicaments à partir de codes-barres EAN-13. Réponds UNIQUEMENT avec un objet JSON structuré.'
              },
              {
                role: 'user',
                content: `Identifie le médicament avec le code-barres: ${barcode}. Fournis les informations suivantes en JSON: name, generic_name, molecule, dosage, form, laboratory, description`
              }
            ],
            temperature: 0.3,
            max_tokens: 500
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const content = aiData.choices[0].message.content;
          
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const aiMedication = JSON.parse(jsonMatch[0]);
            
            return new Response(JSON.stringify({
              success: true,
              medication: {
                ...aiMedication,
                barcode,
                source: 'ai_recognition'
              },
              message: 'Médicament identifié par IA'
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        }
      }

      return new Response(JSON.stringify({
        success: false,
        error: 'Médicament non trouvé dans la base de données'
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if this medication is in the prescription
    let prescriptionMatch = false;
    let prescriptionMedications = [];

    if (prescriptionId) {
      const { data: prescription } = await supabase
        .from('prescriptions')
        .select('medications')
        .eq('id', prescriptionId)
        .single();

      if (prescription && prescription.medications) {
        prescriptionMedications = Array.isArray(prescription.medications) 
          ? prescription.medications 
          : [];
        
        prescriptionMatch = prescriptionMedications.some((med: any) => {
          const medName = med.medicationName || med.medication_name || med.name || '';
          const medMolecule = med.molecule || '';
          
          return medName.toLowerCase().includes(medication.name.toLowerCase()) ||
                 medName.toLowerCase().includes(medication.generic_name?.toLowerCase() || '') ||
                 medMolecule.toLowerCase() === medication.molecule.toLowerCase();
        });
      }
    }

    // Record the acquisition
    if (prescriptionId && patientId) {
      const { error: acqError } = await supabase
        .from('medication_acquisitions')
        .insert({
          prescription_id: prescriptionId,
          patient_id: patientId,
          medication_library_id: medication.id,
          medication_name: medication.name,
          barcode: barcode,
          verified: prescriptionMatch
        });

      if (acqError) {
        console.error('Error recording acquisition:', acqError);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      medication,
      prescriptionMatch,
      message: prescriptionMatch 
        ? 'Médicament validé et ajouté à l\'ordonnance' 
        : 'Médicament scanné mais ne correspond pas à l\'ordonnance'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error scanning barcode:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'An error occurred',
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
