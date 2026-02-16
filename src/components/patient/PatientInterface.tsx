
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, FileText, Pill, User, Users, UserCheck, FlaskConical } from 'lucide-react';
import AppointmentBooking from './AppointmentBooking';
import MedicalRecordsView from './MedicalRecordsView';
import PrescriptionHistory from './PrescriptionHistory';
import TeleconsultationModule from './TeleconsultationModule';
import PatientGuardianship from './PatientGuardianship';
import PrimaryDoctorRequest from './PrimaryDoctorRequest';
import LabRequirements from './LabRequirements';
import VoiceAssistant from '../voice/VoiceAssistant';
import { useMockPrescriptions } from '@/hooks/useMockPrescriptions';
import PrescriptionTracker from '../prescription/PrescriptionTracker';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

const PatientInterface = () => {
  const [activeTab, setActiveTab] = useState('appointments');
  const { data: prescriptions = [] } = useMockPrescriptions();
  const { user } = useSupabaseAuth();

  const handleVoiceNavigation = (route: string) => {
    setActiveTab(route);
  };

  return (
    <div className="p-3 md:p-6 max-w-7xl mx-auto overflow-x-hidden">
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 break-words">Espace Patient</h1>
        <p className="text-sm md:text-base text-gray-600 break-words">Gérez vos rendez-vous, consultations et dossier médical</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 md:space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-1">
          <TabsTrigger value="appointments" className="flex items-center justify-center space-x-1 md:space-x-2 text-xs md:text-sm">
            <Calendar className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
            <span className="truncate">Rendez-vous</span>
          </TabsTrigger>
          <TabsTrigger value="records" className="flex items-center justify-center space-x-1 md:space-x-2 text-xs md:text-sm">
            <FileText className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
            <span className="truncate">Dossier</span>
          </TabsTrigger>
          <TabsTrigger value="prescriptions" className="flex items-center justify-center space-x-1 md:space-x-2 text-xs md:text-sm">
            <Pill className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
            <span className="truncate">Ordonnances</span>
          </TabsTrigger>
          <TabsTrigger value="prescription-tracker" className="flex items-center justify-center space-x-1 md:space-x-2 text-xs md:text-sm">
            <Pill className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
            <span className="truncate">Suivi</span>
          </TabsTrigger>
          <TabsTrigger value="teleconsultation" className="flex items-center justify-center space-x-1 md:space-x-2 text-xs md:text-sm">
            <User className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
            <span className="truncate">Téléconsult.</span>
          </TabsTrigger>
          <TabsTrigger value="guardianship" className="flex items-center justify-center space-x-1 md:space-x-2 text-xs md:text-sm">
            <Users className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
            <span className="truncate">Tutelle</span>
          </TabsTrigger>
          <TabsTrigger value="primary-doctor" className="flex items-center justify-center space-x-1 md:space-x-2 text-xs md:text-sm">
            <UserCheck className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
            <span className="truncate">Médecin</span>
          </TabsTrigger>
          <TabsTrigger value="lab-requirements" className="flex items-center justify-center space-x-1 md:space-x-2 text-xs md:text-sm">
            <FlaskConical className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
            <span className="truncate">Analyses</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="appointments" className="space-y-4 md:space-y-6">
          <AppointmentBooking />
        </TabsContent>

        <TabsContent value="records" className="space-y-4 md:space-y-6">
          <MedicalRecordsView />
        </TabsContent>

        <TabsContent value="prescriptions" className="space-y-4 md:space-y-6">
          <PrescriptionHistory prescriptions={prescriptions} />
        </TabsContent>

        <TabsContent value="prescription-tracker" className="space-y-4 md:space-y-6">
          {user?.id && <PrescriptionTracker patientId={user.id} />}
        </TabsContent>

        <TabsContent value="teleconsultation" className="space-y-4 md:space-y-6">
          <TeleconsultationModule />
        </TabsContent>

        <TabsContent value="guardianship" className="space-y-4 md:space-y-6">
          <PatientGuardianship />
        </TabsContent>

        <TabsContent value="primary-doctor" className="space-y-4 md:space-y-6">
          <PrimaryDoctorRequest />
        </TabsContent>

        <TabsContent value="lab-requirements" className="space-y-4 md:space-y-6">
          <LabRequirements />
        </TabsContent>
      </Tabs>

      {/* Assistant Vocal */}
      <VoiceAssistant onNavigate={handleVoiceNavigation} />
    </div>
  );
};

export default PatientInterface;
