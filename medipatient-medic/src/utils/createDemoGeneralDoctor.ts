import { supabase } from '@/integrations/supabase/client';

export const createDemoGeneralDoctor = async () => {
  try {
    console.log('Creating demo general practitioner...');
    
    // Vérifier si une spécialité "Médecine Générale" existe
    let { data: specialty, error: specialtyError } = await supabase
      .from('specialties')
      .select('id')
      .eq('name', 'Médecine Générale')
      .single();

    // Si elle n'existe pas, la créer
    if (!specialty) {
      const { data: newSpecialty, error: createSpecialtyError } = await supabase
        .from('specialties')
        .insert({
          name: 'Médecine Générale',
          description: 'Consultation de médecine générale'
        })
        .select()
        .single();

      if (createSpecialtyError) {
        console.error('Error creating specialty:', createSpecialtyError);
        return;
      }
      specialty = newSpecialty;
    }

    console.log('Specialty found/created:', specialty);

    // Créer le profil du médecin
    const doctorProfile = {
      id: crypto.randomUUID(),
      first_name: 'Dr. Jean',
      last_name: 'Dupont',
      role: 'doctor',
      email: 'dr.dupont@demo.fr'
    };

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert(doctorProfile)
      .select()
      .single();

    if (profileError) {
      console.error('Error creating doctor profile:', profileError);
      return;
    }

    console.log('Doctor profile created:', profile);

    // Créer l'entrée doctor
    const { data: doctor, error: doctorError } = await supabase
      .from('doctors')
      .insert({
        user_id: profile.id,
        specialty_id: specialty.id,
        license_number: 'MG-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
        consultation_fee: 15000,
        availability_status: 'available'
      })
      .select()
      .single();

    if (doctorError) {
      console.error('Error creating doctor:', doctorError);
      return;
    }

    console.log('Doctor created:', doctor);

    // Créer la liaison doctor_specialties
    const { error: doctorSpecialtyError } = await supabase
      .from('doctor_specialties')
      .insert({
        doctor_id: doctor.id,
        specialty_id: specialty.id,
        is_primary: true
      });

    if (doctorSpecialtyError) {
      console.error('Error creating doctor specialty link:', doctorSpecialtyError);
      return;
    }

    console.log('Demo general practitioner created successfully!');
    return { profile, doctor };
  } catch (error) {
    console.error('Error in createDemoGeneralDoctor:', error);
  }
};
