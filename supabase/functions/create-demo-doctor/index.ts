import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Créer l'utilisateur dans auth.users
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: 'demo.docteur@medipatient.com',
      password: 'DemoDoctor2024!',
      email_confirm: true,
      user_metadata: {
        first_name: 'Dr. Jean',
        last_name: 'Dupont',
        role: 'doctor',
        speciality: 'Médecine Générale'
      }
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      return new Response(
        JSON.stringify({ error: authError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Auth user created:', authData.user.id);

    // Vérifier si une spécialité "Médecine Générale" existe
    let { data: specialty, error: specialtyError } = await supabaseAdmin
      .from('specialties')
      .select('id')
      .eq('name', 'Médecine Générale')
      .single();

    // Si elle n'existe pas, la créer
    if (!specialty) {
      const { data: newSpecialty, error: createSpecialtyError } = await supabaseAdmin
        .from('specialties')
        .insert({
          name: 'Médecine Générale',
          description: 'Consultation de médecine générale'
        })
        .select()
        .single();

      if (createSpecialtyError) {
        console.error('Error creating specialty:', createSpecialtyError);
        return new Response(
          JSON.stringify({ error: createSpecialtyError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      specialty = newSpecialty;
    }

    // Attendre que le profil soit créé par le trigger
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Récupérer le profil créé
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return new Response(
        JSON.stringify({ error: profileError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Créer l'entrée doctor
    const { data: doctor, error: doctorError } = await supabaseAdmin
      .from('doctors')
      .insert({
        user_id: profile.id,
        specialty_id: specialty.id,
        license_number: 'MG-DEMO-001',
        consultation_fee: 15000,
        availability_status: 'available'
      })
      .select()
      .single();

    if (doctorError) {
      console.error('Error creating doctor:', doctorError);
      return new Response(
        JSON.stringify({ error: doctorError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Créer la liaison doctor_specialties
    const { error: doctorSpecialtyError } = await supabaseAdmin
      .from('doctor_specialties')
      .insert({
        doctor_id: doctor.id,
        specialty_id: specialty.id,
        is_primary: true
      });

    if (doctorSpecialtyError) {
      console.error('Error creating doctor specialty link:', doctorSpecialtyError);
      return new Response(
        JSON.stringify({ error: doctorSpecialtyError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        email: 'demo.docteur@medipatient.com',
        password: 'DemoDoctor2024!',
        message: 'Compte médecin démo créé avec succès'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
