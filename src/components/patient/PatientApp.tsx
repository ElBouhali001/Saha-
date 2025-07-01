
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import PatientInterface from './PatientInterface';
import MobilePatientInterface from '../mobile/MobilePatientInterface';

const PatientApp = () => {
  const isMobile = useIsMobile();

  // Sur mobile et tablette, utiliser l'interface mobile
  if (isMobile || window.innerWidth <= 1024) {
    return <MobilePatientInterface />;
  }

  // Sur desktop, utiliser l'interface classique
  return <PatientInterface />;
};

export default PatientApp;
