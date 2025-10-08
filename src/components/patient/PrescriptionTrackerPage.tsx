import React from 'react';
import PrescriptionTracker from '../prescription/PrescriptionTracker';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import VoiceAssistant from '../voice/VoiceAssistant';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDemoPrescriptions } from '@/hooks/useDemoPrescriptions';

const PrescriptionTrackerPage = () => {
  const { user } = useSupabaseAuth();
  useDemoPrescriptions(); // Créer les ordonnances de démo au chargement

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

      {user?.id && <PrescriptionTracker patientId={user.id} />}

      <VoiceAssistant onNavigate={() => {}} />
    </div>
  );
};

export default PrescriptionTrackerPage;
