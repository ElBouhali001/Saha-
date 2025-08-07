
import React from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import LoginForm from './auth/LoginForm';
import MainLayout from './layout/MainLayout';
import { Loader2 } from 'lucide-react';

const MainApp = () => {
  const { user, isAuthenticated, isLoading } = useSupabaseAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <LoginForm />;
  }

  return <MainLayout />;
};

export default MainApp;
