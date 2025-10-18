import React from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import MVPLogin from './MVPLogin';
import MVPDoctorDashboard from './doctor/MVPDoctorDashboard';
import MVPPatientDashboard from './patient/MVPPatientDashboard';
import { Loader2 } from 'lucide-react';

const MVPApp = () => {
  const { user, isAuthenticated, isLoading } = useSupabaseAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <MVPLogin />;
  }

  // Get role from localStorage for MVP demo or from user metadata
  const demoRole = localStorage.getItem('mvp_demo_role');
  const userRole = demoRole || user?.user_metadata?.role || 'patient';

  return userRole === 'doctor' ? <MVPDoctorDashboard /> : <MVPPatientDashboard />;
};

export default MVPApp;
