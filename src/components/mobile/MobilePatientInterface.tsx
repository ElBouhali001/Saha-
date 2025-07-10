
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, FileText, Pill, Users, UserCheck, FlaskConical, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import AppointmentBooking from '../patient/AppointmentBooking';
import MedicalRecordsView from '../patient/MedicalRecordsView';
import PrescriptionHistory from '../patient/PrescriptionHistory';
import PatientGuardianship from '../patient/PatientGuardianship';
import PrimaryDoctorRequest from '../patient/PrimaryDoctorRequest';
import LabRequirements from '../patient/LabRequirements';
import VoiceAssistant from '../voice/VoiceAssistant';
import { useMockPrescriptions } from '@/hooks/useMockPrescriptions';

const MobilePatientInterface = () => {
  const [activeTab, setActiveTab] = useState('appointments');
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: prescriptions = [] } = useMockPrescriptions();

  const handleVoiceNavigation = (route: string) => {
    setActiveTab(route);
  };

  const tabs = [
    { id: 'appointments', label: 'Rendez-vous', icon: Calendar },
    { id: 'records', label: 'Dossier', icon: FileText },
    { id: 'prescriptions', label: 'Ordonnances', icon: Pill },
    { id: 'guardianship', label: 'Tutelle', icon: Users },
    { id: 'primary-doctor', label: 'Médecin Traitant', icon: UserCheck },
    { id: 'lab-requirements', label: 'Analyses', icon: FlaskConical }
  ];

  const TabNavigation = ({ isMobile = false }) => (
    <div className={`${isMobile ? 'flex flex-col space-y-2' : 'grid grid-cols-3 gap-2'}`}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'outline'}
            size={isMobile ? 'lg' : 'sm'}
            onClick={() => {
              setActiveTab(tab.id);
              if (isMobile) setMenuOpen(false);
            }}
            className={`${isMobile ? 'justify-start' : 'flex-col h-16'} p-3`}
          >
            <Icon className={`w-4 h-4 ${isMobile ? 'mr-3' : 'mb-1'}`} />
            <span className="text-xs">{tab.label}</span>
          </Button>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header mobile */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">MediPatient</h1>
            <p className="text-sm text-gray-600">Espace Patient</p>
          </div>
          
          {/* Menu hamburger pour mobile */}
          <div className="md:hidden">
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Menu className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="py-6">
                  <h2 className="text-lg font-semibold mb-4">Navigation</h2>
                  <TabNavigation isMobile={true} />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Navigation tablette */}
        <div className="hidden md:block px-4 pb-4">
          <TabNavigation />
        </div>
      </div>

      {/* Contenu principal */}
      <div className="p-4 pb-20 md:pb-4">
        <div className="max-w-4xl mx-auto">
          {activeTab === 'appointments' && <AppointmentBooking />}
          {activeTab === 'records' && <MedicalRecordsView />}
          {activeTab === 'prescriptions' && <PrescriptionHistory prescriptions={prescriptions} />}
          {activeTab === 'guardianship' && <PatientGuardianship />}
          {activeTab === 'primary-doctor' && <PrimaryDoctorRequest />}
          {activeTab === 'lab-requirements' && <LabRequirements />}
        </div>
      </div>

      {/* Navigation bottom mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="grid grid-cols-3 gap-1 p-2">
          {tabs.slice(0, 3).map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab(tab.id)}
                className="flex-col h-16 text-xs"
              >
                <Icon className="w-4 h-4 mb-1" />
                {tab.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Assistant Vocal - adapté mobile */}
      <VoiceAssistant onNavigate={handleVoiceNavigation} className="bottom-24 right-4" />
    </div>
  );
};

export default MobilePatientInterface;
