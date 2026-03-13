import React, { useState, useEffect } from 'react';
import PrescriptionTracker from '../prescription/PrescriptionTracker';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import VoiceAssistant from '../voice/VoiceAssistant';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDemoPrescriptions } from '@/hooks/useDemoPrescriptions';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';

const PrescriptionTrackerPage = () => {
  const { user } = useSupabaseAuth();
  const [patientId, setPatientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  useDemoPrescriptions(); // Créer les ordonnances de démo au chargement

  useEffect(() => {
    const fetchPatientId = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('patients')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;
        
        if (data) {
          setPatientId(data.id);
        }
      } catch (error) {
        console.error('Error fetching patient:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientId();
  }, [user?.id]);

  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={handleBack}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Suivi de Traitement</h1>
        <p className="text-gray-600">Gérez vos ordonnances et suivez votre traitement</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Chargement...</span>
        </div>
      ) : !patientId ? (
        <Alert>
          <AlertDescription>
            Aucun profil patient trouvé. Veuillez créer votre profil patient d'abord.
          </AlertDescription>
        </Alert>
      ) : (
        <PrescriptionTracker patientId={patientId} />
      )}

      <VoiceAssistant onNavigate={() => {}} />
    </div>
  );
};

export default PrescriptionTrackerPage;
