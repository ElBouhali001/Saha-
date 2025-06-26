
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import SecureTransmissionModal from '../transmission/SecureTransmissionModal';

interface TransmissionButtonProps {
  consultationId: string;
  patientName: string;
}

const TransmissionButton: React.FC<TransmissionButtonProps> = ({ 
  consultationId, 
  patientName 
}) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button
        onClick={() => setShowModal(true)}
        variant="outline"
        className="text-blue-600 border-blue-200 hover:bg-blue-50"
      >
        <Send className="w-4 h-4 mr-2" />
        Transmettre dossier
      </Button>

      <SecureTransmissionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        consultationId={consultationId}
        patientName={patientName}
      />
    </>
  );
};

export default TransmissionButton;
