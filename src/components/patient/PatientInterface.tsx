
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
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Espace Patient</h1>
        <p className="text-gray-600">Gérez vos rendez-vous, consultations et dossier médical</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="appointments" className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Rendez-vous</span>
          </TabsTrigger>
          <TabsTrigger value="records" className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Dossier Médical</span>
          </TabsTrigger>
          <TabsTrigger value="prescriptions" className="flex items-center space-x-2">
            <Pill className="w-4 h-4" />
            <span>Ordonnances</span>
          </TabsTrigger>
          <TabsTrigger value="prescription-tracker" className="flex items-center space-x-2">
            <Pill className="w-4 h-4" />
            <span>Suivi Traitement</span>
          </TabsTrigger>
          <TabsTrigger value="teleconsultation" className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>Téléconsultation</span>
          </TabsTrigger>
          <TabsTrigger value="guardianship" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Tutelle</span>
          </TabsTrigger>
          <TabsTrigger value="primary-doctor" className="flex items-center space-x-2">
            <UserCheck className="w-4 h-4" />
            <span>Médecin Traitant</span>
          </TabsTrigger>
          <TabsTrigger value="lab-requirements" className="flex items-center space-x-2">
            <FlaskConical className="w-4 h-4" />
            <span>Prérequis Analyses</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="appointments" className="space-y-6">
          <AppointmentBooking />
        </TabsContent>

        <TabsContent value="records" className="space-y-6">
          <MedicalRecordsView />
        </TabsContent>

        <TabsContent value="prescriptions" className="space-y-6">
          <PrescriptionHistory prescriptions={prescriptions} />
        </TabsContent>

        <TabsContent value="prescription-tracker" className="space-y-6">
          {user?.id && <PrescriptionTracker patientId={user.id} />}
        </TabsContent>

        <TabsContent value="teleconsultation" className="space-y-6">
          <TeleconsultationModule />
        </TabsContent>

        <TabsContent value="guardianship" className="space-y-6">
          <PatientGuardianship />
        </TabsContent>

        <TabsContent value="primary-doctor" className="space-y-6">
          <PrimaryDoctorRequest />
        </TabsContent>

        <TabsContent value="lab-requirements" className="space-y-6">
          <LabRequirements />
        </TabsContent>
      </Tabs>

      {/* Assistant Vocal */}
      <VoiceAssistant onNavigate={handleVoiceNavigation} />
    </div>
  );
};

export default PatientInterface;
