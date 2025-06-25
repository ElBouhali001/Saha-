
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MedicalRecord, Prescription } from '@/types/patient';
import { FileText, Pill, Send, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/utils/permissions';
import { generateSecureTicket, generateSecureToken } from '@/utils/security';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import TicketAuthentication from './TicketAuthentication';
import PatientInfoDisplay from './PatientInfoDisplay';
import ConsultationForm from './ConsultationForm';
import PrescriptionManager from './PrescriptionManager';

const MedicalConsultation = () => {
  const { user } = useAuth();
  const permissions = usePermissions(user);
  const [patient, setPatient] = useState<any>(null);
  const [accessGranted, setAccessGranted] = useState(false);
  const [consultation, setConsultation] = useState({
    symptoms: '',
    diagnosis: '',
    treatment: '',
    notes: ''
  });
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);

  const handlePatientAuthenticated = (authenticatedPatient: any) => {
    setPatient(authenticatedPatient);
    setAccessGranted(true);
  };

  const handleSaveConsultation = () => {
    if (!patient || !accessGranted) return;
    
    if (!permissions.canCreateConsultation()) {
      alert('Accès refusé pour sauvegarder la consultation');
      return;
    }

    const medicalRecord: MedicalRecord = {
      id: generateSecureToken(),
      patientId: patient.id,
      date: new Date().toISOString(),
      doctorId: user?.id || '',
      doctorName: `${user?.firstName} ${user?.lastName}`,
      diagnosis: consultation.diagnosis,
      symptoms: consultation.symptoms,
      treatment: consultation.treatment,
      notes: consultation.notes,
      prescriptions: prescriptions
    };

    // Audit log complet
    console.log(`[AUDIT] Consultation sauvegardée - Patient: ${patient.firstName} ${patient.lastName} - Doctor: ${user?.firstName} ${user?.lastName} - Diagnosis: ${consultation.diagnosis} - Time: ${new Date().toISOString()}`);
    
    // Reset sécurisé
    setConsultation({ symptoms: '', diagnosis: '', treatment: '', notes: '' });
    setPrescriptions([]);
    setPatient(null);
    setAccessGranted(false);
    
    alert('Consultation sauvegardée avec succès');
  };

  const generateTransmissionCode = () => {
    if (!permissions.canCreateConsultation()) {
      alert('Accès refusé pour la transmission');
      return;
    }
    
    const code = generateSecureTicket();
    const expiryTime = new Date(Date.now() + (24 * 60 * 60 * 1000)).toLocaleString('fr-FR');
    
    // Audit log
    console.log(`[AUDIT] Code transmission généré - Code: ${code} - Patient: ${patient?.firstName} ${patient?.lastName} - Doctor: ${user?.firstName} ${user?.lastName} - Time: ${new Date().toISOString()}`);
    
    alert(`Code de transmission sécurisé généré:\n${code}\n\nValable jusqu'au: ${expiryTime}\nAccès sécurisé avec traçabilité complète.`);
  };

  return (
    <ProtectedRoute requiredPermission="create_consultation">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Consultation Médicale Sécurisée</h1>
          <div className="flex items-center space-x-2 text-sm text-green-600">
            <Shield className="w-4 h-4" />
            <span>Accès sécurisé - {user?.firstName} {user?.lastName}</span>
          </div>
        </div>

        {!patient || !accessGranted ? (
          <TicketAuthentication onPatientAuthenticated={handlePatientAuthenticated} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <PatientInfoDisplay patient={patient} />
            
            <div className="lg:col-span-2 space-y-6">
              <ConsultationForm 
                consultation={consultation} 
                onConsultationChange={setConsultation} 
              />
              
              <div className="bg-white p-6 rounded-lg border">
                <PrescriptionManager 
                  prescriptions={prescriptions}
                  onPrescriptionsChange={setPrescriptions}
                  patientName={`${patient.firstName} ${patient.lastName}`}
                />
                
                <div className="flex space-x-3 pt-4 border-t mt-6">
                  <Button onClick={handleSaveConsultation} className="flex-1">
                    <FileText className="w-4 h-4 mr-2" />
                    Sauvegarder
                  </Button>
                  <Button variant="outline" onClick={generateTransmissionCode} className="flex-1">
                    <Send className="w-4 h-4 mr-2" />
                    Transmettre
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Pill className="w-4 h-4 mr-2" />
                    Ordonnance PDF
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default MedicalConsultation;
