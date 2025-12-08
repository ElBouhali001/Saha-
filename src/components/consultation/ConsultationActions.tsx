import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pill, Calendar, UserCheck, FileText } from 'lucide-react';
import SecureTransmissionModal from '@/components/transmission/SecureTransmissionModal';
import PrescriptionModal from './PrescriptionModal';
import FollowUpModal from './FollowUpModal';

interface ConsultationActionsProps {
  consultationId: string;
  patientName: string;
  patientId: string;
  consultation: {
    symptoms: string;
    diagnosis: string;
    treatment: string;
    notes: string;
  };
}

const ConsultationActions: React.FC<ConsultationActionsProps> = ({
  consultationId,
  patientName,
  patientId,
  consultation
}) => {
  const [showTransmissionModal, setShowTransmissionModal] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);

  const actions = [
    {
      id: 'prescription',
      title: 'Rédaction d\'ordonnance',
      description: 'Prescrire des médicaments au patient',
      icon: Pill,
      color: 'text-green-600 border-green-200 hover:bg-green-50',
      onClick: () => setShowPrescriptionModal(true)
    },
    {
      id: 'followup',
      title: 'Rendez-vous de suivi',
      description: 'Programmer un suivi médical régulier',
      icon: Calendar,
      color: 'text-blue-600 border-blue-200 hover:bg-blue-50',
      onClick: () => setShowFollowUpModal(true)
    },
    {
      id: 'specialist',
      title: 'Envoi à un spécialiste',
      description: 'Transmettre le dossier à un médecin spécialisé',
      icon: UserCheck,
      color: 'text-purple-600 border-purple-200 hover:bg-purple-50',
      onClick: () => setShowTransmissionModal(true)
    }
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Actions de consultation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.id}
                  variant="outline"
                  className={`h-auto p-4 flex-col items-center space-y-2 ${action.color} min-h-[120px]`}
                  onClick={action.onClick}
                >
                  <Icon className="w-6 h-6 flex-shrink-0" />
                  <div className="text-center w-full">
                    <div className="font-medium text-sm whitespace-normal break-words">{action.title}</div>
                    <div className="text-xs text-muted-foreground whitespace-normal break-words leading-tight mt-1">
                      {action.description}
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      {showTransmissionModal && (
        <SecureTransmissionModal
          isOpen={showTransmissionModal}
          onClose={() => setShowTransmissionModal(false)}
          consultationId={consultationId}
          patientName={patientName}
          specialistMode={true}
        />
      )}

      {showPrescriptionModal && (
        <PrescriptionModal
          isOpen={showPrescriptionModal}
          onClose={() => setShowPrescriptionModal(false)}
          consultationId={consultationId}
          patientName={patientName}
          patientId={patientId}
          consultation={consultation}
        />
      )}

      {showFollowUpModal && (
        <FollowUpModal
          isOpen={showFollowUpModal}
          onClose={() => setShowFollowUpModal(false)}
          consultationId={consultationId}
          patientName={patientName}
          patientId={patientId}
        />
      )}
    </>
  );
};

export default ConsultationActions;