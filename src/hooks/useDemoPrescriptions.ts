import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

export const useDemoPrescriptions = () => {
  const { user } = useSupabaseAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const createDemoPrescriptions = async () => {
      if (!user?.id) return;

      try {
        // Récupérer le patient_id à partir du user_id
        const { data: patientData } = await supabase
          .from('patients')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!patientData) {
          console.log('No patient found for this user');
          return;
        }

        // Vérifier si des ordonnances existent déjà
        const { data: existingPrescriptions } = await supabase
          .from('prescriptions')
          .select('id')
          .eq('patient_id', patientData.id)
          .limit(1);

        if (existingPrescriptions && existingPrescriptions.length > 0) {
          console.log('Demo prescriptions already exist');
          return;
        }

        // Créer des ordonnances de démo
        const demoPrescriptions = [
          {
            patient_id: patientData.id,
            doctor_id: null, // Peut être null pour la démo
            prescription_date: new Date().toISOString().split('T')[0],
            status: 'prescribed',
            is_renewable: true,
            instructions: 'À prendre pendant les repas',
            medications: [
              {
                name: 'Paracétamol 500mg',
                dosage: '500mg',
                frequency: '3 fois par jour',
                duration: '7 jours',
                instructions: 'Prendre avec un verre d\'eau'
              },
              {
                name: 'Amoxicilline 500mg',
                dosage: '500mg',
                frequency: '2 fois par jour',
                duration: '10 jours',
                instructions: 'Prendre à jeun ou 2h après un repas'
              }
            ]
          },
          {
            patient_id: patientData.id,
            doctor_id: null,
            prescription_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: 'acquired',
            is_renewable: false,
            acquired_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            instructions: 'Traitement pour hypertension',
            medications: [
              {
                name: 'Lisinopril 10mg',
                dosage: '10mg',
                frequency: '1 fois par jour',
                duration: '30 jours',
                instructions: 'Prendre le matin'
              }
            ]
          },
          {
            patient_id: patientData.id,
            doctor_id: null,
            prescription_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: 'in_progress',
            is_renewable: true,
            acquired_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            treatment_start_date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            treatment_end_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
            instructions: 'Traitement respiratoire',
            medications: [
              {
                name: 'Ventoline 100µg',
                dosage: '100µg/dose',
                frequency: '2 à 4 fois par jour si besoin',
                duration: '30 jours',
                instructions: 'En cas de difficulté respiratoire'
              },
              {
                name: 'Seretide 250',
                dosage: '250µg/25µg',
                frequency: '2 fois par jour',
                duration: '30 jours',
                instructions: 'Matin et soir, rincer la bouche après utilisation'
              }
            ]
          }
        ];

        const { error } = await supabase
          .from('prescriptions')
          .insert(demoPrescriptions);

        if (error) {
          console.error('Error creating demo prescriptions:', error);
        } else {
          console.log('Demo prescriptions created successfully');
        }
      } catch (error) {
        console.error('Error in createDemoPrescriptions:', error);
      } finally {
        setLoading(false);
      }
    };

    createDemoPrescriptions();
  }, [user?.id]);

  return { loading };
};
