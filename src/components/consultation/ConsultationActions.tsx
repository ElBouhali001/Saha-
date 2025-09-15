import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  FileText, 
  Calendar, 
  UserSquare2, 
  ChevronDown 
} from 'lucide-react';
import SecureTransmissionModal from '../transmission/SecureTransmissionModal';
import PrescriptionModal from './PrescriptionModal';
import FollowUpModal from './FollowUpModal';

interface ConsultationActionsProps {
  consultationId: string;
  patientName: string;
  patientId?: string;
}

const ConsultationActions: React.FC<ConsultationActionsProps> = ({ 
  consultationId, 
  patientName,
  patientId 
}) => {
  const [showTransmissionModal, setShowTransmissionModal] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50">
            Actions consultation
            <ChevronDown className="w-4 h-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem 
            onClick={() => setShowPrescriptionModal(true)}
            className="cursor-pointer"
          >
            <FileText className="w-4 h-4 mr-2" />
            Rédaction d'ordonnance
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => setShowFollowUpModal(true)}
            className="cursor-pointer"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Rendez-vous de suivi
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => setShowTransmissionModal(true)}
            className="cursor-pointer"
          >
            <UserSquare2 className="w-4 h-4 mr-2" />
            Envoi à un spécialiste
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Modal de transmission sécurisée - spécialistes uniquement */}
      <SecureTransmissionModal
        isOpen={showTransmissionModal}
        onClose={() => setShowTransmissionModal(false)}
        consultationId={consultationId}
        patientName={patientName}
        specialistMode={true}
      />

      {/* Modal d'ordonnance */}
      <PrescriptionModal
        isOpen={showPrescriptionModal}
        onClose={() => setShowPrescriptionModal(false)}
        consultationId={consultationId}
        patientId={patientId}
        patientName={patientName}
      />

      {/* Modal de rendez-vous de suivi */}
      <FollowUpModal
        isOpen={showFollowUpModal}
        onClose={() => setShowFollowUpModal(false)}
        consultationId={consultationId}
        patientId={patientId}
        patientName={patientName}
      />
    </>
  );
};

export default ConsultationActions;