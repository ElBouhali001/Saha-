
import React from 'react';
import AccessTransmissionForm from '@/components/transmission/AccessTransmissionForm';

const TransmissionAccess = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Accès Sécurisé aux Dossiers Médicaux
          </h1>
          <p className="text-gray-600">
            Plateforme de transmission inter-professionnelle sécurisée
          </p>
        </div>
        
        <AccessTransmissionForm />
        
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>© 2024 MediPatient - Tous droits réservés</p>
          <p>Plateforme certifiée pour la transmission sécurisée de données médicales</p>
        </div>
      </div>
    </div>
  );
};

export default TransmissionAccess;
