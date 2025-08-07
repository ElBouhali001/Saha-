
import React from 'react';
import PatientApp from '@/components/patient/PatientApp';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import LoginForm from '@/components/auth/LoginForm';

const PatientProfile = () => {
  const { user, isAuthenticated } = useSupabaseAuth();

  // Vérifier si l'utilisateur est connecté et est un patient
  if (!isAuthenticated || !user) {
    return <LoginForm />;
  }

  if (user.user_metadata?.role !== 'patient') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Accès non autorisé</h2>
          <p className="text-gray-600">Cette page est réservée aux patients.</p>
        </div>
      </div>
    );
  }

  return <PatientApp />;
};

export default PatientProfile;
