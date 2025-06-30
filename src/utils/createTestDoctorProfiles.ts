
import { supabase } from '@/integrations/supabase/client';

export const createTestDoctorProfiles = async () => {
  try {
    // Créer des profils pour les médecins de test
    const doctorProfiles = [
      {
        id: crypto.randomUUID(),
        first_name: 'Marie',
        last_name: 'Dubois',
        role: 'doctor',
        email: 'marie.dubois@hopital.fr'
      },
      {
        id: crypto.randomUUID(),
        first_name: 'Pierre',
        last_name: 'Martin',
        role: 'doctor',
        email: 'pierre.martin@hopital.fr'
      },
      {
        id: crypto.randomUUID(),
        first_name: 'Sophie',
        last_name: 'Rousseau',
        role: 'doctor',
        email: 'sophie.rousseau@hopital.fr'
      }
    ];

    // Insérer les profils
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .insert(doctorProfiles)
      .select();

    if (profileError) {
      console.error('Error creating doctor profiles:', profileError);
      return;
    }

    console.log('Created doctor profiles:', profiles);

    // Récupérer les médecins existants
    const { data: doctors, error: doctorsError } = await supabase
      .from('doctors')
      .select('*')
      .in('license_number', ['DOC001', 'DOC002', 'DOC003']);

    if (doctorsError) {
      console.error('Error fetching doctors:', doctorsError);
      return;
    }

    // Associer les profils aux médecins
    if (doctors && profiles) {
      for (let i = 0; i < Math.min(doctors.length, profiles.length); i++) {
        const { error: updateError } = await supabase
          .from('doctors')
          .update({ user_id: profiles[i].id })
          .eq('id', doctors[i].id);

        if (updateError) {
          console.error('Error updating doctor user_id:', updateError);
        }
      }
    }

    console.log('Successfully created test doctor profiles and linked them');
  } catch (error) {
    console.error('Error in createTestDoctorProfiles:', error);
  }
};
