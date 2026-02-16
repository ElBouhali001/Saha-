
import React, { useState } from 'react';
import PatientList from './PatientList';
import PatientDetailSheet from './PatientDetailSheet';
import { DemoPatient } from '@/hooks/useDemoPatients';

const PatientManagement = () => {
  const [selectedPatient, setSelectedPatient] = useState<DemoPatient | null>(null);

  const handlePatientSelect = (patient: DemoPatient) => {
    setSelectedPatient(patient);
  };

  const handleCloseDetail = () => {
    setSelectedPatient(null);
  };

  return (
    <div className="p-6">
      <PatientList onPatientSelect={handlePatientSelect} />
      <PatientDetailSheet 
        patient={selectedPatient}
        isOpen={!!selectedPatient}
        onClose={handleCloseDetail}
      />
    </div>
  );
};

export default PatientManagement;
