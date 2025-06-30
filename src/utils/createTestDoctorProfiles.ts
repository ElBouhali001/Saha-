
import { supabase } from '@/integrations/supabase/client';

export const createTestDoctorProfiles = async () => {
  try {
    console.log('Starting to create test doctor profiles...');
    
    // Vérifier d'abord si les médecins existent déjà avec des profils
    const { data: existingDoctors, error: checkError } = await supabase
      .from('doctors')
      .select(`
        *,
        profile:profiles(*)
      `)
      .in('license_number', ['DOC001', 'DOC002', 'DOC003']);

    if (checkError) {
      console.error('Error checking existing doctors:', checkError);
      return;
    }

    console.log('Existing doctors:', existingDoctors);

    // Filtrer les médecins qui n'ont pas encore de profil
    const doctorsWithoutProfiles = existingDoctors?.filter(doctor => !doctor.profile) || [];
    
    if (doctorsWithoutProfiles.length === 0) {
      console.log('All doctors already have profiles');
      return;
    }

    console.log('Doctors without profiles:', doctorsWithoutProfiles);

    // Créer des profils pour les médecins sans profil
    const doctorProfilesData = [
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

    // Prendre seulement le nombre de profils nécessaires
    const profilesToCreate = doctorProfilesData.slice(0, doctorsWithoutProfiles.length);

    // Insérer les profils
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .insert(profilesToCreate)
      .select();

    if (profileError) {
      console.error('Error creating doctor profiles:', profileError);
      return;
    }

    console.log('Created doctor profiles:', profiles);

    // Associer les profils aux médecins
    if (profiles) {
      for (let i = 0; i < Math.min(doctorsWithoutProfiles.length, profiles.length); i++) {
        const { error: updateError } = await supabase
          .from('doctors')
          .update({ user_id: profiles[i].id })
          .eq('id', doctorsWithoutProfiles[i].id);

        if (updateError) {
          console.error('Error updating doctor user_id:', updateError);
        } else {
          console.log(`Linked profile ${profiles[i].id} to doctor ${doctorsWithoutProfiles[i].id}`);
        }
      }
    }

    console.log('Successfully created test doctor profiles and linked them');
  } catch (error) {
    console.error('Error in createTestDoctorProfiles:', error);
  }
};
